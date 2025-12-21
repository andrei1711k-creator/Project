// src/api/cart.js
import api from "./axios";

export const addToCart = async ({ course_id }) => {
  const res = await api.post("/cart", { course_id });
  return res.data;
};

// Получаем корзину текущего пользователя
export const getCart = async () => {
  const res = await api.get("/cart");
  return res.data;
};

export const deleteCartItem = async (cartId) => {
  await api.delete(`/cart/${cartId}`);
};
