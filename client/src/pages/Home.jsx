// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { getCourses } from "../api/courses";
import Header from "../components/Header";
import CourseCard from "../components/CourseCard";
import "../css/home.css";

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCourses()
      .then(setCourses)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Header />

      <main style={styles.container}>
        <h1>Доступные курсы</h1>

        {loading ? (
          <p>Загрузка...</p>
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
  container: {
    padding: "32px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "24px",
  },
};
