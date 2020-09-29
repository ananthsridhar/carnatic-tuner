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
import { MdSettings } from "react-icons/md";
import Settings from "./SettingsComponent";

const styles = {
  mainContainer: {
    backgroundColor: "#1D1E2C",
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
    alignItems: "center",
    height: "15vh",
    flexFlow: "row wrap",
    justifyContent: "space-evenly",
  },
  settingsButton : {
    height:'10vh',
    fontSize: '2em',
    color:'#59656F'
  }
};

const BASE_FREQ = 440;
const notesArray = notes[BASE_FREQ.toString()];
const DETECTION_RATE = 100; //ms
export default function TunerComponent() {
  let audioContext = useRef(null);
  let interval = useRef(null);
  let [baseNote, setBaseNote] = useState("E4");
  let carnaticNoteMap = useRef(getCarnaticNotes(baseNote));
  let [isMicrophoneInUse, setMicInUse] = useState(false);
  // let [micStream, setMicStream] = useState(null);
  let [sourceAudioNode, setSourceAudioNode] = useState(null);
  let [analyserAudioNode, setAnalyserAudioNode] = useState(null);
  let [streamActive, setStreamActive] = useState(false);
  let [currentNote, setCurrentNote] = useState(null);
  let [cents, setCents] = useState(null);
  let [audioInputList, setAudioInputList] = useState([]);
  let [selectedAudioInput, setSelectedAudioInput] = useState(null);
  let [settings,setSettings] = useState(false);

  useEffect(initTuner, []);

  useEffect(() => {
    if (!streamActive) {
      clearInterval(interval.current);
    } else {
      interval.current = setInterval(() => detectPitch(), DETECTION_RATE);
    }
    return () => clearInterval(interval.current);

    function detectPitch(aaNode = null) {
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
  }, [streamActive,analyserAudioNode]);

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

  function handleInputChange(input) {
    changeAudioInput(input);
  }

  function onBaseChordChange(chord) {
    setBaseNote(chord);
  }

  function toggleMicrophone() {
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
    // setMicStream(stream);
    let aaNode = audioContext.current.createAnalyser();
    aaNode.fftSize = 2048;
    setAnalyserAudioNode(aaNode);
    let saNode = audioContext.current.createMediaStreamSource(stream);
    saNode.connect(aaNode);
    setSourceAudioNode(saNode);
    setStreamActive(true);
    setMicInUse(true);
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
    setAnalyserAudioNode(null);
    setMicInUse(false);
  }

  return (
    <div style={styles.mainContainer}>
      <div
        style={Object.assign({}, styles.flexContainer, {
          flex: 3,
          width: "100%",
        })}
      >
        <NoteDisplayComponent note={currentNote} cents={cents} />
      </div>
      <div style={Object.assign({}, styles.flexContainer)}>
        <MicButtonComponent
          isMic={isMicrophoneInUse}
          onClick={() => toggleMicrophone()}
        />
      </div>
      <SettingsButton toggleSetting={setSettings.bind(this,!settings)} />
      {settings && (<div
        style={Object.assign({}, styles.flexContainer, {
          height: '20vh',
          flexFlow: "row wrap",
          justifyContent: "space-evenly",
        })}
        className="settings-section"
      >
        <Settings
          inputList={audioInputList}
          onInputChange={handleInputChange}
          onBaseChordChange={onBaseChordChange}
        />
      </div>)}
    </div>
  );
}

function SettingsButton (props) {

  return (
    <div style={Object.assign({}, styles.flexContainer,styles.settingsButton)}>
      <MdSettings onClick={props.toggleSetting}/>
    </div>
  )
}
