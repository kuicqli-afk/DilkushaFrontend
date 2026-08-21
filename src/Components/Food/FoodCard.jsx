import { useNavigate } from "react-router-dom";

const FoodCard = ({ item }) => {
  const navigate = useNavigate();

  const goToOrder = () => {
    navigate("/order", {
      state: {
        item: {
          ...item,
          restaurantId: "mashi",
        },
        quantity: 1,
      },
    });
  };

  return <button onClick={goToOrder}>Order Now</button>;
};

export default FoodCard;
