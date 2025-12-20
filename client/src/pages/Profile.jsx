import { useAuth } from "../auth/AuthContext";

export default function Profile() {
  const { user, logout } = useAuth();

  return (
    <>
      <h2>Profile</h2>
      <p>ID: {user.id}</p>
      <p>Username: {user.username}</p>
      <button onClick={logout}>Logout</button>
    </>
  );
}
