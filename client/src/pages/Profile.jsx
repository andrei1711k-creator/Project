import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import "../css/profile.css";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <Header />

      <div className="profile">
        <div className="container">
          <h2>Profile</h2>

          <div className="info">
            <p>ID: {user.id}</p>
            <p>Username: {user.username}</p>
          </div>

          <div className="profile-actions">
            <button onClick={() => navigate("/my-courses")}>
              My Courses
            </button>

            <button onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
