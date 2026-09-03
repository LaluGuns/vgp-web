package com.virzyguns.flow;

import android.Manifest;
import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageInfo;
import android.net.Uri;
import android.os.BatteryManager;
import android.os.Build;
import android.view.WindowManager;

import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

@CapacitorPlugin(
  name = "FlowNative",
  permissions = {
    @Permission(alias = "notifications", strings = { Manifest.permission.POST_NOTIFICATIONS })
  }
)
public class FlowNativePlugin extends Plugin {
  private static final String CALLBACK_SCHEME = "com.virzyguns.flow";

  @PluginMethod
  public void getPlatformContext(PluginCall call) {
    JSObject out = new JSObject();
    out.put("platform", "android");
    out.put("charging", isCharging());
    try {
      PackageInfo info = getContext().getPackageManager().getPackageInfo(getContext().getPackageName(), 0);
      out.put("appVersion", info.versionName == null ? "" : info.versionName);
      long buildNumber = Build.VERSION.SDK_INT >= Build.VERSION_CODES.P ? info.getLongVersionCode() : info.versionCode;
      out.put("buildNumber", String.valueOf(buildNumber));
    } catch (Exception ignored) {
      out.put("appVersion", "");
      out.put("buildNumber", "");
    }
    call.resolve(out);
  }

  @PluginMethod
  public void openExternal(PluginCall call) {
    String raw = call.getString("url");
    if (raw == null || raw.isBlank()) {
      call.reject("url is required");
      return;
    }
    Uri uri;
    try {
      uri = Uri.parse(raw);
    } catch (Exception error) {
      call.reject("invalid url");
      return;
    }
    String scheme = uri.getScheme();
    if (!("https".equalsIgnoreCase(scheme) || "http".equalsIgnoreCase(scheme))) {
      call.reject("only http(s) URLs may be opened externally");
      return;
    }
    Intent intent = new Intent(Intent.ACTION_VIEW, uri);
    intent.addCategory(Intent.CATEGORY_BROWSABLE);
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    try {
      getContext().startActivity(intent);
      call.resolve();
    } catch (Exception error) {
      call.reject("no application can open this URL", error);
    }
  }

  @PluginMethod
  public void requestNotificationPermission(PluginCall call) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) {
      JSObject out = new JSObject();
      out.put("granted", true);
      call.resolve(out);
      return;
    }
    if (getPermissionState("notifications") == PermissionState.GRANTED) {
      JSObject out = new JSObject();
      out.put("granted", true);
      call.resolve(out);
      return;
    }
    requestPermissionForAlias("notifications", call, "notificationPermissionCallback");
  }

  @PermissionCallback
  private void notificationPermissionCallback(PluginCall call) {
    JSObject out = new JSObject();
    out.put("granted", getPermissionState("notifications") == PermissionState.GRANTED);
    call.resolve(out);
  }

  @PluginMethod
  public void setKeepScreenOn(PluginCall call) {
    boolean enabled = Boolean.TRUE.equals(call.getBoolean("enabled", false));
    if (getActivity() == null) {
      call.reject("Activity unavailable");
      return;
    }
    getActivity().runOnUiThread(() -> {
      if (enabled) {
        getActivity().getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
      } else {
        getActivity().getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
      }
      call.resolve();
    });
  }

  @PluginMethod
  public void scheduleFocusDeadline(PluginCall call) {
    String id = call.getString("id");
    Long deadline = call.getLong("deadlineEpochMs");
    String title = call.getString("title", "Flow");
    String body = call.getString("body", "Focus session complete.");
    if (id == null || id.isBlank() || deadline == null || deadline <= 0) {
      call.reject("id and deadlineEpochMs are required");
      return;
    }

    AlarmManager alarmManager = (AlarmManager) getContext().getSystemService(Context.ALARM_SERVICE);
    if (alarmManager == null) {
      call.reject("AlarmManager unavailable");
      return;
    }

    PendingIntent pendingIntent = deadlineIntent(id, title, body);
    long triggerAt = Math.max(System.currentTimeMillis() + 1000L, deadline);
    alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, pendingIntent);
    call.resolve();
  }

  @PluginMethod
  public void cancelFocusDeadline(PluginCall call) {
    String id = call.getString("id");
    if (id == null || id.isBlank()) {
      call.reject("id is required");
      return;
    }
    AlarmManager alarmManager = (AlarmManager) getContext().getSystemService(Context.ALARM_SERVICE);
    if (alarmManager != null) alarmManager.cancel(deadlineIntent(id, "", ""));
    call.resolve();
  }

  private PendingIntent deadlineIntent(String id, String title, String body) {
    Intent intent = new Intent(getContext(), FlowNotificationReceiver.class);
    intent.setAction("com.virzyguns.flow.FOCUS_DEADLINE." + id);
    intent.putExtra("flow_notification_id", id);
    intent.putExtra("flow_notification_title", title);
    intent.putExtra("flow_notification_body", body);
    return PendingIntent.getBroadcast(
      getContext(),
      id.hashCode(),
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
    );
  }

  private boolean isCharging() {
    Intent battery = getContext().registerReceiver(null, new IntentFilter(Intent.ACTION_BATTERY_CHANGED));
    if (battery == null) return false;
    int plugged = battery.getIntExtra(BatteryManager.EXTRA_PLUGGED, 0);
    int status = battery.getIntExtra(BatteryManager.EXTRA_STATUS, -1);
    return plugged != 0 || status == BatteryManager.BATTERY_STATUS_CHARGING || status == BatteryManager.BATTERY_STATUS_FULL;
  }
}
