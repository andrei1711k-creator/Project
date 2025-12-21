import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useCart } from "../auth/CartContext";
import "../css/links.css"

export default function Header() {
  const { user, logout } = useAuth();
  const { count } = useCart();

  return (
    <header style={styles.header}>
      <Link to="/" style={styles.logo}>
        CourseMarket
      </Link>

      <nav style={styles.nav}>
        {!user ? (
          <>
            <Link to="/login">Sign In</Link>
            <Link to="/register">Sign Up</Link>
          </>
        ) : (
          <>
            <Link to="/cart">
              Cart {count > 0 && `(${count})`}
            </Link>
            <Link to="/profile">{user.username}</Link>
            <button  onClick={logout}>Logout</button>
          </>
        )}
      </nav>
    </header>
  );
}

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    padding: "16px 32px",
    borderBottom: "1px solid #e5e5e5",
  },
  logo: {
    fontWeight: "bold",
    fontSize: "20px",
    textDecoration: "none",
    color: "inherit",
  },
  nav: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
  },
};
