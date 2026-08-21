import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Slider from "../Slider/Slider";

const OfferDetails = () => {
  const { slug } = useParams();
  const [Offers, setOffer] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/offers/${slug}`)
      .then((res) => setOffer(res.data.offer))
      .catch((err) => console.log(err));
  }, [slug]);

  if (!Offers) return <h2>Loading...</h2>;

  return (
    <div className="food-container">
      <Slider/>
      <div className="food-text">
        <h1>{Offers.title}</h1>
      </div>
      <img
        src={Offers.image}
        alt={Offers.title}
      />
    </div>
  );
};

export default OfferDetails;