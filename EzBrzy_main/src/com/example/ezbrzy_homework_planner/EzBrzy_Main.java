package com.example.ezbrzy_homework_planner;

import android.os.Bundle;
import android.app.Activity;
import android.view.Menu;

public class EzBrzy_Main extends Activity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_ez_brzy__main);
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.activity_ez_brzy__main, menu);
        return true;
    }
}
