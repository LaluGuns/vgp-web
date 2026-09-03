package com.virzyguns.flow;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    registerPlugin(FlowNativePlugin.class);
    registerPlugin(FlowBillingPlugin.class);
    registerPlugin(FlowAudioPlugin.class);
    super.onCreate(savedInstanceState);
  }
}
