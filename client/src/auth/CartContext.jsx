import { createContext, useContext, useEffect, useState } from "react";
import { getCart, deleteCartItem, getBoughtCourses } from "../api/cart";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [boughtCourses, setBoughtCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Загрузка корзины
  useEffect(() => {
    if (!user) {
      setItems([]);
      setBoughtCourses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([
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
        }),
      
      getBoughtCourses()
        .then((boughtData) => {
          setBoughtCourses(boughtData);
        })
        .catch((err) => {
          console.error("Ошибка загрузки купленных курсов", err);
          setBoughtCourses([]);
        })
    ]).finally(() => setLoading(false));
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

  // Функция для обновления купленных курсов
  const refreshBoughtCourses = async () => {
    if (!user) {
      setBoughtCourses([]);
      return;
    }
    
    try {
      const data = await getBoughtCourses();
      setBoughtCourses(data);
    } catch (error) {
      console.error("Ошибка обновления купленных курсов:", error);
    }
  };

  // Добавляем курс в корзину
  const addItem = (newItem) => {
    setItems((prev) => [...prev, newItem]);
  };

  // Проверка, куплен ли курс
  const isCourseBought = (courseId) => {
    return boughtCourses.some(bought => bought.course_id === courseId);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        setItems,
        boughtCourses,
        isCourseBought,
        loading,
        removeItem,
        clearCart,
        refreshBoughtCourses,
        addItem,
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