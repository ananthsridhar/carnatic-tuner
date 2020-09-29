import {CARNATIC_NOTES,WESTERN_NOTES} from "./Constants";


// Get Hash of Carnatic-Western Note mapping. Default base frequency of A4 - 440Hz
export const getCarnaticNotes = function (baseWesternNote, baseFreq = 440) {
  let carnaticMap = [];
  let baseOctave = baseWesternNote.slice(-1);
  let baseChord = baseWesternNote.slice(0,baseWesternNote.length-1);
  let offset = WESTERN_NOTES.findIndex(n=>n===baseChord);
  let offsetWNoteArray = WESTERN_NOTES.slice(offset).concat(WESTERN_NOTES.slice(0,offset));
  const OCTAVE_COUNT = 9;
  for(let i=0;i<OCTAVE_COUNT;i++) {
    offsetWNoteArray.forEach((wNote,idx) => {
      carnaticMap[wNote.concat(i)] = {
              note: CARNATIC_NOTES[idx],
              octave: i - baseOctave,
            };
    });
  }
  //Map Sa to baseWesternNote
  return carnaticMap;
};

export const getAudioInputs = function() {
  return navigator.mediaDevices.enumerateDevices().then((devices) => {
    devices = devices.filter(
      (d) => d.kind === "audioinput"
    );
    return devices;
  });

};

export const isAudioContextSupported = function () {
  // This feature is still prefixed in Safari
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  if (window.AudioContext) {
    return true;
  } else {
    return false;
  }
};

export const isGetUserMediaSupported = function () {
  navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;
  if (
    (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) ||
    navigator.getUserMedia
  ) {
    return true;
  }

  return false;
};

export const findFundamentalFreq = function (buffer, sampleRate) {
  // We use Autocorrelation to find the fundamental frequency.

  // In order to correlate the signal with itself (hence the name of the algorithm), we will check two points 'k' frames away.
  // The autocorrelation index will be the average of these products. At the same time, we normalize the values.
  // Source: http://www.phy.mty.edu/~suits/autocorrelation.html
  // Assuming the sample rate is 48000Hz, a 'k' equal to 1000 would correspond to a 48Hz signal (48000/1000 = 48),
  // while a 'k' equal to 8 would correspond to a 6000Hz one, which is enough to cover most (if not all)
  // the notes we have in the notes.json file.
  var n = 1024;
  var bestK = -1;
  var bestR = 0;
  for (var k = 8; k <= 1000; k++) {
    var sum = 0;

    for (var i = 0; i < n; i++) {
      sum += ((buffer[i] - 128) / 128) * ((buffer[i + k] - 128) / 128);
    }

    var r = sum / (n + k);

    if (r > bestR) {
      bestR = r;
      bestK = k;
    }

    if (r > 0.9) {
      // Let's assume that this is good enough and stop right here
      break;
    }
  }
  // this.setText(buffer[0] - 128);
  // console.log(bestR);
  if (bestR > 0.0025) {
    // The period (in frames) of the fundamental frequency is 'bestK'. Getting the frequency from there is trivial.
    var fundamentalFreq = sampleRate / bestK;
    return fundamentalFreq; 
  } else {
    // We haven't found a good correlation
    return -1;
  }
};

export const findClosestNote = function (freq, notes) {
  // Use binary search to find the closest note
  var low = -1;
  var high = notes.length;

  while (high - low > 1) {
    var pivot = Math.round((low + high) / 2);
    if (notes[pivot].frequency <= freq) {
      low = pivot;
    } else {
      high = pivot;
    }
  }
  if (
    notes[high] && Math.abs(notes[high].frequency - freq) <=
    Math.abs(notes[low].frequency - freq)
  ) {
    // notes[high] is closer to the frequency we found
    return notes[high];
  }

  return notes[low];
};

export const findCentsOffPitch = function (freq, refFreq) {
  // We need to find how far freq is from baseFreq in cents
  var log2 = 0.6931471805599453; // Math.log(2)
  var multiplicativeFactor = freq / refFreq;

  // We use Math.floor to get the integer part and ignore decimals
  var cents = Math.floor(1200 * (Math.log(multiplicativeFactor) / log2));
  return cents;
};
