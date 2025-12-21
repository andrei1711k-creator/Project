// src/api/courses.js
import api from "./axios";

export const getCourses = async () => {
  const res = await api.get("/courses");
  return res.data;
};
