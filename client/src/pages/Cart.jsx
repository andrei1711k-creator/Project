import Header from "../components/Header";
import { useCart } from "../auth/CartContext";
import "../css/cart.css";

export default function Cart() {
  const { items, loading, removeItem } = useCart();

  return (
    <>
      <Header />

      <div className="cart-wrap" style={{ padding: "32px", maxWidth: "100%", margin: "0 auto" }}>
        <h2>Корзина</h2>

        {loading ? (
          <p>Загрузка...</p>
        ) : items.length === 0 ? (
          <p>Корзина пуста</p>
        ) : (
          items.map((item) => (
            <div className="item"
              key={item.id}
              style={{
                border: "3px solid #002d7a2e",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h4>{item.course?.title || "Загрузка..."}</h4>
                <p>
                  {item.course?.price
                    ? `${item.course.price} ₽`
                    : ""}
                </p>
              </div>

              <button
                onClick={() => removeItem(item.id)}
                style={{
                  background: "#ca3030ff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  padding: "6px 12px",
                  cursor: "pointer",
                }}
              >
                Удалить
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
}
