var hud = {
    speed:            { value: null, dom: Dom.get('speed_value')            },
    current_lap_time: { value: null, dom: Dom.get('current_lap_time_value') },
    last_lap_time:    { value: null, dom: Dom.get('last_lap_time_value')    },
    fast_lap_time:    { value: null, dom: Dom.get('fast_lap_time_value')    }
  }
function updateHud(key, value) { // accessing DOM can be slow, so only do it if value has changed
    if (hud[key].value !== value) {
      hud[key].value = value;
      Dom.set(hud[key].dom, value);
    }
  }