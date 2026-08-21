import React, { useState } from "react";
import "./CategoryMenu.css";

const categories = [
  "All",
  "Best Sellers",
  "Namkeen",
  "Biscuits",
  "Sweets",
  "Beverages",
  "Dry Fruits",
  "Chips & Snacks",
  "Instant Food",
  "Spices",
  "Pickles",
];

function CategoryMenu() {
  const [active, setActive] = useState("All");

  return (
    <div className="category-menu">
      <div className="category-container">
        {categories.map((cat, index) => (
          <div
            key={index}
            className={`category-item ${active === cat ? "active" : ""}`}
            onClick={() => setActive(cat)}
          >
            {cat}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategoryMenu;

