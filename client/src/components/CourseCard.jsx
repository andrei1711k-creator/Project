import { useState } from "react";
import { useCart } from "../auth/CartContext";
import { useAuth } from "../auth/AuthContext";
import { addToCart } from "../api/cart";

export default function CourseCard({ course, isBought = false }) {
  const { user } = useAuth();
  const { items, setItems } = useCart();
  const [loading, setLoading] = useState(false);

  const isOwner = user && course.owner_id === user.id;
  const isInCart = items.some((item) => item.course?.id === course.id);

  const imageSrc = course.image_url
    ? course.image_url.startsWith("http")
      ? course.image_url
      : `http://localhost:8000${course.image_url}`
    : "/no-image.png";

  const handleBuy = async () => {
    if (!user) {
      alert("Пожалуйста, войдите, чтобы добавить курс в корзину.");
      return;
    }

    if (isBought || isOwner || isInCart) return;

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
    } catch (e) {
      console.error(e);
      alert("Не удалось добавить курс в корзину");
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    if (isOwner) return "Ваш курс";
    if (isBought) return "Куплено";
    if (isInCart) return "В корзине";
    if (loading) return "Добавление...";
    return "Купить";
  };

  return (
    <div style={styles.card}>
      <img src={imageSrc} alt={course.title} style={styles.image} />

      <div style={styles.content}>
        <h3 style={styles.title}>{course.title || "Без названия"}</h3>

        <p style={styles.description}>
          {course.description
            ? course.description.length > 120
              ? `${course.description.slice(0, 120)}...`
              : course.description
            : "Описание отсутствует"}
        </p>

        {/* 🔹 Длительность и формат */}
        <div style={styles.meta}>
          {course.duration_hours != null && (
            <span style={styles.metaItem}>⏱ {course.duration_hours} ч</span>
          )}
          {course.format && (
            <span style={styles.metaItem}>
              📁 {course.format.toUpperCase()}
            </span>
          )}
        </div>

        <div style={styles.footer}>
          <span style={styles.price}>
            {course.price === 0 ? "Бесплатно" : `${course.price} ₽`}
          </span>

          <button
            onClick={handleBuy}
            disabled={loading || isBought || isOwner || isInCart}
            style={{
              ...styles.button,
              ...(isBought && styles.boughtButton),
              ...(isOwner && styles.ownerButton),
              ...((loading || isInCart || isOwner || isBought)
                ? styles.buttonDisabled
                : {}),
            }}
          >
            {getButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
}


const styles = {
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    overflow: "hidden",
    border: "1px solid #f1f5f9",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.04)",
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },

  image: {
    width: "100%",
    height: "180px",
    objectFit: "cover",
    backgroundColor: "#f1f5f9",
  },

  content: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
  },

  title: {
    fontSize: "18px",
    fontWeight: 600,
    color: "#1e293b",
    marginBottom: "8px",
    lineHeight: "1.4",
  },

  description: {
    fontSize: "14px",
    color: "#64748b",
    lineHeight: "1.6",
    marginBottom: "12px",
    flexGrow: 1,
  },

  meta: {
    display: "flex",
    gap: "10px",
    marginBottom: "16px",
    flexWrap: "wrap",
  },

  metaItem: {
    fontSize: "13px",
    backgroundColor: "#f1f5f9",
    padding: "4px 10px",
    borderRadius: "999px",
    color: "#475569",
    fontWeight: 500,
    whiteSpace: "nowrap",
  },

  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
    paddingTop: "12px",
    borderTop: "1px solid #f1f5f9",
  },

  price: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#3b82f6",
  },

  button: {
    padding: "10px 20px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    fontWeight: 500,
    fontSize: "14px",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },

  buttonDisabled: {
    backgroundColor: "#cbd5e1",
    cursor: "not-allowed",
  },

  boughtButton: {
    backgroundColor: "#10b981",
    cursor: "not-allowed",
  },

  ownerButton: {
    backgroundColor: "#8b5cf6",
    cursor: "not-allowed",
  },
};

