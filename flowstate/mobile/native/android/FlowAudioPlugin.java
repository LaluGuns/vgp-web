package com.virzyguns.flow;

import android.content.ComponentName;
import android.net.Uri;

import androidx.core.content.ContextCompat;
import androidx.media3.common.MediaItem;
import androidx.media3.common.MediaMetadata;
import androidx.media3.common.Player;
import androidx.media3.session.MediaController;
import androidx.media3.session.SessionToken;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.common.util.concurrent.ListenableFuture;

import java.util.concurrent.ExecutionException;
import java.util.function.Consumer;

@CapacitorPlugin(name = "FlowAudio")
public class FlowAudioPlugin extends Plugin {
  private ListenableFuture<MediaController> controllerFuture;
  private MediaController controller;

  @Override
  public void load() {
    super.load();
    connectController();
  }

  @Override
  protected void handleOnDestroy() {
    if (controllerFuture != null) {
      MediaController.releaseFuture(controllerFuture);
      controllerFuture = null;
    }
    controller = null;
    super.handleOnDestroy();
  }

  @PluginMethod
  public void load(PluginCall call) {
    String rawUrl = call.getString("url");
    String cacheKey = call.getString("cacheKey");
    String title = call.getString("title", "Flow");
    String artist = call.getString("artist", "Virzy Guns Production");
    if (!isAllowedMediaUrl(rawUrl) || cacheKey == null || cacheKey.isBlank()) {
      call.reject("A valid HTTPS url and cacheKey are required");
      return;
    }

    withController(call, mediaController -> {
      MediaMetadata metadata = new MediaMetadata.Builder()
        .setTitle(title)
        .setArtist(artist)
        .build();
      MediaItem item = new MediaItem.Builder()
        .setMediaId(cacheKey)
        .setUri(Uri.parse(rawUrl))
        .setMediaMetadata(metadata)
        .build();
      mediaController.setMediaItem(item);
      mediaController.prepare();
      call.resolve();
    });
  }

  @PluginMethod
  public void play(PluginCall call) {
    withController(call, mediaController -> {
      mediaController.play();
      call.resolve();
    });
  }

  @PluginMethod
  public void pause(PluginCall call) {
    withController(call, mediaController -> {
      mediaController.pause();
      call.resolve();
    });
  }

  @PluginMethod
  public void seek(PluginCall call) {
    Double seconds = call.getDouble("seconds");
    if (seconds == null || !Double.isFinite(seconds) || seconds < 0) {
      call.reject("seconds must be finite and non-negative");
      return;
    }
    withController(call, mediaController -> {
      mediaController.seekTo((long) Math.floor(seconds * 1000.0));
      call.resolve();
    });
  }

  @PluginMethod
  public void setVolume(PluginCall call) {
    Double value = call.getDouble("value");
    if (value == null || !Double.isFinite(value)) {
      call.reject("value must be finite");
      return;
    }
    float volume = (float) Math.max(0.0, Math.min(1.0, value));
    withController(call, mediaController -> {
      mediaController.setVolume(volume);
      call.resolve();
    });
  }

  @PluginMethod
  public void getState(PluginCall call) {
    withController(call, mediaController -> {
      long duration = mediaController.getDuration();
      JSObject out = new JSObject();
      out.put("currentSeconds", Math.max(0L, mediaController.getCurrentPosition()) / 1000.0);
      out.put("durationSeconds", duration > 0 && duration != Player.TIME_UNSET ? duration / 1000.0 : 0.0);
      out.put("playing", mediaController.isPlaying());
      out.put("ended", mediaController.getPlaybackState() == Player.STATE_ENDED);
      call.resolve(out);
    });
  }

  @PluginMethod
  public void stop(PluginCall call) {
    withController(call, mediaController -> {
      mediaController.stop();
      mediaController.clearMediaItems();
      call.resolve();
    });
  }

  private void connectController() {
    if (controller != null || controllerFuture != null) return;
    SessionToken token = new SessionToken(getContext(), new ComponentName(getContext(), FlowPlaybackService.class));
    controllerFuture = new MediaController.Builder(getContext(), token).buildAsync();
    controllerFuture.addListener(() -> {
      try {
        controller = controllerFuture.get();
      } catch (ExecutionException | InterruptedException error) {
        if (error instanceof InterruptedException) Thread.currentThread().interrupt();
        controller = null;
      }
    }, ContextCompat.getMainExecutor(getContext()));
  }

  private void withController(PluginCall call, Consumer<MediaController> action) {
    if (controller != null) {
      action.accept(controller);
      return;
    }
    connectController();
    ListenableFuture<MediaController> future = controllerFuture;
    if (future == null) {
      call.reject("Flow audio service is unavailable");
      return;
    }
    future.addListener(() -> {
      try {
        MediaController ready = future.get();
        controller = ready;
        action.accept(ready);
      } catch (ExecutionException error) {
        call.reject("Unable to connect to Flow audio service", error.getCause());
      } catch (InterruptedException error) {
        Thread.currentThread().interrupt();
        call.reject("Flow audio connection interrupted", error);
      }
    }, ContextCompat.getMainExecutor(getContext()));
  }

  private boolean isAllowedMediaUrl(String rawUrl) {
    if (rawUrl == null || rawUrl.isBlank()) return false;
    try {
      Uri uri = Uri.parse(rawUrl);
      return "https".equalsIgnoreCase(uri.getScheme()) && uri.getHost() != null && !uri.getHost().isBlank();
    } catch (Exception ignored) {
      return false;
    }
  }
}
