import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { updateUser } from "../api/users";
import { getBoughtCourses } from "../api/cart";

export default function Profile() {
  const { user, refreshMe, logout } = useAuth();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    username: user.username,
    email: user.email,
    password: "",
    avatar_url: user.avatar_url || "",
  });

  const [boughtCourses, setBoughtCourses] = useState([]);
  const [loadingBought, setLoadingBought] = useState(false);
  const [focused, setFocused] = useState(null);
  const [saving, setSaving] = useState(false);

  // Загрузка купленных курсов
  useEffect(() => {
    const loadBoughtCourses = async () => {
      if (!user) {
        setBoughtCourses([]);
        return;
      }
      
      setLoadingBought(true);
      try {
        const data = await getBoughtCourses();
        setBoughtCourses(data);
      } catch (error) {
        console.error("Ошибка загрузки купленных курсов:", error);
        setBoughtCourses([]);
      } finally {
        setLoadingBought(false);
      }
    };

    loadBoughtCourses();
  }, [user]);

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

  const handleViewCourse = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  const handleGoToMyCourses = () => {
    navigate("/my-courses");
  };

  return (
    <>
      <Header />

      <main style={styles.page}>
        <div style={styles.wrapper}>
          <h1 style={styles.title}>Профиль</h1>

          <div style={styles.profileContainer}>
            {/* Основная информация профиля */}
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
                  onClick={handleGoToMyCourses}
                >
                  Мои курсы
                </button>

                <button style={styles.dangerBtn} onClick={logout}>
                  Выйти
                </button>
              </div>
            </div>

            {/* Секция купленных курсов */}
            <div style={styles.boughtCoursesSection}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>
                  Купленные курсы
                  {boughtCourses.length > 0 && (
                    <span style={styles.courseCount}>
                      {boughtCourses.length}
                    </span>
                  )}
                </h2>
              </div>

              {loadingBought ? (
                <div style={styles.loadingContainer}>
                  <div style={styles.spinner}></div>
                  <p style={styles.loadingText}>Загрузка курсов...</p>
                </div>
              ) : boughtCourses.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>🛒</div>
                  <h3 style={styles.emptyTitle}>Нет купленных курсов</h3>
                  <p style={styles.emptyText}>
                    Приобретите курсы, чтобы они появились здесь
                  </p>
                  <button 
                    onClick={() => navigate("/")}
                    style={styles.emptyButton}
                  >
                    Перейти к курсам
                  </button>
                </div>
              ) : (
                <div style={styles.coursesGrid}>
                  {boughtCourses.map((item) => (
                    <div 
                      key={item.id} 
                      style={styles.courseCard}
                      onClick={() => handleViewCourse(item.course_id)}
                    >
                      <div style={styles.courseImageContainer}>
                        <img
                          src={`http://localhost:8000${item.course?.image_url || '/static/images/courses/default.png'}`}
                          alt={item.course?.title}
                          style={styles.courseImage}
                        />
                        <div style={styles.boughtBadge}>
                          <span>✓ Куплено</span>
                        </div>
                      </div>
                      
                      <div style={styles.courseContent}>
                        <h3 style={styles.courseTitle}>
                          {item.course?.title || "Курс"}
                        </h3>
                        {item.course?.price !== undefined && (
                          <div style={styles.coursePrice}>
                            {item.course.price === 0 
                              ? "Бесплатно" 
                              : `${item.course.price} ₽`}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
    backgroundColor: "#f8fafc",
    padding: "40px 0",
  },

  wrapper: {
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 20px",
  },

  title: {
    fontSize: "28px",
    fontWeight: 600,
    marginBottom: "32px",
    color: "#1f2937",
  },

  profileContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "32px",
  },

  card: {
    width: "100%",
    padding: "32px",
    borderRadius: "16px",
    border: "1px solid #e5e7eb",
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
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
    flexWrap: "wrap",
  },

  primaryBtn: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s",
    ":hover": {
      backgroundColor: "#2563eb",
    },
  },

  secondaryBtn: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid #dbeafe",
    backgroundColor: "#f8fafc",
    color: "#1f2937",
    cursor: "pointer",
    transition: "all 0.2s",
    ":hover": {
      backgroundColor: "#f1f5f9",
    },
  },

  dangerBtn: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#ef4444",
    color: "#ffffff",
    cursor: "pointer",
    transition: "all 0.2s",
    ":hover": {
      backgroundColor: "#dc2626",
    },
  },

  boughtCoursesSection: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "32px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    paddingBottom: "16px",
    borderBottom: "2px solid #f1f5f9",
  },

  sectionTitle: {
    fontSize: "20px",
    fontWeight: 600,
    color: "#1f2937",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  courseCount: {
    backgroundColor: "#10b981",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 500,
    padding: "4px 12px",
    borderRadius: "20px",
  },

  coursesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
  },

  courseCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #f1f5f9",
    overflow: "hidden",
    cursor: "pointer",
    transition: "all 0.3s ease",
    ":hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 12px 24px rgba(59, 130, 246, 0.12)",
      borderColor: "#dbeafe",
    },
  },

  courseImageContainer: {
    position: "relative",
    width: "100%",
    height: "160px",
    overflow: "hidden",
  },

  courseImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  boughtBadge: {
    position: "absolute",
    top: "12px",
    right: "12px",
    backgroundColor: "#10b981",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: 600,
    padding: "4px 10px",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },

  courseContent: {
    padding: "16px",
  },

  courseTitle: {
    fontSize: "16px",
    fontWeight: 600,
    color: "#1f2937",
    marginBottom: "8px",
    lineHeight: "1.4",
  },

  coursePrice: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#3b82f6",
  },

  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "200px",
    gap: "16px",
  },

  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #e2e8f0",
    borderTopColor: "#3b82f6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  loadingText: {
    fontSize: "14px",
    color: "#64748b",
  },

  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    textAlign: "center",
  },

  emptyIcon: {
    fontSize: "48px",
    marginBottom: "16px",
    color: "#cbd5e1",
  },

  emptyTitle: {
    fontSize: "18px",
    fontWeight: 600,
    color: "#475569",
    marginBottom: "8px",
  },

  emptyText: {
    fontSize: "14px",
    color: "#94a3b8",
    marginBottom: "20px",
    maxWidth: "300px",
  },

  emptyButton: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    fontWeight: 500,
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.2s",
    ":hover": {
      backgroundColor: "#2563eb",
    },
  },
};