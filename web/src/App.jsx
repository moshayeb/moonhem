import { Menu } from "lucide-react";
import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { NavLink, Link, Route, Routes } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import SiteFooter from "./SiteFooter.jsx";

const MainPage = lazy(() => import("./pages/MainPage.jsx"));
const AgentsPage = lazy(() => import("./pages/AgentsPage.jsx"));
const GuidePage = lazy(() => import("./pages/GuidePage.jsx"));
const ContactPage = lazy(() => import("./pages/ContactPage.jsx"));
const AboutPage = lazy(() => import("./pages/AboutPage.jsx"));
const CareersPage = lazy(() => import("./pages/CareersPage.jsx"));
const ListingDetailPage = lazy(() => import("./pages/ListingDetailPage.jsx"));
const ArticlePage = lazy(() => import("./pages/ArticlePage.jsx"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage.jsx"));
const LoginPage = lazy(() => import("./pages/LoginPage.jsx"));
const RegisterPage = lazy(() => import("./pages/RegisterPage.jsx"));

/** Top bar matches marketing layout: Buy / Sell / Rent / Agents + Sign in. */
const TOP_NAV = [
    { to: "/", end: true, label: "Buy" },
    { to: "/contact", end: false, label: "Sell" },
    { to: "/contact", end: false, label: "Rent" },
    { to: "/agents", end: false, label: "Agents" },
    { to: "/about", end: false, label: "About" },
];

function AppFallback() {
    return (
        <div
            className="flex min-h-[40vh] items-center justify-center bg-gray-50 text-sm font-medium text-gray-500"
            role="status"
            aria-live="polite"
        >
            Loading page…
        </div>
    );
}

export default function App() {
    const { user, logout } = useAuth();

    return (
        <div className="mh-shell">
            <TopBar user={user} onLogout={logout} />
            <div className="mh-content">
                <Suspense fallback={<AppFallback />}>
                    <Routes>
                        <Route path="/" element={<MainPage />} />
                        <Route path="/agents" element={<AgentsPage />} />
                        <Route path="/guide" element={<GuidePage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/careers" element={<CareersPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/listing/:id" element={<ListingDetailPage />} />
                        <Route path="/article/:slug" element={<ArticlePage />} />
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </Suspense>
            </div>
            <SiteFooter />
        </div>
    );
}

function topNavClass(isActive) {
    return [
        "text-sm font-medium transition-colors",
        isActive ? "text-gray-900" : "text-gray-600 hover:text-yellow-500",
    ].join(" ");
}

function TopBar({ user, onLogout }) {
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        if (!menuOpen) return;
        const onKey = (e) => {
            if (e.key === "Escape") setMenuOpen(false);
        };
        document.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [menuOpen]);

    const closeMenu = useCallback(() => setMenuOpen(false), []);

    return (
        <>
        <header className="sticky top-0 z-50 relative border-b border-gray-200/80 bg-white/95 shadow-sm backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-4">
            <Link
                to="/"
                className="flex min-w-0 shrink cursor-pointer items-center text-inherit no-underline"
                aria-label="Moonhem home"
                onClick={closeMenu}
            >
                <img
                    src="/logo_BO.svg"
                    alt="Moonhem"
                    width={200}
                    height={45}
                    decoding="async"
                    className="block h-7 w-auto max-w-[min(200px,52vw)] object-contain object-left md:h-8"
                />
            </Link>

            <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
                {TOP_NAV.map((item) => (
                    <NavLink key={`${item.label}-${item.to}`} to={item.to} end={item.end} className={({ isActive }) => topNavClass(isActive)}>
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="flex items-center gap-2 sm:gap-4">
                {user ? (
                    <div className="hidden items-center gap-3 md:flex">
                        <span className="max-w-[140px] truncate text-sm font-medium text-gray-700" title={user.mail}>
                            {user.first_name || "Account"}
                        </span>
                        <button
                            type="button"
                            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                            onClick={onLogout}
                        >
                            Log out
                        </button>
                    </div>
                ) : (
                    <Link
                        to="/login"
                        className="hidden text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 md:block"
                    >
                        Sign in
                    </Link>
                )}
                <button
                    type="button"
                    className="rounded-md p-2 transition-colors hover:bg-gray-100 md:hidden"
                    aria-expanded={menuOpen}
                    aria-controls="mh-mobile-nav"
                    onClick={() => setMenuOpen((o) => !o)}
                >
                    <Menu className="h-6 w-6 text-gray-600" aria-hidden />
                    <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
                </button>
            </div>
            </div>

            <div
                id="mh-mobile-nav"
                className={`absolute left-0 right-0 top-full z-50 border-b border-gray-100 bg-white shadow-lg transition-all duration-200 md:hidden ${
                    menuOpen ? "visible max-h-[80vh] opacity-100" : "invisible max-h-0 overflow-hidden opacity-0"
                }`}
                aria-hidden={!menuOpen}
            >
                <nav className="flex flex-col gap-1 px-4 py-4" aria-label="Mobile main">
                    {TOP_NAV.map((item) => (
                        <NavLink
                            key={`m-${item.label}-${item.to}`}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) =>
                                `rounded-lg px-3 py-3 text-base font-medium ${isActive ? "bg-gray-100 text-gray-900" : "text-gray-600"}`
                            }
                            onClick={closeMenu}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                    {user ? (
                        <>
                            <span className="border-t border-gray-100 px-3 py-3 text-sm text-gray-500">{user.mail}</span>
                            <button
                                type="button"
                                className="rounded-lg px-3 py-3 text-left text-base font-medium text-gray-900"
                                onClick={() => {
                                    onLogout();
                                    closeMenu();
                                }}
                            >
                                Log out
                            </button>
                        </>
                    ) : (
                        <Link
                            to="/login"
                            className="rounded-lg px-3 py-3 text-base font-medium text-gray-900"
                            onClick={closeMenu}
                        >
                            Sign in
                        </Link>
                    )}
                </nav>
            </div>
        </header>
        {menuOpen ? (
            <div
                className="fixed bottom-0 left-0 right-0 top-16 z-40 bg-black/30 md:hidden"
                aria-hidden="true"
                onClick={closeMenu}
            />
        ) : null}
        </>
    );
}
