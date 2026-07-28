package com.rihla.app;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import androidx.appcompat.app.AppCompatActivity;

public class SplashActivity extends AppCompatActivity {

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.splash_activity);

    new Handler(Looper.getMainLooper()).postDelayed(() -> {
      startActivity(new Intent(this, MainActivity.class));
      finish();
      overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out);
    }, 2200);
  }
}
