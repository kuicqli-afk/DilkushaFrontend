import slide1 from "./assets/bnanner (1).png";
import slide2 from "./assets/bnanner (1).png";
import slide3 from "./assets/bnanner (1).png";

const ShopData = [
  {
    id: "shyam",
    title: "Shyam Bakery",
    address: "Main Market",
    phone: "9999999999",
    rating: 4.5,

    slides: [slide1, slide2],

    categories: [
      { name: "Cakes", id: "cakes" },
      { name: "Pastries", id: "pastries" }
    ]
  },
  {
    id: "krishna",
    title: "Krishna Namkeen",
    address: "Station Road",
    phone: "8888888888",
    rating: 4.2,

    slides: [slide2, slide3],

    categories: [
      { name: "Namkeen", id: "namkeen" },
      { name: "Chips", id: "chips" }
    ]
  }
];

export default ShopData;
