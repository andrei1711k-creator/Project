// src/api/courses.js
import api from "./axios";

// 🔹 GET /courses с фильтрацией и поиском
export const getCourses = (params = {}) => 
  api.get("/courses/", { params }).then(res => res.data);

// 🔹 GET /courses/my
export const getMyCourses = () =>
  api.get("/courses/my").then(res => res.data);

// 🔹 POST /courses/my (создание курса с FormData)
export const createMyCourse = (formData) =>
  api.post("/courses/my", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// 🔹 PUT /courses/my/:id (обновление курса)
export const updateMyCourse = (id, data) =>
  api.put(`/courses/my/${id}`, data).then(res => res.data);

// 🔹 DELETE /courses/my/:id
export const deleteMyCourse = (id) =>
  api.delete(`/courses/my/${id}`).then(res => res.data);
