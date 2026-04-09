import { Link } from "react-router-dom";
import { ContentCard, PageMain } from "../ui/PageChrome.jsx";
import { useDocumentTitle } from "../useDocumentTitle.js";

export default function NotFoundPage() {
    useDocumentTitle("Page not found · Moonhem");

    return (
        <div className="min-h-screen bg-gray-50">
            <PageMain className="flex min-h-[60vh] items-center justify-center py-20">
                <ContentCard className="max-w-lg text-center">
                    <p className="text-xs font-semibold uppercase tracking-wider text-yellow-600">404</p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">
                        This page does not exist.
                    </h1>
                    <p className="mt-3 text-gray-600">The link may be outdated, or the address was mistyped.</p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Link
                            to="/"
                            className="inline-flex items-center justify-center rounded-2xl bg-yellow-500 px-8 py-3.5 font-semibold text-white transition hover:bg-yellow-600"
                        >
                            Back to home
                        </Link>
                        <Link
                            to={{ pathname: "/", hash: "listings" }}
                            className="inline-flex items-center justify-center rounded-2xl border-2 border-gray-900 px-8 py-3.5 font-semibold text-gray-900 transition hover:bg-gray-900 hover:text-white"
                        >
                            Browse listings
                        </Link>
                    </div>
                </ContentCard>
            </PageMain>
        </div>
    );
}
