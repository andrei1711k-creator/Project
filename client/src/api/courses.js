// src/api/courses.js
import api from "./axios";

export const getCourses = async () => {
  const res = await api.get("/courses");
  return res.data;
};

export const getMyCourses = () =>
  api.get("/courses/my").then(res => res.data);

export const createMyCourse = (formData) =>
  api.post("/courses/my", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateMyCourse = (id, data) =>
  api.put(`/courses/my/${id}`, data);

export const deleteMyCourse = (id) =>
  api.delete(`/courses/my/${id}`);

