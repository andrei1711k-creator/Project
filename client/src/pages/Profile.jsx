import { useAuth } from "../auth/AuthContext";
import "../css/profile.css";

export default function Profile() {
  const { user, logout } = useAuth();

  return (
    <div className="profile">
      <div className="container">
        <h2>Profile</h2>
        <div className="info">
          <p>ID: {user.id}</p>
          <p>Username: {user.username}</p>
        </div>

        <button onClick={logout}>Logout</button>
      </div>
    </div>
  );
}
