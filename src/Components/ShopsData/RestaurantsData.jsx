

import Mashi from "../../assets/mashi.jpg";
import Restaurant2 from "../../assets/bakas.jpg";

export const restaurantsData = [
  {
    id: 1,
    title: "Mashi Restaurant",
    license: "12345",
    address:
      "3-4 Complex, Qyasak-4, Opposite Khun Khun Ji Girls Degree College, Chowk, Lucknow Uttar Pradesh",
    phone: "+91 7081165795",
    timing: "11:00 AM - 11:00 PM",
    status: "Open",
    isOpen: true,
    rating: 4.5,
   
    reviews: "4.2K",
    followers: "1.2K",
    foods: 25,
    orders: 500,
    image: Mashi,

    // ✅ ADD THIS
    branches: [
      {
        id: 1,
        name: "Chowk Branch",
        address: "Chowk, Lucknow",
        timing: "11:00 AM - 11:00 PM",
        phone: "+91 7081165795",
      },
      {
        id: 2,
        name: "Alambagh Branch",
        address: "Alambagh, Lucknow",
        timing: "10:30 AM - 10:30 PM",
        phone: "+91 7081165796",
      },
    ],
  },

  {
    id: 2,
    title: "Barkaas Indo-Arabic Restaurant",
    license: "67890",
    address:
      "Plot No- 1&2, near Mira Bai Marg, beside Shakti Bhavan, Hazratganj, Lucknow.",
    phone: "+91 9123456780",
    timing: "10:00 AM - 10:30 PM",
    status: "Open",
    isOpen: true,
    rating: 4.8,
    reviews: "4.8K",
    followers: "2.1K",
    foods: 40,
    orders: 800,
    image: Restaurant2,

    // ✅ ADD THIS
    branches: [
      {
        id: 1,
        name: "Hazratganj Branch",
        address: "Hazratganj, Lucknow",
        timing: "10:00 AM - 10:30 PM",
        phone: "+91 9123456780",
      },
      {
        id: 2,
        name: "Indira Nagar Branch",
        address: "Indira Nagar, Lucknow",
        timing: "11:00 AM - 11:00 PM",
        phone: "+91 9123456781",
      },
    ],
  },
];

