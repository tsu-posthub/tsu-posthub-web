import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Squeeze as Hamburger } from "hamburger-react";
import { useState } from "react";
import posthubLogo from "../assets/posthub_logo.svg";
import "./Navbar.css";

export default function Navbar() {
    const { accessToken, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setOpen] = useState(false);

    const handleLogout = async () => {
        logout();
        navigate("/login");
        setOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="hamburger">
                    <Hamburger toggled={isOpen} toggle={setOpen} size={24} color="#fff" />
                </div>  

                <Link to="/" className="navbar-logo" onClick={() => setOpen(false)}>
                    <img src={posthubLogo} alt="PostHub Logo" className="navbar-logo-img" />
                    <span className="navbar-logo-text">TSU PostHub</span>
                </Link>

                <div className={`navbar-login`}>
                    {!accessToken ? (
                        <>
                            <Link to="/login" className="login-link">
                                Войти
                            </Link>
                        </>
                    ) : (
                        <button onClick={handleLogout} className="logout-btn">
                            Выйти
                        </button>
                    )}
                </div>

                <div className={`navbar-links ${isOpen ? "open" : ""}`}>
                    <Link to="/" onClick={() => setOpen(false)}>Главная</Link>
                    {accessToken && (
                        <Link to="/create" onClick={() => setOpen(false)}>Создать пост</Link>
                    )}
                </div>

                <div className={`navbar-auth ${!accessToken && isOpen ? "open" : ""}`}>
                    {!accessToken ? (
                        <>
                            <Link to="/login" className="login-link" onClick={() => setOpen(false)}>
                                Войти
                            </Link>
                            <Link to="/register" className="register-btn" onClick={() => setOpen(false)}>
                                Регистрация
                            </Link>
                        </>
                    ) : (
                        <button onClick={handleLogout} className="logout-btn">
                            Выйти
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}
