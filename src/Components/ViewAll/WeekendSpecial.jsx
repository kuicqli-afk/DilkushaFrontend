import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../Context/CartContext";

import Open from "../../assets/Open.png";
import Close from "../../assets/CLOSE.png";
import RedArrow from "../../assets/NON VEG.png";
import GreenArrow from "../../assets/VEG.png";
import SaveIcon from "../../assets/SaveIcon.png";
import ShareIcon from "../../assets/ShareIcon.png";
import StarIcon from "../../assets/StarIcon.png";

import { VscEye } from "react-icons/vsc";
import { FaRegHeart } from "react-icons/fa";
import { LiaStopwatchSolid } from "react-icons/lia";

import weekendList from "../../data/WeekendData";

function WeekendSpecial() {
    const navigate = useNavigate();
    const { cartItems, addToCart, updateQty, getCartKey } = useCart();
    const [openCardId, setOpenCardId] = useState(null);
    const [selectedSlots, setSelectedSlots] = useState({});

    const items = weekendList;
    // const items = 
    const getQty = (item) => {
        const key = getCartKey(item);
        const found = cartItems.find((x) => x.key === key);
        return found ? found.quantity : ("ADD");
    };

    const increase = (item) => addToCart(item, 1);
    const decrease = (item) => {
        const key = getCartKey(item);
        const found = cartItems.find((x) => x.key === key);
        if (found) updateQty(key, found.quantity - 1);
    };

    const placeOrder = (item) =>
        navigate("/order#", { state: { item, category: "weekend-specials" } });
    return (
        <div className="food-container">
            <div id="weekend-specials" className="food-text">
                <h1>Weekend Specials</h1>
            </div>

            {/* Grid for 5 cards per row */}
            <div className="food-card-grid">

                {items.map((item) => (
                    <div key={item.id} className="food-card">


                        {/* Image */}

                        <div className="food-image-wrapper">

                            {/* ✅ Ads Badge */}
                            {(item.video || item.video2) && (
                                <div className="add-badge">Ads</div>
                            )}

                            {openCardId === item.id && (
                                <div className="slot-popup-overlay">
                                    <div className="slot-popup-content">
                                        <h4>Select a Slot</h4>
                                        <ul>
                                            {Array.isArray(item.slots) &&
                                                item.slots.map((slot) => (
                                                    <li
                                                        key={slot}
                                                        className={
                                                            selectedSlots[item.id] === slot ? "selected" : ""
                                                        }
                                                        onClick={() =>
                                                            setSelectedSlots({
                                                                ...selectedSlots,
                                                                [item.id]: slot,
                                                            })
                                                        }
                                                    >
                                                        {slot}
                                                    </li>
                                                ))}
                                        </ul>
                                        <button
                                            onClick={() => {
                                                setOpenCardId(null);
                                                navigate("/order#", {
                                                    state: {
                                                        item,
                                                        category: "namkeens",
                                                        slot: selectedSlots[item.id],
                                                    },
                                                });
                                            }}
                                            disabled={!selectedSlots[item.id]}
                                        >
                                            Set Time & Place Order
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Video / Image Logic */}
                            {item.video && item.video.endsWith(".mp4") ? (
                                <video
                                    className="food-image"
                                    src={item.video}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    preload="metadata"
                                />
                            ) : item.video2 && item.video2.endsWith(".mp4") ? (
                                <video
                                    className="food-image"
                                    src={item.video2}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    preload="metadata"
                                />
                            ) : item.video2 && item.video2.includes("youtube.com") ? (
                                <iframe
                                    className="food-image"
                                    src={`${item.video2}?autoplay=1&mute=1&loop=1&controls=0&playsinline=1`}
                                    frameBorder="0"
                                    allow="autoplay; encrypted-media"
                                    allowFullScreen
                                    title={item.title}
                                />
                            ) : (
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="food-image"
                                />
                            )}

                            <div className="view-eye">
                                <VscEye
                                    style={{
                                        fontSize: "22px",
                                        color: "white",
                                        marginBottom: "-2px",
                                        cursor: "pointer",
                                    }}
                                />
                                {item.view}
                            </div>

                            <img
                                className="top-icon"
                                src={item.type === "veg" ? GreenArrow : RedArrow}
                                alt=""
                            />
                        </div>


                        {/* Info */}
                        <div className="food-info">
                            <div className="food-status-left">
                                <img src={item.isOpen ? Open : Close} alt="" />
                                <p>{item.status}</p>
                                <div className="food-status-right-icon">
                                    <LiaStopwatchSolid
                                        size={24}
                                        color="#ff5722"
                                        title="Select Slot"
                                        onClick={() =>
                                            setOpenCardId(openCardId === item.id ? null : item.id)
                                        }
                                        style={{ cursor: "pointer" }}
                                    />
                                    <FaRegHeart size={20} title="Like" style={{ cursor: "pointer" }} />
                                    <img src={SaveIcon} alt="Save" title="Book Mark" />
                                    <img src={ShareIcon} alt="Share" title="Share" />
                                </div>
                            </div>

                            <h2>
                                {item.title} <span>({item.portion})</span>
                            </h2>
                            <p className="food-desc">{item.desc.slice(0, 60)}...</p>

                            <div className="food-rating">
                                <img src={StarIcon} alt="" />
                                <h3>
                                    {item.rating} <span>({item.reviews})</span>
                                </h3>
                                <p>{item.orders} orders last week</p>
                            </div>

                            <div className="food-price-row">
                                <span className="food-price">
                                    <small className="Rs">₹</small> {item.price}
                                </span>
                                <span className="offer">
                                    <small className="offer">₹</small>
                                    {item.offer}
                                </span>
                                <span className="food-off">{item.off}% OFF</span>
                                {/* <p className="delivery-badge">
                              ⏱ {item.deliveryTime}
                            </p> */}
                            </div>

                            <div className="food-actions">
                                <button className="order-btn" onClick={() => placeOrder(item)}>
                                    Place order
                                </button>
                                {/* <div className="add">
                                          <span className="add-text">ADD</span>
                                      </div> */}
                                <div className="add-btn">
                                    <button onClick={() => decrease(item)}>-</button>
                                    <span>{getQty(item)}</span>
                                    <button onClick={() => increase(item)}>+</button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default WeekendSpecial
