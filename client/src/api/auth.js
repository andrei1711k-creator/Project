import api from "./axios";

export const login = async (username, password) => {
  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  await api.post("/auth/login", formData);
};

export const register = async (username, password) => {
  await api.post("/auth/register", {
    username,
    password,
  });
};

export const logout = async () => {
  await api.post("/auth/logout");
};

export const getMe = async () => {
  const res = await api.get("/users/me");
  return res.data;
};
