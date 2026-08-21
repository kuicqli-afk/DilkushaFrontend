import React from "react";
import "./Food.css";

function Button({
  filter,
  setFilter,
  sortBy,
  setSortBy,
  price,
  setPrice,
  cuisine,
  setCuisine,
}) {
  return (
    <div className="filter-wrapper">
      {/* Veg / Non-Veg / All */}
      <div className={`toggle ${filter}`}>
        <span
          className={filter === "veg" ? "active" : ""}
          onClick={() => setFilter("veg")}
        >
          Veg
        </span>
        <span
          className={filter === "nonveg" ? "active" : ""}
          onClick={() => setFilter("nonveg")}
        >
          Non-Veg
        </span>
        <span
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          All
        </span>
        <div className="slider"></div>
      </div>

      {/* Sort By */}
      <div className="select">
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="">Sort By</option>
          <option value="name">All (A-Z)</option>
          <option value="rating">Rating (High → Low)</option>
          <option value="priceLow">Price (Low → High)</option>
          <option value="priceHigh">Price (High → Low)</option>
        </select>
      </div>

      {/* Price */}
      <div className="select2">
        <select value={price} onChange={(e) => setPrice(e.target.value)}>
          <option value="">Price</option>
          <option value="49-149">₹49 - ₹149</option>
          <option value="149-199">₹149 - ₹199</option>
          <option value="199-299">₹199 - ₹299</option>
          <option value="299+">₹299+</option>
        </select>
      </div>

      {/* Cuisine */}
      {/* <div className="cuising">
        <select value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
          <option value="">Cuisines</option>
          <option value="indian">Indian</option>
          <option value="bakery">Bakery</option>
          <option value="continental">Continental</option>
        </select>
      </div> */}
      <div className="filters-header">


        {(sortBy || price || cuisine || filter !== "all") && (
          <button
            className="clear-filters"
            onClick={() => {
              setSortBy("");
              setPrice("");
              setCuisine("");
              setFilter("all");
            }}
          >
            Reset All ✕
          </button>
        )}
      </div>

    </div>

  );
}

export default Button;
