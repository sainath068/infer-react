import React from "react";
//import "../styles/variables.css";
import "./Button.css"; 

const Buttons = ({ text, onClick, className, loading }) => {
  return (
    <button
      className={`custom-button ${className}`}
      onClick={onClick}
      disabled={loading}
    >
      {loading ? <div className="searchbar-loader"></div> : text}
    </button>
  );
};

export default Buttons;
