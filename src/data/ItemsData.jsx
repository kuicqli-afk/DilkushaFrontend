import cookies1 from "../assets/poster.jpg";
import cookies2 from "../assets/poster1.jpg";
import cookies3 from "../assets/poster2.jpg";
import cookies4 from "../assets/poster3.jpg";
import cookies5 from "../assets/poster.jpg";
import cookies6 from "../assets/poster2.jpg";
import cookies7 from "../assets/poster.jpg";
import cookies8 from "../assets/poster3.jpg";

import localVideo from "../assets/paratha1.mp4";
import video from '../assets/video.mp4'
import video2 from '../assets/video2.mp4'
import dipawali from '../assets/dipawali.mp4'
import danbro from '../assets/danbro.mp4'

const ItemsData = [
  {
    id: 1,
    image: cookies1,
    images: [cookies2, cookies3, cookies4, cookies2],

    // ✅ Local MP4 (works)
    video: video,

    // ✅ Optional Online Link (if you want)
    // videoUrl: "https://www.instagram.com/p/DRwxZMgEmYW/embed",

    title: "Crunchy & Sweet Gud Gajak",
    portion: "4 Pieces",
    desc:
      "Savor the traditional flavor of Gud Gajak – crispy sesame seeds coated in pure jaggery. A perfect snack for festivals, gifting, or enjoying anytime with your loved ones.",
    rating: "4.6",
    reviews: "6.1k",
    orders: "1100",
    status: "Open - Close at 11:00pm",
    slots: ["10:00-11:00", "12:00-1:00", "2:00-3:00"],
    isOpen: true,
    view: "5.2k",
    type: "veg",
    price: 49,
    offer: 79,
    off: 20,
    restaurantId: 1,
  },
  {
    id: 2,
    image: cookies2,
    images: [cookies3, cookies4, cookies1, cookies6],

    // ✅ Image only (works)
    // video: video,
    // videoUrl: "https://example.com/video.mp4",

    title: "Crispy & Flavorful Nautiyum Namkeen",
    portion: "4 Pieces",
    desc:
      "Delight in the authentic taste of Nautiyum Namkeen – perfectly spiced, crunchy snacks that are ideal for tea-time, parties, or on-the-go munching. A savory treat everyone loves!",
    rating: "4.8",
    reviews: "8.3k",
    orders: "1500",
    status: "Close - Open at 11:00pm",
    slots: "",
    isOpen: false,
    view: "3.6k",
    type: "veg",
    price: 69,
    offer: 109,
    off: 25,
    restaurantId: 1,
  },
  {
    id: 3,
    image: cookies2,
    images: [cookies4, cookies1, cookies5, cookies6],

    // ✅ Online direct MP4 link (works)
     videoUrl: "",

    // ✅ Or Local MP4 (works)
    // video: video,

    title: "Spicy & Crunchy Moong Mixture",
    portion: "4 Pieces",
    desc:
      "Enjoy the perfect blend of roasted moong, spices, and crunchy bites in our Moong Mixture – a savory snack that’s full of flavor and perfect for anytime munching!",
    rating: "4.7",
    reviews: "5.9k",
    orders: "980",
    status: "Open - Close at 10:30pm",
    slots: "",
    isOpen: true,
    view: "4.3k",
    type: "veg",
    price: 89,
    offer: 129,
    off: 15,
    restaurantId: 1,
  },
  {
    id: 4,
    image: cookies1,
    images: [cookies1, cookies2, cookies4, cookies3],
    //  video: video2,
    // ✅ YouTube / Instagram embed link (works via iframe)
    // videoUrl: "https://www.youtube.com/embed/VIDEO_ID",


    title: "Delicious Sakhe Treats Cruchy & Mazedaar",
    portion: "4 Pieces",
    desc:
      "Experience the perfect blend of crunch and flavor with our Crispy & Tasty Sakhe – your go-to snack for every mood and occasion!",
    rating: "4.5",
    reviews: "4.2k",
    orders: "720",
    status: "Close - Open at 08:00am",
    slots: "",
    isOpen: false,
    view: "9.9k",
    type: "veg",
    price: 59,
    offer: 89,
    off: 18,
    restaurantId: 1,
  },
  {
    id: 5,
    image: cookies3,
    images: [cookies1, cookies2, cookies3, cookies4],
      video: video2,
    title: "Crunchy & Sweet Gud Gajak",
    portion: "4 Pieces",
    desc:
      "Savor the traditional flavor of Gud Gajak – crispy sesame seeds coated in pure jaggery. A perfect snack for festivals, gifting, or enjoying anytime with your loved ones.",
    rating: "4.8",
    reviews: "7.4k",
    orders: "1200",
    status: "Open - Close at 10:30pm",
    slots: "",
    isOpen: true,
    view: "6.2k",
    type: "veg",
    price: 79,
    offer: 119,
    off: 20,
    restaurantId: 1,
  },
  {
    id: 6,
    image: cookies6,
    images: [cookies5, cookies3, cookies2, cookies7],
    // video: dipawali,
    title: "Spicy & Crunchy Moong Mixture",
    portion: "4 Pieces",
    desc:
      "Enjoy the perfect blend of roasted moong, spices, and crunchy bites in our Moong Mixture – a savory snack that’s full of flavor and perfect for anytime munching!",
    rating: "4.6",
    reviews: "3.9k",
    orders: "650",
    status: "Open - Close at 10:30pm",
    slots: "",
    isOpen: true,
    view: "3.5k",
    type: "veg",
    price: 99,
    offer: 149,
    off: 18,
    restaurantId: 1,
  },
  {
    id: 7,
    image: cookies4,
    images: [cookies3, cookies6, cookies4, cookies2],
    // video: dipawali,
    title: "Crunchy & Sweet Gud Gajak",
    portion: "4 Pieces",
    desc:
      "Savor the traditional flavor of Gud Gajak – crispy sesame seeds coated in pure jaggery. A perfect snack for festivals, gifting, or enjoying anytime with your loved ones.",
    rating: "4.4",
    reviews: "2.8k",
    orders: "480",
    status: "Close - Open at 08:00pm",
    slots: "",
    isOpen: false,
    view: "1.2k",
    type: "veg",
    price: 79,
    offer: 119,
    off: 15,
    restaurantId: 1,
  },
  {
    id: 8,
    image: cookies3,
    images: [cookies1, cookies3, cookies1, cookies5],
    // video: danbro,
    title: "Delicious Sakhe Treats Cruchy & Mazedaar",
    portion: "4 Pieces",
    desc:
      "Experience the perfect blend of crunch and flavor with our Crispy & Tasty Sakhe – your go-to snack for every mood and occasion!",
    rating: "4.8",
    reviews: "7.4k",
    orders: "1200",
    status: "Open - Close at 10:30pm",
    slots: "",
    isOpen: true,
    view: "6.7k",
    type: "veg",
    price: 79,
    offer: 119,
    off: 20,
    restaurantId: 1,
  },
];

export default ItemsData;
