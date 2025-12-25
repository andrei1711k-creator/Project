import { useEffect, useState } from "react";
import {
  getMyCourses,
  createMyCourse,
  updateMyCourse,
  deleteMyCourse,
} from "../api/courses";
import { getCategories } from "../api/categories";
import Header from "../components/Header";

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingCourse, setEditingCourse] = useState(null);
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [focused, setFocused] = useState(null);

  const [form, setForm] = useState({
    title: "",
    format: "",
    description: "",
    price: "",
    duration_hours: "",
    category_id: "",
  });

  useEffect(() => {
    getMyCourses().then(setCourses);
    getCategories().then(setCategories);
  }, []);

  const inputStyle = (name) => ({
    ...styles.input,
    borderColor: focused === name ? "#3b82f6" : "#dbeafe",
    boxShadow:
      focused === name
        ? "0 0 0 3px rgba(59, 130, 246, 0.15)"
        : "none",
  });

  const resetForm = () => {
    setForm({
      title: "",
      format: "",
      description: "",
      price: "",
      duration_hours: "",
      category_id: "",
    });
    setImage(null);
    setEditingCourse(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingCourse) {
        const updated = await updateMyCourse(editingCourse.id, {
          ...form,
          price: Number(form.price),
          duration_hours: Number(form.duration_hours),
        });

        setCourses((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        );
      } else {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        fd.append("image", image);

        const newCourse = await createMyCourse(fd);
        setCourses((prev) => [...prev, newCourse]);
      }

      resetForm();
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (course) => {
    setEditingCourse(course);
    setForm({
      title: course.title,
      format: course.format,
      description: course.description,
      price: course.price,
      duration_hours: course.duration_hours,
      category_id: course.category_id,
    });
    setImage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Удалить курс?")) return;
    await deleteMyCourse(id);
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <>
      <Header />

      <main style={styles.page}>
        <div style={styles.wrapper}>
          <h1 style={styles.title}>Мои курсы</h1>

          <div style={styles.card}>
            <h2 style={styles.subtitle}>
              {editingCourse ? "Редактировать курс" : "Создать курс"}
            </h2>

            <form onSubmit={submit} style={styles.form}>
              <input
                placeholder="Название"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                onFocus={() => setFocused("title")}
                onBlur={() => setFocused(null)}
                required
                style={inputStyle("title")}
              />

              <input
                placeholder="Формат"
                value={form.format}
                onChange={(e) => setForm({ ...form, format: e.target.value })}
                onFocus={() => setFocused("format")}
                onBlur={() => setFocused(null)}
                required
                style={inputStyle("format")}
              />

              <textarea
                placeholder="Описание"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                onFocus={() => setFocused("description")}
                onBlur={() => setFocused(null)}
                required
                style={inputStyle("description")}
              />

              <div style={styles.row}>
                <input
                  type="number"
                  placeholder="Цена"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  onFocus={() => setFocused("price")}
                  onBlur={() => setFocused(null)}
                  required
                  style={inputStyle("price")}
                />

                <input
                  type="number"
                  placeholder="Часы"
                  value={form.duration_hours}
                  onChange={(e) =>
                    setForm({ ...form, duration_hours: e.target.value })
                  }
                  onFocus={() => setFocused("hours")}
                  onBlur={() => setFocused(null)}
                  required
                  style={inputStyle("hours")}
                />
              </div>

              <select
                value={form.category_id}
                onChange={(e) =>
                  setForm({ ...form, category_id: e.target.value })
                }
                onFocus={() => setFocused("category")}
                onBlur={() => setFocused(null)}
                required
                style={inputStyle("category")}
              >
                <option value="">Выберите категорию</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {!editingCourse && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                  required
                  style={styles.fileInput}
                />
              )}

              <div style={styles.actions}>
                <button style={styles.primaryBtn} disabled={saving}>
                  {saving
                    ? "Сохранение…"
                    : editingCourse
                    ? "Сохранить"
                    : "Создать"}
                </button>

                {editingCourse && (
                  <button
                    type="button"
                    onClick={resetForm}
                    style={styles.secondaryBtn}
                  >
                    Отмена
                  </button>
                )}
              </div>
            </form>
          </div>

          <div style={styles.grid}>
            {courses.map((c) => (
              <div key={c.id} style={styles.courseCard}>
                <img
                  src={`http://localhost:8000${c.image_url}`}
                  alt=""
                  style={styles.image}
                />

                <div style={styles.courseInfo}>
                  <h3 style={styles.courseTitle}>{c.title}</h3>

                  <div style={styles.cardActions}>
                    <button
                      style={styles.linkBtn}
                      onClick={() => startEdit(c)}
                    >
                      Редактировать
                    </button>

                    <button
                      style={styles.deleteBtn}
                      onClick={() => handleDelete(c.id)}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            ))}
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

  subtitle: {
    fontSize: "20px",
    fontWeight: 500,
    marginBottom: "16px",
    color: "#1f2937",
  },

  card: {
    width: "100%",
    padding: "32px",
    borderRadius: "16px",
    border: "1px solid #e5e7eb",
    backgroundColor: "#ffffff",
    marginBottom: "40px",
  },

  form: {
    display: "grid",
    gap: "12px",
  },

  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
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
    fontFamily: "inherit",
  },

  fileInput: {
    padding: "12px 0",
    fontSize: "14px",
  },

  actions: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    marginTop: "12px",
  },

  primaryBtn: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    fontWeight: 500,
    cursor: "pointer",
    fontSize: "14px",
  },

  secondaryBtn: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid #dbeafe",
    backgroundColor: "#f8fafc",
    color: "#1f2937",
    cursor: "pointer",
    fontSize: "14px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "20px",
  },

  courseCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    overflow: "hidden",
    backgroundColor: "#ffffff",
    transition: "box-shadow 0.2s",
    ":hover": {
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
    },
  },

  image: {
    width: "100%",
    height: "160px",
    objectFit: "cover",
  },

  courseInfo: {
    padding: "16px",
  },

  courseTitle: {
    fontSize: "16px",
    fontWeight: 500,
    marginBottom: "12px",
    color: "#1f2937",
  },

  cardActions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  linkBtn: {
    background: "none",
    border: "none",
    color: "#3b82f6",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
    padding: "0",
    ":hover": {
      textDecoration: "underline",
    },
  },

  deleteBtn: {
    background: "none",
    border: "none",
    color: "#ef4444",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
    padding: "0",
    ":hover": {
      textDecoration: "underline",
    },
  },
};