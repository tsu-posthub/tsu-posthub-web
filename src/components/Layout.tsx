import Navbar from "./Navbar.tsx";
import { Outlet } from "react-router-dom";

export default function Layout() {
    return (
        <>
            <Navbar />
            <main className="page-content">
                <Outlet />
            </main>
        </>
    );
}
