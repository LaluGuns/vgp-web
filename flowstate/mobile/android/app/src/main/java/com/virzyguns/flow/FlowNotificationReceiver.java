package com.virzyguns.flow;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

public class FlowNotificationReceiver extends BroadcastReceiver {
  private static final String CHANNEL_ID = "flow_focus_timer";

  @Override
  public void onReceive(Context context, Intent intent) {
    createChannel(context);

    String id = intent.getStringExtra("flow_notification_id");
    String title = intent.getStringExtra("flow_notification_title");
    String body = intent.getStringExtra("flow_notification_body");
    if (id == null || id.isBlank()) id = "focus";
    if (title == null || title.isBlank()) title = "Flow";
    if (body == null || body.isBlank()) body = "Focus session complete.";

    Intent openIntent = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
    PendingIntent contentIntent = null;
    if (openIntent != null) {
      openIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
      contentIntent = PendingIntent.getActivity(
        context,
        id.hashCode(),
        openIntent,
        PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
      );
    }

    NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
      .setSmallIcon(context.getApplicationInfo().icon)
      .setContentTitle(title)
      .setContentText(body)
      .setPriority(NotificationCompat.PRIORITY_HIGH)
      .setAutoCancel(true)
      .setCategory(NotificationCompat.CATEGORY_REMINDER)
      .setVisibility(NotificationCompat.VISIBILITY_PUBLIC);
    if (contentIntent != null) builder.setContentIntent(contentIntent);

    try {
      NotificationManagerCompat.from(context).notify(id.hashCode(), builder.build());
    } catch (SecurityException ignored) {
      // Android 13+ may deny notifications. Timer state remains authoritative in-app.
    }
  }

  private static void createChannel(Context context) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
    NotificationManager manager = context.getSystemService(NotificationManager.class);
    if (manager == null) return;
    NotificationChannel channel = new NotificationChannel(
      CHANNEL_ID,
      "Focus timer",
      NotificationManager.IMPORTANCE_HIGH
    );
    channel.setDescription("Flow focus-session completion alerts");
    manager.createNotificationChannel(channel);
  }
}
