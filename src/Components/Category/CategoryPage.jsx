import React from "react";
import { useParams } from "react-router-dom";

import Slider from "../Slider/Slider";
import SubCategorySlider from "./SubCategroySlider";
import MaidaItemsAll from "../ViewAll/MaidaItemsAll";


function CategoryPage() {
  const { categoryCode, subCategoryCode } = useParams();

  const isAll = categoryCode === "all";

  return (
    <div>
      {/* ✅ FIX: General Slider sirf "All" page par — specific category ke liye MaidaItemsAll khud apna category banner (Slider1) dikhata hai, warna dono ek saath aake "double banner" dikhta tha */}
      {isAll && <Slider />}

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