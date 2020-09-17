import { BsMicFill, BsMicMuteFill } from "react-icons/bs";
import React, { useRef } from "react";
import "../resources/styles.css";

const micStyles = {
  background: {
    height: "5rem",
    width: "5rem",
    alignItems: "center",
    borderRadius: "50%",
    justifyContent: "center",
    display: "flex",
  },
  micOn: {
    backgroundColor: "",
  },
  micOff: {
    backgroundColor: "green",
  },
};

export default function MicButtonComponent(props) {
  let buttonBg = useRef(null);
  let onMicClick = (e) => {
    buttonBg.current.classList.toggle("mic-on");
    props.onClick();
  };

  let micStateStyle = props.isMic ? micStyles.micOn : micStyles.micOff;
  return (
    <div
      ref={buttonBg}
      style={Object.assign({}, micStyles.background, micStateStyle)}
      onClick={onMicClick}
    >
      <h1>{props.isMic ? <BsMicFill /> : <BsMicMuteFill />}</h1>
    </div>
  );
}
