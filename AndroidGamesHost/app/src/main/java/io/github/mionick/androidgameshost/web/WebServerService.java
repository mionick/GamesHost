package io.github.mionick.androidgameshost.web;

import android.app.Service;
import android.content.Intent;
import android.content.res.AssetManager;
import android.net.wifi.WifiManager;
import android.os.Binder;
import android.os.IBinder;
import android.text.TextUtils;
import android.text.format.Formatter;
import android.util.Log;
import android.widget.Toast;

import com.koushikdutta.async.http.body.AsyncHttpRequestBody;
import com.koushikdutta.async.http.body.StringBody;
import com.koushikdutta.async.http.server.AsyncHttpServer;
import com.koushikdutta.async.http.server.AsyncHttpServerResponse;
import com.koushikdutta.async.http.server.HttpServerRequestCallback;

import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.lang.reflect.Array;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;

/**
 *
 */
public class WebServerService extends Service {

    private static String LOG_TAG = "WebServerService";
    private IBinder mBinder = new WebServiceBinder();

    private final ArrayList<AsyncHttpServerResponse> outstandingRequests = new ArrayList<>(10);
    private final ArrayList<String> events = new ArrayList<>(200);


    // TODO: check if port is taken, then increment if it is.
    private final int port = 6006;

    private AsyncHttpServer server;

    public WebServerService() {
        Log.v(LOG_TAG, "in constructor");

    }

    public void stop() {
        if (server != null) {
            server.stop();
            outstandingRequests.clear();
            events.clear();
        }
        server = null;
    }


    public void start() {
        if (server == null) {
            getServer();
            server.listen(port);
        }
    }

    private void getServer() {
        server = new AsyncHttpServer();
        server.get("/api/event/.*", eventApiCallback);
        server.post("/api/event/", postEventApiCallback);

        // Serve files like [a-z].[a-z]
        server.get("/[\\w+/]*[\\w-_%0-9]+\\.\\w+", websiteCallback);

        server.get("/test", (x, y) -> y.send("Server Running!"));


    }

    public String getWifiIp() {
        WifiManager wm = (WifiManager) getApplicationContext().getSystemService(WIFI_SERVICE);
        int ip = wm != null ? wm.getConnectionInfo().getIpAddress() : 0;

        return ip != 0 ? Formatter.formatIpAddress(ip) + ":" + port : "No Wifi Address Found";
    }

    public String getHostIp() {
        return "192.168.43.1:" + port;
    }


    private HttpServerRequestCallback eventApiCallback = (request, response) -> {
        synchronized (this) {

            // They sent the number of the last event they received.
            // If we have more events than they've received, send them the missing ones.
            // Otherwise, add them to the list of people waiting for events.

            // 1) get the event number they sent in their request path:
            // this will be given to us as ?event={number}
            int theirEventNumber = Integer.parseInt(request.getQuery().get("event").get(0));
            Log.v(LOG_TAG, "RECIEVED EVENT REQUEST. NUM: " + theirEventNumber);

            if (theirEventNumber < this.events.size()) {
                // Build a JSON response containing all the events they've missed.
                int difference = this.events.size() - theirEventNumber;
                String[] eventsArray = new String[difference];
                for (int i = theirEventNumber; i < this.events.size(); i++) {
                    eventsArray[i - theirEventNumber] = this.events.get(i);
                }
                response.setContentType("application/json; charset=utf-8");

                Log.v(LOG_TAG, "Responding to request immediately because they were missing events.");
                Log.v(LOG_TAG, "[" + TextUtils.join(",", eventsArray) + "]");
                response.send("[" + TextUtils.join(",", eventsArray) + "]");
            } else {
                // They already had all the events, wait until there's a new one
                Log.v(LOG_TAG, "Adding request to queue.");
                this.outstandingRequests.add(response);
            }
        }
    };

    HttpServerRequestCallback postEventApiCallback = (request, response) -> {
        synchronized (this) {
            StringBody body = (StringBody) request.getBody();

            String responseString = body.get();
            events.add(responseString);

            Log.v(LOG_TAG, "Responding to outstanding requests: " + outstandingRequests.size());
            Log.v(LOG_TAG, "[" + responseString + "]");

            for (AsyncHttpServerResponse otherResponse :
                    this.outstandingRequests) {
                otherResponse.setContentType("application/json; charset=utf-8");
                otherResponse.send("[" + responseString + "]");
            }
            this.outstandingRequests.clear();

            response.send(responseString);
        }
    };


    HttpServerRequestCallback websiteCallback = (request, response) -> {

        AssetManager am = getApplication().getBaseContext().getAssets();
        try {
            try {
                String result = java.net.URLDecoder.decode(request.getPath().substring(1), StandardCharsets.UTF_8.name());
                InputStream stream = am.open(result);
                response.sendStream(stream, stream.available()); // TODO: available was not meant to be used as the total length. Might not work.
            } catch (UnsupportedEncodingException e) {
                // not going to happen - value came from JDK's own StandardCharsets
                Log.v(LOG_TAG, e.toString());
            }
        } catch (IOException e) {
            e.printStackTrace();
            response.code(404);
        }
    };


    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.i(LOG_TAG, "Received Start Foreground Intent ");
        // showNotification();
        start();
        return START_STICKY;
    }

    /*
        private void showNotification() {
            Intent notificationIntent = new Intent(this, MultiPlayerLobbyActivity.class);
            notificationIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK
                    | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            PendingIntent pendingIntent = PendingIntent.getActivity(this, 0,
                    notificationIntent, 0);



            Bitmap icon = BitmapFactory.decodeResource(getResources(),
                    R.drawable.ic_launcher);

            Notification notification = new NotificationCompat.Builder(this)
                    .setContentTitle("Set Server is Running")
                    .setTicker("Set Server")
                    .setContentText("Set Server is Running")
                    .setSmallIcon(R.drawable.ic_launcher)
                    //.setLargeIcon(Bitmap.createScaledBitmap(icon, 128, 128, false))
                    .setContentIntent(pendingIntent)
                    .setOngoing(true)
                    .build();
            startForeground(1,
                    notification);

        }
    */
    @Override
    public void onCreate() {
        super.onCreate();
        Log.v(LOG_TAG, "in onCreate");
    }

    @Override
    public IBinder onBind(Intent intent) {
        Log.v(LOG_TAG, "in onBind");
        return mBinder;
    }

    @Override
    public void onRebind(Intent intent) {
        Log.v(LOG_TAG, "in onRebind");
        super.onRebind(intent);
    }

    @Override
    public boolean onUnbind(Intent intent) {
        Log.v(LOG_TAG, "in onUnbind");
        return true;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        Log.v(LOG_TAG, "in onDestroy");
        Toast.makeText(this, "Set Server Stopped.", Toast.LENGTH_SHORT).show();
        stop();
    }

    public class WebServiceBinder extends Binder {
        public WebServerService getService() {
            return WebServerService.this;
        }
    }

}
