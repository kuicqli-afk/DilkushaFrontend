import { useState } from "react";
import "./Footer.css";
import facebook from "../../assets/facebook_icon.png";
import instagram from "../../assets/instagram_icon.png";
import pinterest from "../../assets/pintrest_icon.png";
import whatsapp from "../../assets/whatsapp_icon.png";

import cross_icon from "../../assets/cross_icon.png";
import { Link } from "react-router-dom";


const Footer = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState("");

  const openPopup = (type) => {
    setPopupType(type);
    setShowPopup(true);
  };

  return (
    <div className='footer' id='footer'>
      <div className="footer-content">
        <div className="footer-content-left">
          <h1 style={{color: "white", fontSize: "70px"}} >Food</h1>
          {/* <h1 id='about-footer'>About KUICQLI</h1> */}
          {/* <p>KUICQLI serves fresh, hygienic, and delicious food made with quality ingredients.
                  Every dish is prepared with care to deliver great taste and consistency.
              We focus on freshness, safety, and customer satisfaction.</p> */}
              <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Molestias modi ea harum cupiditate quibusdam labore soluta minima voluptates atque 
                accusantium corrupti tempore a, aut consectetur voluptas qui eligendi? Temporibus, natus.</p>
          <div className="footer-social-icons">
            <a href='' target='#'><img src={facebook} alt="Facebook" /></a>
            <a href='' target='#'><img src={instagram} alt="Instagram" /></a>
            <a href='' target='#'><img src={pinterest} alt="Pinterest" /></a>
            {/* <a href='https://www.youtube.com/@fekugifts' target='_blank'><img src={assets.youtube_icon} alt="YouTube" /></a> */}
            <a onClick={() => openPopup("WhatsApp Inquiry")}><img src={whatsapp} alt="WhatsApp" /></a>
          </div>
        </div>
        <div className="footer-content-center">
          <h2>Company</h2>
          <ul>
            {/* <li onClick={() => openPopup("Corporate")}>Corporate Orders</li>
            <li onClick={() => openPopup("Bulk")}>Bulk Orders</li> */}
            {/* <li onClick={() => openPopup("rakhi")}>Rakhi</li> */}
            {/* <li onClick={() => openPopup("Customization")}>Customization</li> */}
            <li><Link to="">Contact Us</Link></li>
            <li><Link to="">Terms and Conditions</Link></li>
            <li><Link to="">Privacy Policy</Link></li>
            {/* <li><Link to="/cancellation-refund">Cancellation and Refund</Link></li> */}
            <li><Link to="">Shipping and Delivery</Link></li>
          </ul>
        </div>
        <div className="footer-content-right">
          <h2>Get In Touch</h2>
          <ul>
            <li>Phone:+91 8177000316 </li>
            <li>Email: designerbirds@gmail.com</li>
            <li>Address: Lucknow, India.</li>
            <li style={{ fontWeight: "bold", marginTop: "20px" }}>LUCKNOW - OFFICE | STORE | WORKSHOP</li>
            <li>Head Office: 185/20, Zafar Manzil, Area Wazeerganj, Golaganj, Aminabad - 226018.</li>
            <li>Branch Office - 2nd Floor, Prince Complex, Nawal Kishore Road, Hazratganj - 226001.</li>
             <li>Branch Office - Levana, Cyber Heights, 2nd Floor, Vibhuti Khand, Gomtinagar - 226010.</li>
            <li>Branch Office - 185/20, Golaganj, Wazeerganj, Lucknow -226018.</li>
           
          </ul>
        </div>
      </div>
      <p className="footer-copyright">Copyright 2025 ©  - All Rights Reserved.  -  
         <a style={{ fontWeight: "300", listStyle: "none", textDecoration: "none", color: "white"}} href="https://designerbirds.com/" target='blank'> Design and Developed by Designerbirds Team</a>
         </p>
      
      
      {showPopup && <PopupForm type={popupType} onClose={() => setShowPopup(false)} />}
    </div>
  );
};

const PopupForm = ({ type, onClose }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [yourQuery, setOrderDetails] = useState('');

  const sendToWhatsApp = (e) => {
    e.preventDefault();
    if (!name || !phone || !yourQuery) {
      alert('Please fill all fields!');
      return;
    }
    const whatsappNumber = "+91 7084220734";
    const message = `*New ${type} Request*\n\n👤 Name: ${name}\n📞 Phone: ${phone}\n📝 Your Query: ${yourQuery}`;
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, '_blank');
    onClose();
  };

  // return (
  //   <div className="popup-overlay">
  //     <div className="popup">
  //       <div className="popup-header">
  //         <h2>{type} Form</h2>
  //         <img onClick={onClose} src={cross_icon} alt="Close" className="close-icon" />
  //       </div>
  //       <h3>Kindly share your query  with us.</h3>
  //       <form onSubmit={sendToWhatsApp}>
  //         <label>Name</label>
  //         <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" required />
  //         <label>Phone</label>
  //         <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter your phone number" required />
  //         <label>Your Query</label>
  //         <textarea value={yourQuery} onChange={(e) => setOrderDetails(e.target.value)} placeholder="Describe your query" required></textarea>
  //         <button type="submit">Submit</button>
  //       </form>
  //     </div>
  //   </div>
  // );
};

export default Footer;
