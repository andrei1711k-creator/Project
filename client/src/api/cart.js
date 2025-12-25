// src/api/cart.js
import api from "./axios";

export const addToCart = async ({ course_id }) => {
  const res = await api.post("/cart", { course_id });
  return res.data;
};

export const getCart = async () => {
  const res = await api.get("/cart");
  return res.data;
};

export const deleteCartItem = async (cartId) => {
  await api.delete(`/cart/${cartId}`);
};

export const checkoutCart = async () => {
  const res = await api.post("/cart/checkout");
  return res.data;
};

export const getBoughtCourses = async () => {
  const res = await api.get("/bought-courses/user/me");
  return res.data;
};

export const clearCart = async () => {
  await api.delete("/cart");
};