import React, { useState } from "react";
import { useParams } from "react-router-dom";

import Slider from "../Slider/Slider";
import ViewAllSlider from "../Slider/ViewAllSlider"; // ✅ NEW — category-specific banner
import SubCategorySlider from "./SubCategroySlider";
import MaidaItemsAll from "../ViewAll/MaidaItemsAll";
import Category from "./Category";

function CategoryPage() {
  const { categoryCode, subCategoryCode } = useParams();
  const [selectedCategory, setSelectedCategory] = useState(null);

  const isAll = categoryCode === "all";

  return (
    <div>

      {isAll ? (
        <Slider />
      ) : (
        <ViewAllSlider category={categoryCode} />
      )}


      <Category onSelectCategory={setSelectedCategory} />


      {!isAll && <SubCategorySlider categoryCode={categoryCode} />}


      <MaidaItemsAll
        categoryCode={categoryCode}
        subCategoryCode={subCategoryCode}
        isAll={isAll}
        showBanner={false}
      />
    </div>
  );
}

export default CategoryPage;