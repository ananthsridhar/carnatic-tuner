import React, {useEffect, useState } from "react";
import { WESTERN_NOTES } from "../resources/Constants";

export default function Settings({inputList,onInputChange,onBaseChordChange}) {
  let [chord, setChord] = useState("E");
  let [octave, setOctave] = useState("4");
  let [input, setInput] = useState(null);
  useEffect(() => {
      onBaseChordChange(chord.concat(octave));
  }, [onBaseChordChange,chord, octave]);
  
  //Change Dropdown
  let changeAudioInput = (e) => {
    setInput(e.target.value);
    onInputChange(e.target.value);
  };
  //Change Base Chord
  let changeBaseChord = (e) => {
    setChord(e.target.value);
  };

  let changeOctave = (e) => {
    setOctave(e.target.value);
  };

  return (
    <React.Fragment>
      <select
        style={{ width: "80%" }}
        value={input || " "}
        onChange={changeAudioInput}
      >
        {inputList &&
          inputList.map((i, index) => {
            return (
              <option key={index} value={i.deviceId}>
                {i.label}
              </option>
            );
          })}
      </select>
      <div style={styles.parentContainer}>
        <label>Base Western Chord : </label>
        <select
          style={{ width: "20%" }}
          value={chord}
          onChange={changeBaseChord}
        >
          {WESTERN_NOTES.map((chord, index) => {
            return (
              <option key={index} value={chord}>
                {chord}
              </option>
            );
          })}
        </select>
        <select style={{ width: "20%" }} value={octave} onChange={changeOctave}>
          {[1, 2, 3, 4].map((chord, index) => {
            return (
              <option key={index} value={chord}>
                {chord}
              </option>
            );
          })}
        </select>
      </div>
    </React.Fragment>
  );
}

const styles = {
  parentContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-evenly",
    width: "80%",
    padding: "2%",
    border: "1px solid white",
    borderRadius: "10px",
  },
};
