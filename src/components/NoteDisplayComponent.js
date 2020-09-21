import React from "react";
import "../resources/styles.css";
import { BsDot } from "react-icons/bs";

const RADIUS_FACTOR = 0.2;
const BASE_RADIUS = 30;
const CENT_THRESHOLDS = [
  {
    diff: 5,
    color: "#04C869",
  },
  {
    diff: 10,
    color: "#FF9B85",
  },
];

export default function NoteDisplayComponent(props) {
  console.log(props);
  let circleRadius =
    props.cents !== "-" ? BASE_RADIUS + props.cents * RADIUS_FACTOR : 5;

  let oct = props.note?.octave ? props.note.octave : 0;

  let color =
    props.cents !== "-"
      ? CENT_THRESHOLDS.reduce(
          (a, c) => (Math.abs(props.cents) > c.diff ? c : a),
          CENT_THRESHOLDS[0]
        )
      : CENT_THRESHOLDS[0];

  return (
    <div style={{ width: "50vh", height: "50vh" }}>
      <SVGComponent
        viewBox="0 0 100 100"
        preserveAspectRatio="xMaxYMax meet"
        style={{ overflow: "visible" }}
      >
        <Circle
          cx="50%"
          cy="50%"
          r={circleRadius}
          fill={color.color}
          stroke="none"
          strokeWidth="1"
          className="p-circle"
        />
        <Circle
          cx="50%"
          cy="50%"
          r={BASE_RADIUS}
          fill="none"
          stroke="#B0B8BF"
          strokeWidth="1"
        />
        {oct<0 && <foreignObject
          x="40%"
          y="35%"
          style={{ fontSize: "0.2em" }}
          height="8"
          width="20"
        >
          <OctaveDot num={oct*-1} />
        </foreignObject>}
        <text
          textAnchor="middle"
          x="50%"
          y="55%"
          strokeWidth="1"
          fill="#E2E4F6"
          style={{ fontSize: "1em" }}
        >
          {props.note && props.note.note}
        </text>
        {oct>0 && <foreignObject
          x="40%"
          y="60%"
          style={{ fontSize: "0.2em" }}
          height="8"
          width="20"
        >
          <OctaveDot num={oct} />
        </foreignObject>}
      </SVGComponent>
    </div>
  );
}

let SVGComponent = (props) => {
  return <svg {...props}>{props.children}</svg>;
};

let Circle = (props) => {
  return <circle {...props}>{props.children}</circle>;
};

let OctaveDot = (props) => {
  let el = new Array(props.num).fill(0);
  console.log(el);
  return <div>{!!props.num && el.map((w) => <BsDot />)}</div>;
};
