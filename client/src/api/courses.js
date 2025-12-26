import api from "./axios";

export const getCourses = (params = {}) => 
  api.get("/courses/", { params }).then(res => res.data);

export const getMyCourses = () =>
  api.get("/courses/my").then(res => res.data);

export const createMyCourse = (formData) =>
  api.post("/courses/my", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateMyCourse = (id, data) =>
  api.patch(`/courses/my/${id}`, data).then(res => res.data);

export const deleteMyCourse = (id) =>
  api.delete(`/courses/my/${id}`).then(res => res.data);
