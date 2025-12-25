import api from "./axios";

export const getCategories = async () => {
  const res = await api.get("/categories/");
  return res.data;
};

export const createCategory = async (data) => {
  const res = await api.post("/categories/", data);
  return res.data;
};

export const deleteCategory = async (id) => {
  await api.delete(`/categories/${id}`);
};
