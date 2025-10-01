import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Squash as Hamburger } from "hamburger-react";
import posthubLogo from "../assets/posthub_logo.svg";
import "./Navbar.css";

export default function Navbar() {
    const { accessToken, username } = useAuth();
    const [isOpen, setOpen] = useState(false);
    const navRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!navRef.current) return;

        const updateHeight = () => {
            const height = navRef.current?.offsetHeight || 0;
            document.documentElement.style.setProperty("--navbar-height", `${height}px`);
        };

        updateHeight();
        const observer = new ResizeObserver(updateHeight);
        observer.observe(navRef.current);

        return () => observer.disconnect();
    }, []);

    return (
        <nav className="navbar" ref={navRef}>
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
                        <Link to="/login" className="login-link">
                            Войти
                        </Link>
                    ) : (
                        <Link to="/profile" className="login-link" onClick={() => setOpen(false)}>
                            {username}
                        </Link>
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
                        <>
                            <Link to="/profile" className="login-link" onClick={() => setOpen(false)}>
                                {username}
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
