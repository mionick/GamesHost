package io.github.mionick.androidgameshost.web;

import android.app.Notification;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.res.AssetManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.wifi.WifiManager;
import android.os.Binder;
import android.os.IBinder;
import android.support.v4.app.NotificationCompat;
import android.text.format.Formatter;
import android.util.Log;
import android.widget.Toast;

import com.koushikdutta.async.http.server.AsyncHttpServer;
import com.koushikdutta.async.http.server.HttpServerRequestCallback;

import java.io.IOException;
import java.io.InputStream;

/**
 *
 */
public class WebServerService extends Service {

    // TODO: Why make this specific to DC?
    private static String LOG_TAG = "WebServerService";
    private IBinder mBinder = new WebServiceBinder();

    // TODO: check if port is taken, then increment if it is.
    private final int port = 6006;


    private AsyncHttpServer server;

    public WebServerService() {
        Log.v(LOG_TAG, "in constructor");

    }
    public void stop() {
        if (server != null) {
            server.stop();
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
        server.get("/api/event/.*", eventApiCallback );
        server.get("/api/connection/", connectionApiCallback );
        server.post("/api/user/", registerRequestApiCallback);
        server.post("/api/input/", postInputApiCallback );

        // Serve files like [a-z].[a-z]
        server.get("/\\w+\\.\\w+", websiteCallback );

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
        // They sent the number of the last event they received.
        // If we have more events than they've received, send them the missing ones.
        // Otherwise, add them to the list of people waiting for events.

        // 1) get the event number they sent in their request path:
        // this will be given to us as ?event={number}
//        int theirEventNumber = Integer.parseInt(request.getQuery().get("event").get(0));
//        Log.v(LOG_TAG, "RECIEVED EVENT REQUEST. NUM: " + theirEventNumber);
//
//        if (theirEventNumber < this.events.size()) {
//            // Build a JSON response containing all the events they've missed.
//            int difference = this.events.size() - theirEventNumber;
//            EventInstance[] eventsArray = new EventInstance[difference];
//            for (int i = theirEventNumber; i < this.events.size(); i++) {
//                eventsArray[i-theirEventNumber] = this.events.get(i);
//            }
//
//            String jsonResponse = gson.toJson(eventsArray);
//            response.send(jsonResponse);
//
//        } else {
//            synchronized (this.outstandingRequests) {
//                this.outstandingRequests.add(response);
//            }
//        }
    };

    HttpServerRequestCallback registerRequestApiCallback = (request, response) -> {
        Log.v(LOG_TAG, "register request");

//
//        try {
//            JSONObject theirInput = ((AsyncHttpRequestBody<JSONObject>)request.getBody()).get();
//
//            // Identifier is meant t be used to prevent duplicate names
//            //String identifier = theirInput.getString("identifier");
//            String name = theirInput.getString("name");
//            Log.v(LOG_TAG, name);
///*
//            try {
//                name =
//                        new String(name.getBytes(), "UTF16") + " " +
//                                new String(name.getBytes(), "UTF8") + " " +
//                                        new String(name.getBytes(), "UTF32");
//            } catch (UnsupportedEncodingException e) {
//                e.printStackTrace();
//            }
//*/
//
//
//            if (registeredUsers.containsKey(name)) {
//                response.send(gson.toJson(new EventInstance<CommunicationEvent>(CommunicationEvent.NAME_TAKEN)));
//                Log.v(LOG_TAG, "Send NAME_TAKEN");
//                return;
//            } else if (!gameStarted) {
//                {
//                    registeredUsers.put(name, true);
//                    players.add(name);
//                    Log.v(LOG_TAG, "Adding them to the list.");
//                    EventInstance event = new EventInstance<CommunicationEvent>(CommunicationEvent.PLAYER_JOINED, name);
//                    OnGameEvent(event);
//                    onPlayerAdded();
//                    Log.v(LOG_TAG, "Added them to the list.");
//
//                }
//            } else {
//                // Not in list and game started
//                registeredUsers.put(name, false);
//                players.add(name);
//                Log.v(LOG_TAG, "Adding them to the list with false.");
//                EventInstance event = new EventInstance<CommunicationEvent>(CommunicationEvent.GAME_IN_PROGRESS, name);
//                OnGameEvent(event);
//                onPlayerAdded();
//                Log.v(LOG_TAG, "Added them to the list with false.");
//                response.send(gson.toJson(event));
//                return;
//            }
//        } catch (JSONException e) {
//            response.code(500).send("Not Registered!");
//            Log.v(LOG_TAG, "Send 500");
//            e.printStackTrace();
//        }
//        response.send(gson.toJson(new EventInstance<CommunicationEvent>(CommunicationEvent.JOINED_SUCCESSFULLY)));
//        Log.v(LOG_TAG, "Send JOINED_SUCCESSFULLY");

    };

    HttpServerRequestCallback postInputApiCallback = (request, response) -> {
        // IF they are registered in the current game session
        // TODO: take latency into account for that user, use the input that comes first on the game.
        // use this.selectCardsHandler
//        AsyncHttpRequestBody<JSONObject> body = (AsyncHttpRequestBody<JSONObject>)request.getBody();
//
//        try {
//            JSONObject theirInput = body.get();
//
//
//            String identifier = theirInput.getString("name");
//
//            // if they registered and were allowed in the game
//            if (registeredUsers.containsKey(identifier) && registeredUsers.get(identifier)) {
//                // They are allowed to make inputs.
//                // Get the indexes of the cards they chose.
//                String name = theirInput.getString("name");
//                JSONArray inputs = theirInput.getJSONArray("selectedCards");
//
//                IntTriple triple = new IntTriple();
//                triple.setInt1(inputs.getInt(0));
//                triple.setInt2(inputs.getInt(1));
//                triple.setInt3(inputs.getInt(2));
//                this.selectCardsHandler.SelectSet(name, triple);
//            }
//        } catch (JSONException e) {
//            response.code(500).send("Input failed!");
//            e.printStackTrace();
//        }
//
//        response.send("Ok.");
    };


    HttpServerRequestCallback websiteCallback = (request, response) -> {

        AssetManager am = getApplication().getBaseContext().getAssets();
        try {
            InputStream stream = am.open(request.getPath().substring(1));
            response.sendStream(stream, stream.available()); // TODO: available was not meant to be used as the total length. Might not work.
        } catch (IOException e) {
            e.printStackTrace();
            response.code(404);
        }
    };


    HttpServerRequestCallback connectionApiCallback = (request, response) -> {


        // Send the two ip addresses, our local wifi and the android hotspot one
        //response.send(gson.toJson(new EventInstance<CommunicationEvent>(CommunicationEvent.COMMUNICATION, getWifiIp() , getHostIp())));
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
