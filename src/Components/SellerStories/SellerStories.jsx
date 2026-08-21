import React, { useState } from "react";
import "./SellerStories.css";
import seller1 from "../../assets/seller1.jpg";
import seller2 from "../../assets/seller2.jpg";
import seller3 from "../../assets/seller3.jpg";
import seller4 from "../../assets/seller4.jpg";
import seller5 from "../../assets/seller5.jpg";
import seller6 from "../../assets/seller6.jpg";

const stories = [
  {
    id: 1,
    img: seller1,
    title: "Seller Story",
    date: "03 Sep",
    author: "theretailersindia",
    comments: 0,
    description: "Repudiandae dignissimos obcaecati assumenda hic quas est, quos eligendi neque tempore quam cupiditate saepe ",
  },
  {
    id: 2,
    img: seller2,
    title: "Seller Story",
    date: "03 Sep",
    author: "theretailersindia",
    comments: 0,
    description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae dignissimos obcaecati assumenda hic qu",
  },
  {
    id: 3,
    img: seller3,
    title: "Seller Story",
    date: "03 Sep",
    author: "theretailersindia",
    comments: 0,
    description: "doloremque. Pariatur debitis quisquam dicta? Incidunt id facilis quo inventore laborum, atque ",
  },
  {
    id: 4,
    img: seller4,
    title: "Seller Story",
    date: "03 Sep",
    author: "theretailersindia",
    comments: 0,
    description: "laborum, atque nostrum provident quas doloribus veritatis obcaecati consequuntur eum minima sequi adipisci ratione repellat officia deserunt quasi quaerat perspiciatis explicabo animi, voluptate ullam!",
  },
  {
    id: 5,
    img: seller5,
    title: "Seller Story",
    date: "03 Sep",
    author: "theretailersindia",
    comments: 0,
    description: "Repudiandae dignissimos obcaecati assumenda hic quas est, quos eligendi neque tempore quam cupiditate saepe doloremque.",
  },
  {
    id: 6,
    img: seller6,
    title: "Seller Story",
    date: "03 Sep",
    author: "theretailersindia",
    comments: 0,
    description: "doloribus veritatis obcaecati consequuntur eum minima sequi adipisci ratione repellat officia deserunt quasi quaerat perspiciatis explicabo animi, voluptate ullam!",
  },
];

const SellerStories = () => {
  const [startIndex, setStartIndex] = useState(0);

  // Get 3 cards cyclically starting from startIndex
  const getVisibleCards = () => {
    let visible = [];
    for (let i = 0; i < 3; i++) {
      visible.push(stories[(startIndex + i) % stories.length]);
    }
    return visible;
  };

  const handlePrev = () => {
    setStartIndex((prev) => (prev === 0 ? stories.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setStartIndex((prev) => (prev === stories.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="seller-section">
      <div className="seller-heading">
        <p className="blog-badge">FROM THE BLOG</p>
        <h2>Our Seller On Boarding Success Story</h2>
        <p className="subtitle">The story behind our shop owner's business creation.</p>
      </div>

      <div className="carousel-wrapper">
        <button className="arrow-btn-seller left" onClick={handlePrev} aria-label="Previous"></button>

        <div className="carousel-cards-row">
          {getVisibleCards().map((story) => (
            <div key={story.id} className="story-card">
              <div className="story-image">
                <img src={story.img} alt="seller" />
              </div>
              <div className="story-info">
                <p className="meta">
                  by {story.author} | {story.comments} comments
                </p>
                <div className="date-badge">{story.date}</div>
                <h3>{story.title}</h3>
                <p className="desc">{story.description}</p>
              </div>
            </div>
          ))}
        </div>

        <button className="arrow-btn-seller right" onClick={handleNext} aria-label="Next"></button>
      </div>
    </section>
  );
};

export default SellerStories;
