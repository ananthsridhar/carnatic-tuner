import React, { useState, useRef, useEffect } from "react";
import MicButtonComponent from "./MicButtonComponent";
import NoteDisplayComponent from "./NoteDisplayComponent";
import { notes } from "../resources/notes";
import {
  isAudioContextSupported,
  isGetUserMediaSupported,
  findFundamentalFreq,
  findClosestNote,
  findCentsOffPitch,
  getCarnaticNotes,
  getAudioInputs,
} from "../resources/tunerUtility";

const styles = {
  mainContainer: {
    backgroundColor: "#282c34",
    color: "white",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
  },
  chordChar: {
    fontSize: "15vh",
  },

  centChar: {
    fontSize: "5vh",
  },
  flexContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
};
const BASE_FREQ = 440;
const notesArray = notes[BASE_FREQ.toString()];
const DETECTION_RATE = 100; //ms
export default function TunerComponent() {
  let audioContext = useRef(null);
  let interval = useRef(null);
  let baseNote = "E4";
  let carnaticNoteMap = useRef(getCarnaticNotes(baseNote));
  let [isMicrophoneInUse, setMicInUse] = useState(false);
  let [micStream, setMicStream] = useState(null);
  let [sourceAudioNode, setSourceAudioNode] = useState(null);
  let [analyserAudioNode, setAnalyserAudioNode] = useState(null);
  let [streamActive, setStreamActive] = useState(false);
  let [currentNote, setCurrentNote] = useState(null);
  let [cents, setCents] = useState(null);
  let [audioInputList, setAudioInputList] = useState([]);
  let [selectedAudioInput, setSelectedAudioInput] = useState(null);

  useEffect(initTuner, []);

  useEffect(() => {
    if (!streamActive) {
      clearInterval(interval.current);
    } else {
      interval.current = setInterval(() => detectPitch(), DETECTION_RATE);
    }
    return () => clearInterval(interval.current);
  }, [streamActive]);

  function initTuner() {
    if (isAudioContextSupported()) {
      audioContext.current = new window.AudioContext();
      getAudioInputs().then((devices) => {
        setAudioInputList(devices);
        if (devices && devices.length > 0)
          setSelectedAudioInput(devices[0].deviceId);
      });
    } else {
      this.reportError("AudioContext is not supported in this browser");
    }
    console.log(getCarnaticNotes(baseNote, BASE_FREQ));
  }

  // let getAudioInputs = function () {
  //   navigator.mediaDevices.enumerateDevices().then((devices) => {
  //     devices = devices.filter((d) => d.kind === "audioinput");
  //     console.log(devices);
  //     setAudioInputList(devices);
  //     if (devices.length > 0) setSelectedAudioInput(devices[0].deviceId);
  //   });
  // };

  let changeAudioInput = function (input) {
    setSelectedAudioInput(input);
    console.log("Changing Audio Input to");
    console.log({ input });
    if (isMicrophoneInUse) {
      turnOffMicrophone();
      toggleMicrophone();
    }
  };

  function handleChange(e) {
    changeAudioInput(e.target.value);
  }

  function toggleMicrophone() {
    // this.outText = "Mic On";
    if (!isMicrophoneInUse) {
      if (audioContext) audioContext.current.resume();
      if (isGetUserMediaSupported()) {
        let getUserMedia =
          navigator.mediaDevices && navigator.mediaDevices.getUserMedia
            ? navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices)
            : function (constraints) {
                return new Promise(function (resolve, reject) {
                  navigator.getUserMedia(constraints, resolve, reject);
                });
              };
        getUserMedia({
          audio: {
            deviceId: selectedAudioInput,
          },
        })
          .then(streamReceived)
          .catch(console.log);
        // this.updatePitch(this.baseFreq);
        // });
      } else {
        console.log(
          "It looks like this browser does not support getUserMedia. " +
            'Check <a href="http://caniuse.com/#feat=stream">http://caniuse.com/#feat=stream</a> for more info.'
        );
      }
    } else {
      turnOffMicrophone();
    }
  }

  function streamReceived(stream) {
    console.log(stream);
    setMicStream(stream);
    let aaNode = audioContext.current.createAnalyser();
    aaNode.fftSize = 2048;
    setAnalyserAudioNode(aaNode);
    let saNode = audioContext.current.createMediaStreamSource(stream);
    saNode.connect(aaNode);
    setSourceAudioNode(saNode);
    setStreamActive(true);
    setMicInUse(true);
  }

  function detectPitch(aaNode = null) {
    // console.log(currentNote);
    let analyserNode = analyserAudioNode || aaNode;
    let buffer = new Uint8Array(analyserNode.fftSize);
    analyserNode.getByteTimeDomainData(buffer);
    let fundalmentalFreq = findFundamentalFreq(
      buffer,
      audioContext.current.sampleRate
    );
    if (fundalmentalFreq !== -1) {
      let note = findClosestNote(fundalmentalFreq, notesArray);
      let cents = findCentsOffPitch(fundalmentalFreq, note.frequency);

      console.log(note);
      if (carnaticNoteMap.current[note.note]) {
        setCurrentNote(carnaticNoteMap.current[note.note]);
        setCents(cents);
      }
    } else {
      // setCurrentNote("-");
      // setCents("-");
    }
  }

  function turnOffMicrophone() {
    if (
      sourceAudioNode &&
      sourceAudioNode.mediaStream &&
      sourceAudioNode.mediaStream.getTracks()[0]
    ) {
      console.log("Turning off Mic");
      sourceAudioNode.mediaStream.getTracks()[0].stop();
    }

    setStreamActive(false);
    setSourceAudioNode(null);
    // window.cancelAnimationFrame(this.frameId);
    // this.updatePitch("--");
    // this.updateNote("--");
    // this.updateCents(-50);
    // $("#microphoneOptions").toggle(false);
    setAnalyserAudioNode(null);
    setMicInUse(false);
  }

  return (
    <div style={styles.mainContainer}>
      <div style={Object.assign({},styles.flexContainer,{ flex: 3, width: "100%" })}>
        {/* <p style={styles.chordChar}>{currentNote}</p>
        <p style={styles.centChar}>{cents}</p> */}
        <NoteDisplayComponent note={currentNote} cents={cents} />
      </div>
      <div style={Object.assign({},styles.flexContainer,{ flex: 1 })}>
        <MicButtonComponent
          isMic={isMicrophoneInUse}
          onClick={() => toggleMicrophone()}
        />
      </div>
      <div style={Object.assign({},styles.flexContainer,{ flex: 1 })}>
        <select
          style={{ width: "80%" }}
          value={selectedAudioInput || " "}
          onChange={handleChange}
        >
          {audioInputList &&
            audioInputList.map((i, index) => {
              return (
                <option key={index} value={i.deviceId}>
                  {i.label}
                </option>
              );
            })}
        </select>
      </div>
    </div>
  );
}
