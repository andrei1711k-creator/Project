import { useState } from "react";
import { useCart } from "../auth/CartContext";
import { useAuth } from "../auth/AuthContext";
import { addToCart } from "../api/cart";
import "../css/card.css";
// import Img from "../images/courseIcon.svg"; 

export default function CourseCard({ course }) {
  const { user } = useAuth();
  const { items, setItems } = useCart();
  const [loading, setLoading] = useState(false);

  const isInCart = items.some(
    (item) => item.course?.id === course.id
  );

  const handleBuy = async () => {
    if (!user) {
      alert("Пожалуйста, войдите, чтобы добавить курс в корзину.");
      return;
    }

    if (isInCart) {
      alert("Этот курс уже в корзине");
      return;
    }

    setLoading(true);
    try {
      const newItem = await addToCart({ course_id: course.id });

      setItems((prev) => [
        ...prev,
        {
          ...newItem,
          course:
            newItem.course || {
              id: course.id,
              title: course.title,
              price: course.price,
            },
        },
      ]);
    } catch (err) {
      console.error(err);
      alert("Не удалось добавить курс в корзину");
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="card" style={styles.card}>
    <img
      src={`http://localhost:8000${course.image_url}`}
      alt={course.title}
      style={styles.image}
    />

    <h3>{course.title}</h3>
    <p>{course.description}</p>

    <div style={styles.footer}>
      <span>{course.price} ₽</span>
      <button onClick={handleBuy} disabled={loading || isInCart}>
        {isInCart ? "В корзине" : loading ? "Добавление..." : "Купить"}
      </button>
    </div>
  </div>
);
}

const styles = {
  card: {
    border: "1px solid #e5e5e5",
    borderRadius: "16px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "16px",
  },
  image: {
  width: "100%",
  height: "180px",
  objectFit: "cover",
  borderRadius: "12px",
  marginBottom: "12px",
},
};
