import React from "react";
import "../resources/styles.css";
import {BsDot} from "react-icons/bs";

const RADIUS_FACTOR = 0.2;
const BASE_RADIUS = 20;
const CENT_THRESHOLDS = [
  {
    diff: 5,
    color: "green",
  },
  {
    diff: 10,
    color: "orange",
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
    <div style={{flex: '1'}}>
      <SVGComponent viewBox="0 0 100 80" preserveAspectRatio="xMaxYMax meet">
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
          stroke="#F0CE01"
          strokeWidth="1"
        />
        <text
          textAnchor="middle"
          x="50%"
          y="55%"
          strokeWidth="1"
          fill="white"
          style={{ fontSize: "1em" }}
        >
          {props.note && props.note.note}
        </text>
        <foreignObject
          x="40%"
          y="60%"
          style={{ fontSize: "0.2em" }}
          height="8"
          width="20"
        >
          <OctaveDot num={oct} />
        </foreignObject>
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
  return <div>{!!props.num && el.map((w) =><BsDot/>)}</div>;
};
