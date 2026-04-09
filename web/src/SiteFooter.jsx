import { Link } from "react-router-dom";

/**
 * Dark footer strip aligned with the Grok-style gray-900 CTA band on the home page.
 */
export default function SiteFooter() {
    const year = new Date().getFullYear();

    return (
        <footer className="border-t border-gray-800 bg-gray-950 text-gray-300" role="contentinfo">
            <div className="mx-auto max-w-7xl px-6 py-14">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                    <div className="lg:col-span-1">
                        <Link to="/" className="inline-block" aria-label="Moonhem home">
                            <img className="h-8 w-auto opacity-95" src="/logo_W.svg" alt="" width={160} height={36} />
                        </Link>
                        <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-400">
                            Curated homes across Sweden. Search listings, read guides, and talk to an agent in one place.
                        </p>
                    </div>

                    <nav className="flex flex-col gap-3" aria-label="Product">
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-white">Product</h2>
                        <Link to="/" className="text-sm text-gray-400 transition hover:text-white">
                            Home
                        </Link>
                        <Link to={{ pathname: "/", hash: "listings" }} className="text-sm text-gray-400 transition hover:text-white">
                            Listings
                        </Link>
                        <Link to="/guide" className="text-sm text-gray-400 transition hover:text-white">
                            Buyer guide
                        </Link>
                    </nav>

                    <nav className="flex flex-col gap-3" aria-label="Company">
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-white">Company</h2>
                        <Link to="/agents" className="text-sm text-gray-400 transition hover:text-white">
                            Agents
                        </Link>
                        <Link to="/contact" className="text-sm text-gray-400 transition hover:text-white">
                            Contact
                        </Link>
                        <Link to="/about" className="text-sm text-gray-400 transition hover:text-white">
                            About
                        </Link>
                        <Link to="/careers" className="text-sm text-gray-400 transition hover:text-white">
                            Careers
                        </Link>
                    </nav>

                    <nav className="flex flex-col gap-3" aria-label="Connect">
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-white">Connect</h2>
                        <Link to="/login" className="text-sm text-gray-400 transition hover:text-white">
                            Log in
                        </Link>
                        <Link to="/register" className="text-sm text-gray-400 transition hover:text-white">
                            Register
                        </Link>
                        <a href="mailto:hello@moonhem.com" className="text-sm text-gray-400 transition hover:text-white">
                            hello@moonhem.com
                        </a>
                        <a href="tel:+46701234567" className="text-sm text-gray-400 transition hover:text-white">
                            +46 70 123 45 67
                        </a>
                    </nav>
                </div>

                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-8 text-sm text-gray-500 sm:flex-row">
                    <p>© {year} Moonhem. All rights reserved.</p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <a
                            href="https://www.instagram.com/"
                            className="transition hover:text-white"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Instagram
                        </a>
                        <span aria-hidden="true">
                            ·
                        </span>
                        <a
                            href="https://www.linkedin.com/"
                            className="transition hover:text-white"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            LinkedIn
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
