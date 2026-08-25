// OfferDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API_URL = "https://shyambackend.onrender.com"; // match your offers backend

const OfferDetail = () => {
  const { slug } = useParams();
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffer = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/offers/${slug}`);
        setOffer(res.data?.offer || null);
      } catch (err) {
        console.error("Fetch Offer Error:", err);
        setOffer(null);
      } finally {
        setLoading(false);
      }
    };
    fetchOffer();
  }, [slug]);

  if (loading) return <div className="p-6 text-center text-sm">Loading...</div>;

  if (!offer) {
    return <div className="p-10 text-center text-slate-500 text-sm">Offer not found.</div>;
  }

  return (
    <div className="p-4">
      <img src={offer.image} alt={offer.title} className="w-full rounded-lg mb-4" />
      <h1 className="text-xl font-bold mb-4">{offer.title}</h1>

      {offer.products?.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {offer.products.map((p) => (
            <div key={p._id} className="border rounded-lg p-2">
              <img
                src={p.image}
                alt={p.title}
                className="w-full h-32 object-cover rounded"
              />
              <p className="text-xs font-semibold mt-2 truncate">{p.title}</p>
              <p className="text-xs text-orange-600">₹{p.price}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-slate-500 text-sm">No products in this offer yet.</p>
      )}
    </div>
  );
};

export default OfferDetail;