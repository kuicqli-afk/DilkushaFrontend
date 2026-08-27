import React, { useState } from "react";
import { useParams } from "react-router-dom";

import Slider from "../Slider/Slider";
import SubCategorySlider from "./SubCategroySlider";
import MaidaItemsAll from "../ViewAll/MaidaItemsAll";
import Category from "./Category";

function CategoryPage() {
  const { categoryCode, subCategoryCode } = useParams();
  const [selectedCategory, setSelectedCategory] = useState(null);

  const isAll = categoryCode === "all";

  return (
    <div>
      {isAll && <Slider />}

      {/* ✅ NEW — Category list ab har View All / Category page pe dikhega */}
      <Category onSelectCategory={setSelectedCategory} />

      {/* Subcategory only when NOT all */}
      {!isAll && <SubCategorySlider categoryCode={categoryCode} />}

      <MaidaItemsAll
        categoryCode={categoryCode}
        subCategoryCode={subCategoryCode}
        isAll={isAll}
      />
    </div>
  );
}

export default CategoryPage;