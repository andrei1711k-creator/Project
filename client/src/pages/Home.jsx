import { useEffect, useState } from "react";
import { getCourses } from "../api/courses";
import { getCategories } from "../api/categories";
import { useDebounce } from "../hooks/useDebounce";
import Header from "../components/Header";
import CourseCard from "../components/CourseCard";
import { useCart } from "../auth/CartContext";

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { isCourseBought } = useCart(); // Используем контекст корзины

  const [filters, setFilters] = useState({
    search: "",
    category_id: "",
    price_from: "",
    price_to: "",
  });

  const [focused, setFocused] = useState(null);

  const debouncedFilters = useDebounce(filters, 500);

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

  const clearFilters = () => {
    setFilters({
      search: "",
      category_id: "",
      price_from: "",
      price_to: "",
    });
  };

  const hasActiveFilters = () => {
    return filters.search || filters.category_id || filters.price_from || filters.price_to;
  };

  return (
    <>
      <Header />

      <main style={styles.page}>
        <div style={styles.wrapper}>
          {/* Заголовок с информацией */}
          <div style={styles.headerSection}>
            <h1 style={styles.title}>Доступные курсы</h1>
            <p style={styles.subtitle}>
              Изучайте новые навыки с лучшими экспертами
            </p>
          </div>

          {/* Панель фильтров */}
          <div style={styles.filterCard}>
            <div style={styles.filterHeader}>
              <h2 style={styles.filterTitle}>Фильтры</h2>
              {hasActiveFilters() && (
                <button 
                  onClick={clearFilters}
                  style={styles.clearButton}
                >
                  Очистить все
                </button>
              )}
            </div>

            <div style={styles.filterGrid}>
              <div style={styles.filterGroup}>
                <label style={styles.label}>Поиск по названию</label>
                <input
                  type="text"
                  placeholder="Введите название курса..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  style={styles.input(focused === "search")}
                  onFocus={() => setFocused("search")}
                  onBlur={() => setFocused(null)}
                />
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.label}>Категория</label>
                <select
                  value={filters.category_id}
                  onChange={(e) =>
                    setFilters({ ...filters, category_id: e.target.value })
                  }
                  style={styles.select(focused === "category")}
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
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.label}>Ценовой диапазон</label>
                <div style={styles.priceRange}>
                  <input
                    type="number"
                    placeholder="От"
                    value={filters.price_from}
                    onChange={(e) =>
                      setFilters({ ...filters, price_from: e.target.value })
                    }
                    style={styles.priceInput(focused === "price_from")}
                    onFocus={() => setFocused("price_from")}
                    onBlur={() => setFocused(null)}
                  />
                  <span style={styles.priceSeparator}>—</span>
                  <input
                    type="number"
                    placeholder="До"
                    value={filters.price_to}
                    onChange={(e) =>
                      setFilters({ ...filters, price_to: e.target.value })
                    }
                    style={styles.priceInput(focused === "price_to")}
                    onFocus={() => setFocused("price_to")}
                    onBlur={() => setFocused(null)}
                  />
                </div>
              </div>
            </div>

            {/* Статистика фильтров */}
            {hasActiveFilters() && (
              <div style={styles.activeFilters}>
                <span style={styles.filterStats}>
                  Найдено курсов: {courses.length}
                </span>
                {filters.search && (
                  <span style={styles.filterTag}>
                    Поиск: "{filters.search}"
                  </span>
                )}
                {filters.category_id && (
                  <span style={styles.filterTag}>
                    Категория: {categories.find(c => c.id == filters.category_id)?.name}
                  </span>
                )}
                {filters.price_from && (
                  <span style={styles.filterTag}>
                    Цена от: {filters.price_from} ₽
                  </span>
                )}
                {filters.price_to && (
                  <span style={styles.filterTag}>
                    Цена до: {filters.price_to} ₽
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Контент */}
          <div style={styles.contentSection}>
            {loading ? (
              <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p style={styles.loadingText}>Загрузка курсов...</p>
              </div>
            ) : courses.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📚</div>
                <h3 style={styles.emptyTitle}>Курсы не найдены</h3>
                <p style={styles.emptyText}>
                  Попробуйте изменить параметры поиска
                </p>
                {hasActiveFilters() && (
                  <button 
                    onClick={clearFilters}
                    style={styles.emptyButton}
                  >
                    Сбросить фильтры
                  </button>
                )}
              </div>
            ) : (
              <>
                <div style={styles.resultsHeader}>
                  <h3 style={styles.resultsTitle}>
                    Найдено курсов: <span style={styles.resultsCount}>{courses.length}</span>
                  </h3>
                  {hasActiveFilters() && (
                    <div style={styles.filterStatsBadge}>
                      <span>Применены фильтры</span>
                    </div>
                  )}
                </div>
                <div style={styles.grid}>
                  {courses.map((course) => (
                    <CourseCard 
                      key={course.id} 
                      course={course}
                      isBought={isCourseBought(course.id)} // Используем функцию из контекста
                    />
                  ))}
                </div>
              </>
            )}
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

  headerSection: {
    marginBottom: "32px",
    textAlign: "center",
  },

  title: {
    fontSize: "36px",
    fontWeight: "700",
    marginBottom: "8px",
    color: "#1e293b",
    background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },

  subtitle: {
    fontSize: "18px",
    color: "#64748b",
    maxWidth: "600px",
    margin: "0 auto",
    lineHeight: "1.6",
  },

  filterCard: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "28px",
    marginBottom: "32px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
    border: "1px solid #f1f5f9",
  },

  filterHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    paddingBottom: "16px",
    borderBottom: "2px solid #f1f5f9",
  },

  filterTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1e293b",
  },

  clearButton: {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    backgroundColor: "transparent",
    color: "#64748b",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.2s",
    ":hover": {
      backgroundColor: "#f1f5f9",
      borderColor: "#cbd5e1",
    },
  },

  filterGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "24px",
    marginBottom: "20px",
  },

  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  label: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#475569",
  },

  input: (isFocused) => ({
    padding: "14px 16px",
    borderRadius: "10px",
    border: `1px solid ${isFocused ? "#3b82f6" : "#e2e8f0"}`,
    fontSize: "15px",
    backgroundColor: "#ffffff",
    outline: "none",
    transition: "all 0.2s",
    boxShadow: isFocused 
      ? "0 0 0 3px rgba(59, 130, 246, 0.15)" 
      : "0 1px 2px rgba(0, 0, 0, 0.05)",
    color: "#1f2937",
    fontFamily: "inherit",
    ":focus": {
      borderColor: "#3b82f6",
    },
    ":hover": {
      borderColor: "#cbd5e1",
    },
  }),

  select: (isFocused) => ({
    padding: "14px 16px",
    borderRadius: "10px",
    border: `1px solid ${isFocused ? "#3b82f6" : "#e2e8f0"}`,
    fontSize: "15px",
    backgroundColor: "#ffffff",
    outline: "none",
    transition: "all 0.2s",
    boxShadow: isFocused 
      ? "0 0 0 3px rgba(59, 130, 246, 0.15)" 
      : "0 1px 2px rgba(0, 0, 0, 0.05)",
    color: "#1f2937",
    fontFamily: "inherit",
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: "right 0.5rem center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "1.5em 1.5em",
    paddingRight: "2.5rem",
    cursor: "pointer",
    ":focus": {
      borderColor: "#3b82f6",
    },
    ":hover": {
      borderColor: "#cbd5e1",
    },
  }),

  priceRange: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  priceInput: (isFocused) => ({
    flex: 1,
    padding: "14px 16px",
    borderRadius: "10px",
    border: `1px solid ${isFocused ? "#3b82f6" : "#e2e8f0"}`,
    fontSize: "15px",
    backgroundColor: "#ffffff",
    outline: "none",
    transition: "all 0.2s",
    boxShadow: isFocused 
      ? "0 0 0 3px rgba(59, 130, 246, 0.15)" 
      : "0 1px 2px rgba(0, 0, 0, 0.05)",
    color: "#1f2937",
    fontFamily: "inherit",
  }),

  priceSeparator: {
    color: "#94a3b8",
    fontWeight: "500",
  },

  activeFilters: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    alignItems: "center",
    paddingTop: "20px",
    borderTop: "1px solid #f1f5f9",
  },

  filterStats: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#3b82f6",
    backgroundColor: "#eff6ff",
    padding: "6px 12px",
    borderRadius: "20px",
  },

  filterTag: {
    fontSize: "14px",
    color: "#475569",
    backgroundColor: "#f8fafc",
    padding: "6px 12px",
    borderRadius: "20px",
    border: "1px solid #e2e8f0",
  },

  contentSection: {
    marginTop: "20px",
  },

  resultsHeader: {
    marginBottom: "24px",
    paddingBottom: "16px",
    borderBottom: "2px solid #f1f5f9",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  resultsTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#475569",
  },

  resultsCount: {
    color: "#3b82f6",
    fontWeight: "700",
  },

  filterStatsBadge: {
    fontSize: "14px",
    color: "#10b981",
    backgroundColor: "#f0fdf4",
    padding: "6px 12px",
    borderRadius: "20px",
    border: "1px solid #bbf7d0",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "24px",
  },

  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "300px",
    gap: "20px",
  },

  spinner: {
    width: "48px",
    height: "48px",
    border: "3px solid #e2e8f0",
    borderTopColor: "#3b82f6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  loadingText: {
    fontSize: "16px",
    color: "#64748b",
    fontWeight: "500",
  },

  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
    textAlign: "center",
    padding: "40px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    border: "2px dashed #e2e8f0",
  },

  emptyIcon: {
    fontSize: "64px",
    marginBottom: "20px",
    color: "#cbd5e1",
  },

  emptyTitle: {
    fontSize: "22px",
    fontWeight: "600",
    color: "#475569",
    marginBottom: "12px",
  },

  emptyText: {
    fontSize: "16px",
    color: "#94a3b8",
    marginBottom: "24px",
    maxWidth: "400px",
  },

  emptyButton: {
    padding: "12px 24px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    fontWeight: "500",
    fontSize: "15px",
    cursor: "pointer",
    transition: "all 0.2s",
    ":hover": {
      backgroundColor: "#2563eb",
      transform: "translateY(-1px)",
    },
  },
};