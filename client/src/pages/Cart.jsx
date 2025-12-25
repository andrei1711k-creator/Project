import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useCart } from "../auth/CartContext";
import { useAuth } from "../auth/AuthContext";
import { checkoutCart } from "../api/cart";

export default function Cart() {
  const { items, loading, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  const total = items.reduce(
    (sum, item) => sum + (item.course?.price || 0),
    0
  );

  const handleCheckout = async () => {
    if (!user) {
      alert("Пожалуйста, войдите в систему для оформления заказа");
      navigate("/login");
      return;
    }

    if (items.length === 0) {
      alert("Корзина пуста");
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const result = await checkoutCart();
      alert(`Оплата прошла успешно! Вы приобрели ${result.courses_count} курсов.`);
      clearCart();
      navigate("/profile");
    } catch (error) {
      console.error("Ошибка при оплате:", error);
      setCheckoutError(
        error.response?.data?.detail ||
          "Произошла ошибка при оплате. Пожалуйста, попробуйте снова."
      );
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (!user) {
    return (
      <>
        <Header />
        <main style={styles.page}>
          <div style={styles.wrapper}>
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🔒</div>
              <h3 style={styles.emptyTitle}>Требуется авторизация</h3>
              <p style={styles.emptyText}>
                Пожалуйста, войдите в систему, чтобы просмотреть корзину
              </p>
              <button
                onClick={() => navigate("/login")}
                style={styles.emptyButton}
              >
                Войти в систему
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main style={styles.page}>
        <div style={styles.wrapper}>
          <div style={styles.headerSection}>
            <h1 style={styles.title}>Корзина</h1>
            <p style={styles.subtitle}>
              Оформление покупки выбранных курсов
            </p>
          </div>

          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p style={styles.loadingText}>Загрузка корзины...</p>
            </div>
          ) : items.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🛒</div>
              <h3 style={styles.emptyTitle}>Корзина пуста</h3>
              <p style={styles.emptyText}>
                Добавьте курсы из каталога, чтобы они появились здесь
              </p>
              <button
                onClick={() => navigate("/")}
                style={styles.emptyButton}
              >
                Перейти к курсам
              </button>
            </div>
          ) : (
            <>
              <div style={styles.cartContainer}>
                <div style={styles.cartItems}>
                  <h3 style={styles.sectionTitle}>
                    Ваши курсы ({items.length})
                  </h3>

                  {items.map((item) => (
                    <div key={item.id} style={styles.cartItem}>
                      <div style={styles.itemImage}>
                        <img
                          src={`http://localhost:8000${item.course?.image_url}`}
                          alt={item.course?.title}
                          style={styles.courseImage}
                        />
                      </div>

                      <div style={styles.itemInfo}>
                        <div style={styles.itemHeader}>
                          <h4 style={styles.courseTitle}>
                            {item.course?.title || "Загрузка..."}
                          </h4>
                          <span style={styles.itemPrice}>
                            {item.course?.price
                              ? `${item.course.price} ₽`
                              : "Бесплатно"}
                          </span>
                        </div>

                        {item.course?.description && (
                          <p style={styles.courseDescription}>
                            {item.course.description.length > 120
                              ? `${item.course.description.slice(0, 120)}...`
                              : item.course.description}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        style={styles.removeButton}
                      >
                        Удалить
                      </button>
                    </div>
                  ))}
                </div>

                <div style={styles.summaryCard}>
                  <h3 style={styles.summaryTitle}>Сводка заказа</h3>

                  <div style={styles.summaryDetails}>
                    <div style={styles.summaryRow}>
                      <span style={styles.summaryLabel}>
                        Количество курсов:
                      </span>
                      <span style={styles.summaryValue}>
                        {items.length}
                      </span>
                    </div>

                    <div style={styles.summaryRow}>
                      <span style={styles.summaryLabel}>
                        Общая стоимость:
                      </span>
                      <span style={styles.totalPrice}>{total} ₽</span>
                    </div>
                  </div>

                  {checkoutError && (
                    <div style={styles.errorMessage}>
                      ❌ {checkoutError}
                    </div>
                  )}

                  <button
                    onClick={handleCheckout}
                    disabled={checkoutLoading || items.length === 0}
                    style={{
                      ...styles.checkoutButton,
                      ...(checkoutLoading || items.length === 0
                        ? styles.buttonDisabled
                        : {}),
                    }}
                  >
                    {checkoutLoading ? "Обработка оплаты..." : "Оплатить"}
                  </button>

                  <p style={styles.securityNote}>
                    🔒 Безопасная оплата. Ваши данные защищены.
                  </p>
                </div>
              </div>

              <div style={styles.continueShopping}>
                <button
                  onClick={() => navigate("/")}
                  style={styles.continueButton}
                >
                  ← Продолжить покупки
                </button>
                <button
                  onClick={() => {
                    if (confirm("Вы уверены, что хотите очистить корзину?")) {
                      items.forEach((item) => removeItem(item.id));
                    }
                  }}
                  style={styles.clearCartButton}
                >
                  Очистить корзину
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}


const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    padding: "40px 0",
  },

  wrapper: {
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 20px",
  },

  headerSection: {
    marginBottom: "32px",
    textAlign: "center",
  },

  title: {
    fontSize: "36px",
    fontWeight: "700",
    marginBottom: "8px",
    color: "#1e293b",
    background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },

  subtitle: {
    fontSize: "18px",
    color: "#64748b",
    maxWidth: "600px",
    margin: "0 auto",
    lineHeight: "1.6",
  },

  sectionTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "24px",
  },

  cartContainer: {
    display: "grid",
    gridTemplateColumns: "1fr 380px",
    gap: "32px",
    alignItems: "flex-start",
  },

  cartItems: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  cartItem: {
    display: "flex",
    alignItems: "flex-start",
    padding: "24px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    border: "1px solid #f1f5f9",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
    transition: "all 0.2s",
    ":hover": {
      boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
      borderColor: "#dbeafe",
    },
  },

  itemImage: {
    flexShrink: 0,
    width: "100px",
    height: "80px",
    marginRight: "20px",
  },

  courseImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "10px",
  },

  itemInfo: {
    flex: 1,
    marginRight: "20px",
  },

  itemHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "12px",
  },

  courseTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1e293b",
    margin: 0,
    lineHeight: "1.4",
    flex: 1,
  },

  itemPrice: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#3b82f6",
    whiteSpace: "nowrap",
    marginLeft: "16px",
  },

  courseDescription: {
    fontSize: "14px",
    color: "#64748b",
    lineHeight: "1.6",
    margin: "0 0 12px 0",
  },

  courseMeta: {
    display: "flex",
    gap: "16px",
    fontSize: "13px",
    color: "#94a3b8",
  },

  removeButton: {
    padding: "10px 20px",
    borderRadius: "10px",
    border: "1px solid #fecaca",
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    fontWeight: "500",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.2s",
    whiteSpace: "nowrap",
    flexShrink: 0,
    ":hover": {
      backgroundColor: "#fee2e2",
      borderColor: "#fca5a5",
    },
  },

  summaryCard: {
    position: "sticky",
    top: "32px",
    padding: "28px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    border: "1px solid #f1f5f9",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
  },

  summaryTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "24px",
    paddingBottom: "16px",
    borderBottom: "2px solid #f1f5f9",
  },

  summaryDetails: {
    marginBottom: "24px",
  },

  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },

  summaryLabel: {
    fontSize: "15px",
    color: "#64748b",
  },

  summaryValue: {
    fontSize: "16px",
    fontWeight: "500",
    color: "#1e293b",
  },

  totalPrice: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#3b82f6",
  },

  errorMessage: {
    padding: "12px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "10px",
    color: "#dc2626",
    fontSize: "14px",
    marginBottom: "20px",
  },

  checkoutButton: {
    width: "100%",
    padding: "16px",
    borderRadius: "12px",
    border: "none",
    backgroundColor: "#10b981",
    color: "#ffffff",
    fontWeight: "600",
    fontSize: "16px",
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
    ":hover": {
      backgroundColor: "#059669",
      transform: "translateY(-2px)",
    },
  },

  buttonSpinner: {
    width: "20px",
    height: "20px",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    borderTopColor: "#ffffff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  buttonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
    ":hover": {
      transform: "none",
      backgroundColor: "#10b981",
    },
  },

  paymentMethods: {
    marginBottom: "20px",
    paddingBottom: "20px",
    borderBottom: "1px solid #f1f5f9",
  },

  paymentTitle: {
    fontSize: "14px",
    color: "#64748b",
    marginBottom: "12px",
    display: "block",
  },

  paymentIcons: {
    display: "flex",
    gap: "12px",
  },

  paymentIcon: {
    fontSize: "24px",
  },

  securityNote: {
    fontSize: "12px",
    color: "#94a3b8",
    textAlign: "center",
    marginTop: "16px",
    paddingTop: "16px",
    borderTop: "1px solid #f1f5f9",
  },

  continueShopping: {
    marginTop: "32px",
    paddingTop: "32px",
    borderTop: "2px solid #f1f5f9",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  continueButton: {
    padding: "12px 24px",
    borderRadius: "10px",
    border: "1px solid #dbeafe",
    backgroundColor: "transparent",
    color: "#3b82f6",
    fontWeight: "500",
    fontSize: "15px",
    cursor: "pointer",
    transition: "all 0.2s",
    ":hover": {
      backgroundColor: "#eff6ff",
      borderColor: "#3b82f6",
    },
  },

  clearCartButton: {
    padding: "12px 24px",
    borderRadius: "10px",
    border: "1px solid #fecaca",
    backgroundColor: "transparent",
    color: "#dc2626",
    fontWeight: "500",
    fontSize: "15px",
    cursor: "pointer",
    transition: "all 0.2s",
    ":hover": {
      backgroundColor: "#fef2f2",
      borderColor: "#fca5a5",
    },
  },

  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
    gap: "20px",
  },

  spinner: {
    width: "48px",
    height: "48px",
    border: "3px solid #e2e8f0",
    borderTopColor: "#3b82f6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  loadingText: {
    fontSize: "16px",
    color: "#64748b",
    fontWeight: "500",
  },

  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
    textAlign: "center",
    padding: "40px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    border: "2px dashed #e2e8f0",
  },

  emptyIcon: {
    fontSize: "64px",
    marginBottom: "20px",
    color: "#cbd5e1",
  },

  emptyTitle: {
    fontSize: "22px",
    fontWeight: "600",
    color: "#475569",
    marginBottom: "12px",
  },

  emptyText: {
    fontSize: "16px",
    color: "#94a3b8",
    marginBottom: "24px",
    maxWidth: "400px",
  },

  emptyButton: {
    padding: "12px 24px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    fontWeight: "500",
    fontSize: "15px",
    cursor: "pointer",
    transition: "all 0.2s",
    ":hover": {
      backgroundColor: "#2563eb",
      transform: "translateY(-1px)",
    },
  },
};