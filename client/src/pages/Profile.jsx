import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { updateUser } from "../api/users";

export default function Profile() {
  const { user, refreshMe, logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: user.username,
    email: user.email,
    password: "",
    avatar_url: user.avatar_url || "",
  });

  const [focused, setFocused] = useState(null);
  const [saving, setSaving] = useState(false);

  const inputStyle = (name) => ({
    ...styles.input,
    borderColor: focused === name ? "#3b82f6" : "#dbeafe",
    boxShadow:
      focused === name
        ? "0 0 0 3px rgba(59, 130, 246, 0.15)"
        : "none",
  });

  const handleSave = async () => {
    setSaving(true);

    const payload = { ...form };
    if (!payload.password) delete payload.password;

    try {
      await updateUser(user.id, payload);
      await refreshMe();
      alert("Профиль обновлён");
    } catch {
      alert("Ошибка при сохранении профиля");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header />

      <main style={styles.page}>
        <div style={styles.wrapper}>
          <h1 style={styles.title}>Профиль</h1>

          <div style={styles.card}>
            <div style={styles.avatarBlock}>
              <img
                src={form.avatar_url || "/default-avatar.png"}
                alt="avatar"
                style={styles.avatar}
              />
            </div>

            <div style={styles.form}>
              <input
                placeholder="Username"
                value={form.username}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
                style={inputStyle("username")}
                onFocus={() => setFocused("username")}
                onBlur={() => setFocused(null)}
              />

              <input
                placeholder="Email"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                style={inputStyle("email")}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
              />

              <input
                placeholder="New password"
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                style={inputStyle("password")}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
              />

              <input
                placeholder="Avatar URL"
                value={form.avatar_url}
                onChange={(e) =>
                  setForm({ ...form, avatar_url: e.target.value })
                }
                style={inputStyle("avatar")}
                onFocus={() => setFocused("avatar")}
                onBlur={() => setFocused(null)}
              />
            </div>

            <div style={styles.actions}>
              <button style={styles.primaryBtn} onClick={handleSave}>
                {saving ? "Сохранение…" : "Сохранить"}
              </button>

              <button
                style={styles.secondaryBtn}
                onClick={() => navigate("/my-courses")}
              >
                Мои курсы
              </button>

              <button style={styles.dangerBtn} onClick={logout}>
                Выйти
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#ffffff",
    padding: "40px 0",
    display: "flex",
    justifyContent: "center",
  },

  wrapper: {
    width: "100%",
    maxWidth: "1100px",
    padding: "0 40px",
  },

  title: {
    fontSize: "28px",
    fontWeight: 600,
    marginBottom: "24px",
    color: "#1f2937",
  },

  card: {
    width: "100%",
    padding: "32px",
    borderRadius: "16px",
    border: "1px solid #e5e7eb",
    backgroundColor: "#ffffff",
  },

  avatarBlock: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "24px",
  },

  avatar: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #dbeafe",
  },

  form: {
    display: "grid",
    gap: "12px",
    marginBottom: "24px",
  },

  input: {
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #dbeafe",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    backgroundColor: "#ffffff",
    color: "#1f2937",
  },

  actions: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },

  primaryBtn: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    fontWeight: 500,
    cursor: "pointer",
  },

  secondaryBtn: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid #dbeafe",
    backgroundColor: "#f8fafc",
    color: "#1f2937",
    cursor: "pointer",
  },

  dangerBtn: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#ef4444",
    color: "#ffffff",
    cursor: "pointer",
  },
};
