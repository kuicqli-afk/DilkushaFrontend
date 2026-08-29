import React, { useState, useCallback } from "react";
import { useParams } from "react-router-dom";

import Slider from "../Slider/Slider";
import ViewAllSlider from "../Slider/ViewAllSlider";
import SubCategorySlider from "./SubCategroySlider";
import MaidaItemsAll from "../ViewAll/MaidaItemsAll";
import Category from "./Category";

function CategoryPage() {
  const { categoryCode, subCategoryCode } = useParams();
  const [selectedCategory, setSelectedCategory] = useState(null);

  // null = loading, true = has subcategories, false = no subcategories
  const [hasSubcategories, setHasSubcategories] = useState(null);

  const handleHasSubcategoriesChange = useCallback((value) => {
    setHasSubcategories(value);
  }, []);

  const isAll = categoryCode === "all";

  return (
    <div>

      {/* Top Banner */}
      {isAll ? <Slider /> : <ViewAllSlider category={categoryCode} />}

      {/*
        ✅ SMART NAVIGATION ROW:
        - Agar category ki subcategories hain → sirf SubCategorySlider dikhao
        - Agar subcategories nahi hain       → sirf Category full list dikhao
        - isAll page par → sirf Category full list dikhao
      */}

      {isAll ? (
        /* "All" page: show full category list */
        <Category onSelectCategory={setSelectedCategory} />
      ) : (
        <>
          {/* SubCategorySlider: hamesha render karo taaki check ho sake (returns null if empty) */}
          <SubCategorySlider
            categoryCode={categoryCode}
            onHasSubcategoriesChange={handleHasSubcategoriesChange}
          />

          {/* Category list: sirf tab dikhao jab subcategories NAHI hain */}
          {hasSubcategories === false && (
            <Category onSelectCategory={setSelectedCategory} />
          )}
        </>
      )}

      {/* Products */}
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