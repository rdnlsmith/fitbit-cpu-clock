// Add zero in front of numbers < 10
export function zeroPad(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

export function drawDigit(val, place) {
  place.image = `quantifier/${val}.png`
  if (val == 1) {
    place.width = 11;
  } else {
    place.width = 18;
  }
}
