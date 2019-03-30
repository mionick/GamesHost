package io.github.mionick.androidgameshost;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.IBinder;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.TextView;

import io.github.mionick.androidgameshost.web.WebServerService;

/**
 * All this activity has to do is start the service, and give the ability to send the Link to Other people.
 *
 */
public class MainActivity extends AppCompatActivity {

    WebServerService webServerService;
    boolean serviceBound = false;
    String wifiIp = "";
    String hostIp = "";


    // Lifecycle Methods
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
    }

    @Override
    protected void onStart() {
        super.onStart();
        startWebServer(null);

    }


    @Override
    protected void onDestroy() {
        super.onDestroy();

        // Unbind the service if it's bound
        if (serviceBound) {
            unbindService(mServiceConnection);
            serviceBound = false;
        }
    }

    // Other Methods

    public void shareWifi(View view) {
        Intent sendIntent = new Intent();
        sendIntent.setAction(Intent.ACTION_SEND);
        sendIntent.putExtra(Intent.EXTRA_TEXT, wifiIp);
        sendIntent.setType("text/plain");
        startActivity(sendIntent);
    }

    public void shareHost(View view) {
        Intent sendIntent = new Intent();
        sendIntent.setAction(Intent.ACTION_SEND);
        sendIntent.putExtra(Intent.EXTRA_TEXT, hostIp);
        sendIntent.setType("text/plain");
        startActivity(sendIntent);
    }

    // ======================= SERVICE METHODS =======================

    // Note, these start and stop the server, not the android service.
    // That service never stops.
    public void stopWebServer(View v) {
        if (serviceBound) {
            unbindService(mServiceConnection);
            serviceBound = false;
        }
        Intent intent = new Intent(this, WebServerService.class);
        stopService(intent);
    }

    // Safe to call more than once.
    public void startWebServer(View v) {
        Intent intent = new Intent(this, WebServerService.class);
        // Start and bind the service, it will run indefinitely in the background and not stop until all components are unbound and stop is called.
        startService(intent);
        bindService(intent, mServiceConnection, Context.BIND_AUTO_CREATE);

    }

    /**
     * Needed to bind to a service. Boiler Plate code.
     */
    private ServiceConnection mServiceConnection = new ServiceConnection() {

        @Override
        public void onServiceDisconnected(ComponentName name) {

            serviceBound = false;

            ((TextView)findViewById(R.id.wifiIp)).setText("Server Not Running.");
            ((TextView)findViewById(R.id.hostIp)).setText("");

        }

        @Override
        public void onServiceConnected(ComponentName name, IBinder service) {
            WebServerService.WebServiceBinder binder = (WebServerService.WebServiceBinder) service;
            webServerService = binder.getService();
            serviceBound = true;

            // Can't know the port until the service actually starts, so have to do this here.
            wifiIp = webServerService.getWifiIp() + "/index.html";
            hostIp = webServerService.getHostIp() + "/index.html";

            ((TextView)findViewById(R.id.wifiIp)).setText("If on same Wifi: " + wifiIp);
            ((TextView)findViewById(R.id.hostIp)).setText("If hosting hotspot: " + hostIp);
        }


    };
}
