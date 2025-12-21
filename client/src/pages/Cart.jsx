import Header from "../components/Header";
import { useCart } from "../auth/CartContext";

export default function Cart() {
  const { items, loading, removeItem } = useCart();

  return (
    <>
      <Header />

      <div style={{ padding: "32px", maxWidth: "800px", margin: "0 auto" }}>
        <h2>Корзина</h2>

        {loading ? (
          <p>Загрузка...</p>
        ) : items.length === 0 ? (
          <p>Корзина пуста</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              style={{
                border: "1px solid #e5e5e5",
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
                  background: "#ff4d4f",
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
