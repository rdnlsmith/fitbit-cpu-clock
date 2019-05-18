import { me } from "appbit";
import clock from "clock";
import document from "document";
import * as fs from "fs";
import * as messaging from "messaging";
import { preferences } from "user-settings";
import * as util from "./utils";
import { HeartRateSensor } from "heart-rate";
import { display } from "display";
import { today } from "user-activity";

// const SETTINGS_TYPE = "cbor";
// const SETTINGS_FILE = "settings.cbor";

// let settings = loadSettings();
// applyTheme(settings.background, settings.foreground);

// TIME
let hours1 = document.getElementById("hours1");
let hours2 = document.getElementById("hours2");
let mins1 = document.getElementById("mins1");
let mins2 = document.getElementById("mins2");

// DATE
let day = document.getElementById("day");
let date1 = document.getElementById("date1");
let date2 = document.getElementById("date2");

// Heart Rate
let hr1 = document.getElementById("hr1");
let hr2 = document.getElementById("hr2");
let hr3 = document.getElementById("hr3");

// Activity
let actContainer = document.getElementById("act-container");
let actIcon = document.getElementById("act-icon");
let act1 = document.getElementById("act1");
let act2 = document.getElementById("act2");
let act3 = document.getElementById("act3");
let act4 = document.getElementById("act4");
let act5 = document.getElementById("act5");
let act6 = document.getElementById("act6");

clock.granularity = "seconds";

clock.ontick = evt => {
  let d = evt.date;

  // DATE
  setDate(d.getDate());

  // DAY NAME
  setDay(d.getDay());

  // HOURS
  let hours = d.getHours();
  if (preferences.clockDisplay === "12h") {
    // 12h format
    hours = hours % 12 || 12;
  } else {
    // 24h format
    hours = util.zeroPad(hours);
  }
  setHours(hours);

  // MINUTES
  let minute = ("0" + d.getMinutes()).slice(-2);
  setMins(minute);

  if (me.permissions.granted("access_activity")) {
    actIcon.style.visibility = "visible";
    act1.style.visibility = "visible";
    act2.style.visibility = "visible";
    act3.style.visibility = "visible";
    act4.style.visibility = "visible";
    act5.style.visibility = "visible";
    act6.style.visibility = "visible";
    setActivity("steps", today.adjusted.steps);
  } else {
    actIcon.style.visibility = "hidden";
    act1.style.visibility = "hidden";
    act2.style.visibility = "hidden";
    act3.style.visibility = "hidden";
    act4.style.visibility = "hidden";
    act5.style.visibility = "hidden";
    act6.style.visibility = "hidden";
  }
}

if (HeartRateSensor && me.permissions.granted("access_heart_rate")) {
  let hrm = new HeartRateSensor({ frequency: 1 });
  hrm.addEventListener("reading", () => {
    setHeartRate(hrm.heartRate);
  });
  display.addEventListener("change", () => {
    display.on ? hrm.start() : hrm.stop();
  });
  hrm.start();
} else {
  hr1.style.visibility = "hidden";
  hr2.style.visibility = "hidden";
  hr3.style.visibility = "hidden";
}

// Apply theme colors to elements
function applyTheme(background, foreground) {
  let items = document.getElementsByClassName("background");
  items.forEach(function(item) {
    item.style.fill = background;
  });
  let items = document.getElementsByClassName("foreground");
  items.forEach(function(item) {
    item.style.fill = foreground;
  });
  settings.background = background;
  settings.foreground = foreground;
}

function setHours(val) {
  if (val > 9) {
    drawNumeral(Math.floor(val / 10), hours1);
  } else {
    drawNumeral("", hours1);
  }
  drawNumeral(Math.floor(val % 10), hours2);
}

function setMins(val) {
  drawNumeral(Math.floor(val / 10), mins1);
  drawNumeral(Math.floor(val % 10), mins2);
}

function setDate(val) {
  drawDigit(Math.floor(val / 10), date1);
  drawDigit(Math.floor(val % 10), date2);
}

function setDay(val) {
  let days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  let dayName = days[val];
  day.image = `quantifier/${dayName}.png`;
  if (dayName === "sun" || dayName === "tue" || dayName === "thu") {
    day.width = 61;
  } else if (dayName === "fri") {
    day.width = 49;
  } else if (dayName === "sat") {
    day.width = 60;
  } else {
    day.width = 66;
  }
}

function setHeartRate(val) {
  let digits = [hr1, hr2, hr3];
  let lastNonZeroIndex = 3;

  for (let i = 2; i >= 0; i--) {
    let digit = val % 10;
    val = Math.floor(val / 10);

    if (digit != 0) {
      lastNonZeroIndex = i;
    }

    drawDigit(digit, digits[i]);
    digits[i].style.opacity = 1;
  }

  // Darken leading zeroes
  for (let i = 0; i < lastNonZeroIndex; i++)
  {
    digits[i].style.opacity = 0.2;
  }
}

function setActivity(activity, val) {
  // Can't rely on $+ syntax because text is right-aligned.
  // Move container closer to edge for each 1; all other digits are the same width.
  let position = 140;
  actIcon.image = `icons/stat_${activity}_solid_24px.png`;

  let digits = [act1, act2, act3, act4, act5, act6];
  let lastNonZeroIndex = 6;

  for (let i = 5; i >= 0; i--) {
    let digit = val % 10;
    val = Math.floor(val / 10);

    if (digit != 0) {
      lastNonZeroIndex = i;
    }

    if (digit == 1) {
      position += 7;
    }

    drawDigit(digit, digits[i]);
    digits[i].style.opacity = 1;
  }

  // Darken leading zeroes
  for (let i = 0; i < lastNonZeroIndex; i++)
  {
    digits[i].style.opacity = 0.2;
  }

  actContainer.x = position;
}

function drawNumeral(val, place) {
  place.image = `numerals/${val}.png`;
}

function drawDigit(val, place) {
  place.image = `quantifier/${val}.png`
  if (val == 1) {
    place.width = 11;
  } else {
    place.width = 18;
  }
}

function getDayImg(index) {
  let days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return `quantifier/${days[index]}.png`;
}

// Listen for the onmessage event
// messaging.peerSocket.onmessage = evt => {
//   applyTheme(evt.data.background, evt.data.foreground);
// }

// Register for the unload event
// me.onunload = saveSettings;

function loadSettings() {
  try {
    return fs.readFileSync(SETTINGS_FILE, SETTINGS_TYPE);
  } catch (ex) {
    // Defaults
    return {
      background: "#000000",
      foreground: "#FFFFFF"
    }
  }
}

function saveSettings() {
  fs.writeFileSync(SETTINGS_FILE, settings, SETTINGS_TYPE);
}
