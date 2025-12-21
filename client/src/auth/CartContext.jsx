import { createContext, useContext, useEffect, useState } from "react";
import { getCart, deleteCartItem } from "../api/cart";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    getCart()
      .then((cartData) => {
        const normalized = cartData.map((item) => ({
          ...item,
          course:
            item.course || {
              id: item.course_id,
              title: "Загрузка...",
              price: 0,
            },
        }));
        setItems(normalized);
      })
      .catch((err) => {
        console.error("Ошибка загрузки корзины", err);
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const removeItem = async (cartId) => {
    try {
      await deleteCartItem(cartId);
      setItems((prev) => prev.filter((item) => item.id !== cartId));
    } catch (err) {
      console.error("Ошибка удаления из корзины", err);
      alert("Не удалось удалить курс из корзины");
    }
  };

  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider
      value={{
        items,
        setItems,
        loading,
        removeItem,
        clearCart,
        count: items.length,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
};
