import React from "react";

const CustomLoader = () => {
  
  const loaderContainerStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "rgba(252, 242, 242, 0.5)", 
    zIndex: 9999,
  };

  const loaderStyle = {
    border: "6px solid #f3f3f3", 
    borderTop: "6px solid #3498db",
    borderRadius: "50%", 
    width: "50px", 
    height: "50px",
    animation: "spin 1s linear infinite", 
  };

  return (
    <div style={loaderContainerStyle}>
      <div style={loaderStyle}></div>
      <style>
        {`
          @keyframes spin {
            0% {
              transform: rotate(0deg); /* Start at 0 degrees */
            }
            100% {
              transform: rotate(360deg); /* Complete one full rotation */
            }
          }
        `}
      </style>
    </div>
  );
};

export default CustomLoader;
