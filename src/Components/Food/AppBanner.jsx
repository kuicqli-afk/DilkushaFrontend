import React, { useState, useEffect } from "react";
import "./Food.css";
import mobile from "../../assets/MOBILE APP.png";
import hands from "../../assets/Hands.png";
import { IoIosArrowUp } from "react-icons/io";
function AppBanner() {
  const [showTop, setShowTop] = useState(false);


  return (
    <div style={{height: "71vh", marginBottom: "-51px"}} className="container">
      {/* Mobile App Images */}
      <div className="mobile-app">
        <img className="mo-aap" src={mobile} alt="Mobile App" />
        <div className="hands">
          <img src={hands} alt="Hands" />
        </div>
      </div>
    </div>
  );
}

export default AppBanner;
