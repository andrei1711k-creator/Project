import { useEffect, useState } from "react";
import { getCourses } from "../api/courses";
import { getCategories } from "../api/categories";
import { useDebounce } from "../hooks/useDebounce";
import Header from "../components/Header";
import CourseCard from "../components/CourseCard";

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: "",
    category_id: "",
    price_from: "",
    price_to: "",
  });

  const [focused, setFocused] = useState(null);

  const debouncedFilters = useDebounce(filters, 500);

  const inputStyle = (isFocused) => ({
    ...styles.input,
    borderColor: isFocused ? "#3b82f6" : "#dbeafe",
    boxShadow: isFocused
      ? "0 0 0 3px rgba(59, 130, 246, 0.15)"
      : "none",
      color: "#1f2937"
  });

  const loadCourses = async (activeFilters) => {
    setLoading(true);

    const params = {};

    if (activeFilters.search?.trim()) {
      params.search = activeFilters.search.trim();
    }

    if (activeFilters.category_id) {
      params.category_id = Number(activeFilters.category_id);
    }

    if (activeFilters.price_from !== "") {
      params.min_price = Number(activeFilters.price_from);
    }

    if (activeFilters.price_to !== "") {
      params.max_price = Number(activeFilters.price_to);
    }

    const data = await getCourses(params);
    setCourses(data);
    setLoading(false);
  };

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    loadCourses(debouncedFilters);
  }, [debouncedFilters]);

  return (
    <>
      <Header />

      <main style={styles.page}>
        <h1 style={styles.title}>Доступные курсы</h1>

        {/* ФИЛЬТРЫ */}
        <div style={styles.filters}>
          <input
            type="text"
            placeholder="Поиск по названию"
            value={filters.search}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value })
            }
            style={inputStyle(focused === "search")}
            onFocus={() => setFocused("search")}
            onBlur={() => setFocused(null)}
          />

          <select
            value={filters.category_id}
            onChange={(e) =>
              setFilters({ ...filters, category_id: e.target.value })
            }
            style={inputStyle(focused === "category")}
            onFocus={() => setFocused("category")}
            onBlur={() => setFocused(null)}
          >
            <option value="">Все категории</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Цена от"
            value={filters.price_from}
            onChange={(e) =>
              setFilters({ ...filters, price_from: e.target.value })
            }
            style={inputStyle(focused === "price_from")}
            onFocus={() => setFocused("price_from")}
            onBlur={() => setFocused(null)}
          />

          <input
            type="number"
            placeholder="Цена до"
            value={filters.price_to}
            onChange={(e) =>
              setFilters({ ...filters, price_to: e.target.value })
            }
            style={inputStyle(focused === "price_to")}
            onFocus={() => setFocused("price_to")}
            onBlur={() => setFocused(null)}
          />
        </div>

        {/* КОНТЕНТ */}
        {loading ? (
          <p style={styles.loading}>Загрузка курсов…</p>
        ) : courses.length === 0 ? (
          <p style={styles.empty}>Курсы не найдены</p>
        ) : (
          <div style={styles.grid}>
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

const styles = {
  page: {
    padding: "40px",
    backgroundColor: "#ffffff",
    minHeight: "100vh",
  },

  title: {
    fontSize: "28px",
    fontWeight: 600,
    marginBottom: "24px",
    color: "#1f2937",
  },

  filters: {
    display: "grid",
    gridTemplateColumns: "2fr 1.2fr 1fr 1fr",
    gap: "12px",
    marginBottom: "32px",
  },

  input: {
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #dbeafe",
    fontSize: "14px",
    backgroundColor: "#ffffff",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },

  loading: {
    color: "#6b7280",
    fontSize: "16px",
  },

  empty: {
    color: "#6b7280",
    fontSize: "16px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
    gap: "24px",
  },
};
