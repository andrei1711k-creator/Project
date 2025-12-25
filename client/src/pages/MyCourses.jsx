import { useEffect, useState } from "react";
import { getMyCourses, createMyCourse, deleteMyCourse } from "../api/courses";
import { getCategories } from "../api/categories";
import Header from "../components/Header";
import "../css/myCourses.css";

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ category_id: "" });
  const [image, setImage] = useState(null);

  useEffect(() => {
    getMyCourses().then(setCourses);
    getCategories().then(setCategories);
  }, []);

  const submit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append("image", image);

    const newCourse = await createMyCourse(fd);
    setCourses((prev) => [...prev, newCourse]);
  };

  const handleDelete = async (id) => {
    if (!confirm("Удалить курс?")) return;
    await deleteMyCourse(id);
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <>
      <Header />

      <div className="my-courses">
        <div className="container">
          <h2>Мои курсы</h2>

          <form className="course-form" onSubmit={submit}>
            <h3>Создать курс</h3>

            <input
              placeholder="Название"
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
              required
            />

            <input
              placeholder="Формат"
              onChange={(e) =>
                setForm({ ...form, format: e.target.value })
              }
              required
            />

            <textarea
              placeholder="Описание"
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              required
            />

            <input
              type="number"
              placeholder="Цена"
              onChange={(e) =>
                setForm({ ...form, price: e.target.value })
              }
              required
            />

            <input
              type="number"
              placeholder="Часы"
              onChange={(e) =>
                setForm({ ...form, duration_hours: e.target.value })
              }
              required
            />

            {/* 🔽 КАТЕГОРИИ С БЭКА */}
            <select
              value={form.category_id}
              onChange={(e) =>
                setForm({ ...form, category_id: e.target.value })
              }
              required
            >
              <option value="">Выберите категорию</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              required
            />

            <button className="primary-btn">Создать курс</button>
          </form>

          <div className="courses-list">
            {courses.map((c) => (
              <div className="course-card" key={c.id}>
                <img src={`http://localhost:8000${c.image_url}`} />
                <div className="course-info">
                  <h3>{c.title}</h3>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(c.id)}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}
