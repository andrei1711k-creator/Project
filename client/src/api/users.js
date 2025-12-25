import api from "./axios";

export const updateUser = (userId, data) =>
  api.patch(`/users/${userId}`, data);

export const getMe = () =>
  api.get("/users/me");
