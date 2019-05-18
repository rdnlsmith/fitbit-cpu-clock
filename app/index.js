import { me } from "appbit";
import clock from "clock";
import document from "document";
import * as fs from "fs";
import * as messaging from "messaging";
import { preferences } from "user-settings";
import * as util from "./utils";
import { HeartRateSensor } from "heart-rate";
import { display } from "display";

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
    drawDigit(Math.floor(val / 10), hours1);
  } else {
    drawDigit("", hours1);
  }
  drawDigit(Math.floor(val % 10), hours2);
}

function setMins(val) {
  drawDigit(Math.floor(val / 10), mins1);
  drawDigit(Math.floor(val % 10), mins2);
}

function setDate(val) {
  drawDateDigit(Math.floor(val / 10), date1);
  drawDateDigit(Math.floor(val % 10), date2);
}

function setDay(val) {
  day.image = getDayImg(val);
}

function setHeartRate(val) {
  drawDateDigit(val % 10, hr3);
  val = Math.floor(val / 10);

  drawDateDigit(val % 10, hr2);
  val = Math.floor(val / 10);

  drawDateDigit(val % 10, hr1);
}

function drawDigit(val, place) {
  place.image = `numerals/${val}.png`;
}

function drawDateDigit(val, place) {
  place.image = `quantifier/${val}.png`
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
