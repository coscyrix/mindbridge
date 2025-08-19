import React from "react";

function Spinner({
  color = "#fff",
  width = "28px",
  height = "28px",
  position = "center",
}) {
  const spinnerStyle = {
    width: width,
    height: height,
    border: `3px solid ${color}`,
    borderBottomColor: "transparent",
    borderRadius: "50%",
    display: "inline-block",
    boxSizing: "border-box",
    animation: "rotation 1s linear infinite",
  };

  const containerStyle = {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: position,
  };

  const keyframesStyle = `
      @keyframes rotation {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    `;

  return React.createElement(
    "div",
    { style: containerStyle },
    React.createElement("style", null, keyframesStyle),
    React.createElement("span", { style: spinnerStyle })
  );
}

export default Spinner;
