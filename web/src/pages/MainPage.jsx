import {
    Bath,
    Bed,
    Clock,
    Grid,
    Heart,
    Map,
    MapPin,
    Search,
    Shield,
    SlidersHorizontal,
    Square,
    Star,
} from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { normalizeRealtorsFromUsers } from "../agentsNormalize.js";
import { fetchListings, fetchUsers } from "../api";
import {
    formatSEK,
    labelType,
    listingCardStatus,
    listingImageAlt,
    normalizeListing,
    resolveListingAgent,
    toNumber,
} from "../listingFormat.js";
import { useDocumentTitle } from "../useDocumentTitle.js";

function scrollToId(id) {
    if (typeof document === "undefined") return;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function parseFiltersFromSearch(sp) {
    return {
        q: sp.get("q") || "",
        type: sp.get("type") || "all",
        roomsMin: sp.get("roomsMin") || "",
        roomsMax: sp.get("roomsMax") || "",
        priceMin: sp.get("priceMin") || "",
        priceMax: sp.get("priceMax") || "",
        sort: sp.get("sort") || "newest",
    };
}

function searchParamsFromState(filters) {
    const u = new URLSearchParams();
    if (filters.q.trim()) u.set("q", filters.q.trim());
    if (filters.type !== "all") u.set("type", filters.type);
    if (filters.roomsMin) u.set("roomsMin", filters.roomsMin);
    if (filters.roomsMax) u.set("roomsMax", filters.roomsMax);
    if (filters.priceMin) u.set("priceMin", filters.priceMin);
    if (filters.priceMax) u.set("priceMax", filters.priceMax);
    if (filters.sort && filters.sort !== "newest") u.set("sort", filters.sort);
    return u;
}

const HERO_BG =
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80";

export default function MainPage() {
    useDocumentTitle("Moonhem · Find a home");
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();

    const [filters, setFilters] = useState(() => parseFiltersFromSearch(searchParams));
    const [page, setPage] = useState(1);
    const [reloadNonce, setReloadNonce] = useState(0);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [viewMode, setViewMode] = useState("grid");
    const heroFiltersId = useId();

    const [items, setItems] = useState([]);
    const [status, setStatus] = useState("idle");
    const [error, setError] = useState("");
    const [realtors, setRealtors] = useState([]);
    const pageSize = 9;

    useEffect(() => {
        let ignore = false;
        fetchUsers()
            .then((raw) => {
                if (!ignore) setRealtors(normalizeRealtorsFromUsers(raw));
            })
            .catch(() => {
                if (!ignore) setRealtors([]);
            });
        return () => {
            ignore = true;
        };
    }, []);

    const searchKey = searchParams.toString();
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- URL is external state via useSearchParams
        setFilters(parseFiltersFromSearch(searchParams));
    }, [searchKey, searchParams]);

    useEffect(() => {
        const next = searchParamsFromState(filters);
        if (next.toString() === searchParams.toString()) return;
        setSearchParams(next, { replace: true });
    }, [filters, searchParams, setSearchParams]);

    const listingsParams = useMemo(() => {
        const p = {};
        if (filters.q.trim()) p.q = filters.q.trim();
        if (filters.type !== "all") p.property_type = filters.type;

        const roomsMin = toNumber(filters.roomsMin);
        const roomsMax = toNumber(filters.roomsMax);
        const priceMin = toNumber(filters.priceMin);
        const priceMax = toNumber(filters.priceMax);

        if (roomsMin != null) p.rooms_min = roomsMin;
        if (roomsMax != null) p.rooms_max = roomsMax;
        if (priceMin != null) p.price_min = priceMin;
        if (priceMax != null) p.price_max = priceMax;

        if (filters.sort) p.sort = filters.sort;
        return p;
    }, [filters]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- reset pagination when search filters change
        setPage(1);
    }, [listingsParams]);

    useEffect(() => {
        let ignore = false;
        async function load() {
            setStatus("loading");
            setError("");
            try {
                const data = await fetchListings(listingsParams);
                if (!ignore) {
                    const raw = Array.isArray(data) ? data : data?.listings ?? [];
                    const normalized = raw.map((item, idx) => normalizeListing(item, idx));
                    setItems(normalized);
                    setStatus("idle");
                }
            } catch (e) {
                if (!ignore) {
                    setStatus("error");
                    setError(e?.message || "Failed to load listings");
                    setItems([]);
                }
            }
        }
        load();
        return () => {
            ignore = true;
        };
    }, [listingsParams, reloadNonce]);

    useEffect(() => {
        if (location.pathname !== "/") return;
        const id = location.hash?.replace(/^#/, "").trim();
        if (!id) return;
        const t = window.setTimeout(() => scrollToId(id), 100);
        return () => window.clearTimeout(t);
    }, [location.pathname, location.hash]);

    const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
    const currentPage = Math.min(page, pageCount);
    const pagedItems = items.slice(0, currentPage * pageSize);

    const retryLoad = () => setReloadNonce((n) => n + 1);

    useEffect(() => {
        if (!filtersOpen) return;
        const onKey = (e) => {
            if (e.key === "Escape") setFiltersOpen(false);
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [filtersOpen]);

    const showSkeleton = status === "loading" && items.length === 0;
    const countLabel =
        status === "loading" && items.length === 0 ? "Loading…" : `Showing ${items.length} results`;

    const areaHint = filters.q.trim() || "Sweden";
    const homesCount = status === "loading" && items.length === 0 ? "—" : String(items.length);

    return (
        <div className="min-h-screen w-full max-w-none bg-gray-50">
            <section className="relative flex h-[min(620px,92vh)] w-full items-center justify-center overflow-hidden md:h-[620px]">
                <img src={HERO_BG} alt="" className="absolute inset-0 h-full w-full object-cover" decoding="async" />
                <div className="absolute inset-0 z-10 bg-black/40" aria-hidden />

                <div className="relative z-20 mx-auto w-full max-w-4xl px-6 text-center">
                    <h1 className="mb-6 text-5xl font-semibold tracking-tight text-white md:text-6xl">
                        Find your perfect home
                    </h1>
                    <p className="mx-auto mb-10 max-w-md text-xl text-white/90">
                        Discover curated homes across Sweden with trusted agents
                    </p>

                    <form
                        className="mx-auto w-full max-w-3xl"
                        onSubmit={(e) => {
                            e.preventDefault();
                            setFilters((f) => ({ ...f, q: f.q.trim() }));
                            setFiltersOpen(false);
                            scrollToId("listings");
                        }}
                    >
                        <div className="flex w-full flex-col gap-2 rounded-3xl bg-white p-2 shadow-2xl md:flex-row md:items-stretch">
                            <label className="relative flex flex-1 items-center">
                                <MapPin
                                    className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                                    aria-hidden
                                />
                                <span className="sr-only">City, neighborhood, or address</span>
                                <input
                                    name="q"
                                    autoComplete="street-address"
                                    placeholder="City, neighborhood, or address…"
                                    className="w-full rounded-2xl bg-transparent py-4 pl-14 pr-6 text-lg text-gray-900 placeholder:text-gray-400 focus:outline-none"
                                    value={filters.q}
                                    onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                                />
                            </label>

                            <button
                                type="button"
                                className="hidden items-center justify-center gap-2 rounded-2xl px-8 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 md:flex"
                                aria-expanded={filtersOpen}
                                aria-controls={heroFiltersId}
                                onClick={() => setFiltersOpen((o) => !o)}
                            >
                                <SlidersHorizontal className="h-5 w-5 shrink-0" aria-hidden />
                                Filters
                            </button>

                            <button
                                type="button"
                                className="flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 md:hidden"
                                aria-expanded={filtersOpen}
                                aria-controls={heroFiltersId}
                                onClick={() => setFiltersOpen((o) => !o)}
                            >
                                <SlidersHorizontal className="h-5 w-5 shrink-0" aria-hidden />
                                Filters
                            </button>

                            <button
                                type="submit"
                                className="flex items-center justify-center gap-3 rounded-2xl bg-yellow-500 px-10 py-4 text-lg font-semibold text-white transition-colors hover:bg-yellow-600 active:scale-[0.99] md:shrink-0"
                            >
                                <Search className="h-6 w-6 shrink-0" aria-hidden />
                                Search
                            </button>
                        </div>
                    </form>

                    {filtersOpen ? (
                        <div
                            className="mx-auto mt-2 max-w-3xl rounded-xl border border-white/20 bg-white/10 p-3 text-left shadow-lg backdrop-blur-md sm:p-4"
                            id={heroFiltersId}
                        >
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(148px,1fr))] gap-3">
                                <label className="flex flex-col gap-1">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-white/90">
                                        Property type
                                    </span>
                                    <select
                                        className="rounded-lg border border-gray-200 px-2 py-2 text-sm"
                                        value={filters.type}
                                        onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
                                    >
                                        <option value="all">All types</option>
                                        <option value="apartment">Apartment</option>
                                        <option value="house">House</option>
                                        <option value="townhouse">Townhouse</option>
                                        <option value="plot">Plot</option>
                                    </select>
                                </label>
                                <label className="flex flex-col gap-1">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-white/90">
                                        Rooms (min)
                                    </span>
                                    <input
                                        className="rounded-lg border border-gray-200 px-2 py-2 text-sm"
                                        placeholder="e.g. 3"
                                        inputMode="numeric"
                                        value={filters.roomsMin}
                                        onChange={(e) => setFilters((f) => ({ ...f, roomsMin: e.target.value }))}
                                    />
                                </label>
                                <label className="flex flex-col gap-1">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-white/90">
                                        Rooms (max)
                                    </span>
                                    <input
                                        className="rounded-lg border border-gray-200 px-2 py-2 text-sm"
                                        placeholder="e.g. 5"
                                        inputMode="numeric"
                                        value={filters.roomsMax}
                                        onChange={(e) => setFilters((f) => ({ ...f, roomsMax: e.target.value }))}
                                    />
                                </label>
                                <label className="flex flex-col gap-1">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-white/90">
                                        Price min
                                    </span>
                                    <input
                                        className="rounded-lg border border-gray-200 px-2 py-2 text-sm"
                                        placeholder="SEK"
                                        inputMode="numeric"
                                        value={filters.priceMin}
                                        onChange={(e) => setFilters((f) => ({ ...f, priceMin: e.target.value }))}
                                    />
                                </label>
                                <label className="flex flex-col gap-1">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-white/90">
                                        Price max
                                    </span>
                                    <input
                                        className="rounded-lg border border-gray-200 px-2 py-2 text-sm"
                                        placeholder="SEK"
                                        inputMode="numeric"
                                        value={filters.priceMax}
                                        onChange={(e) => setFilters((f) => ({ ...f, priceMax: e.target.value }))}
                                    />
                                </label>
                                <label className="flex flex-col gap-1">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-white/90">Sort</span>
                                    <select
                                        className="rounded-lg border border-gray-200 px-2 py-2 text-sm"
                                        value={filters.sort}
                                        onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
                                        aria-label="Sort listings"
                                    >
                                        <option value="newest">Newest first</option>
                                        <option value="price_asc">Price: Low to High</option>
                                        <option value="price_desc">Price: High to Low</option>
                                        <option value="area_desc">Square meters</option>
                                    </select>
                                </label>
                            </div>
                            <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-white/15 pt-3">
                                <button
                                    type="button"
                                    className="mr-auto text-sm font-medium text-white/90 underline decoration-white/40 underline-offset-2 hover:text-white"
                                    onClick={() =>
                                        setFilters({
                                            q: filters.q,
                                            type: "all",
                                            roomsMin: "",
                                            roomsMax: "",
                                            priceMin: "",
                                            priceMax: "",
                                            sort: "newest",
                                        })
                                    }
                                >
                                    Reset filters
                                </button>
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-2 rounded-2xl bg-yellow-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-yellow-600"
                                    onClick={() => {
                                        setFilters((f) => ({ ...f, q: f.q.trim() }));
                                        setFiltersOpen(false);
                                        scrollToId("listings");
                                    }}
                                >
                                    <Search className="h-4 w-4" aria-hidden />
                                    Apply &amp; view results
                                </button>
                            </div>
                        </div>
                    ) : null}

                    <p className="mt-4 text-sm text-white/70" role="status" aria-live="polite">
                        {homesCount} homes match your search in {areaHint}
                    </p>
                </div>
            </section>

            <div className="border-b border-gray-200 bg-white">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-8 px-6 py-5 text-sm md:justify-between">
                    <div className="flex items-center gap-3">
                        <Star className="h-5 w-5 shrink-0 text-yellow-500" fill="currentColor" aria-hidden />
                        <div>
                            <div className="font-semibold text-gray-900">4.9/5 Average Rating</div>
                            <div className="text-xs text-gray-500">Based on 2,500+ reviews</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 shrink-0 text-emerald-500" aria-hidden />
                        <div className="font-medium text-gray-900">Verified Agents Only</div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 shrink-0 text-blue-500" aria-hidden />
                        <div className="font-medium text-gray-900">Real-Time Updates</div>
                    </div>
                </div>
            </div>

            <section className="mx-auto max-w-7xl px-6 py-16" id="listings">
                <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <h2 className="text-3xl font-semibold tracking-tight text-gray-900">Latest properties</h2>
                        <p className="mt-1 text-gray-600">Newest matches for your search · {countLabel}</p>
                        {status === "loading" && items.length > 0 ? (
                            <p className="mt-1 text-sm text-gray-500" role="status" aria-live="polite">
                                Updating results…
                            </p>
                        ) : null}
                        {status === "error" ? (
                            <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4 text-red-800">
                                <p className="font-semibold">{error}</p>
                                <button
                                    type="button"
                                    className="mt-2 rounded-2xl bg-yellow-500 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-600"
                                    onClick={retryLoad}
                                >
                                    Try again
                                </button>
                            </div>
                        ) : null}
                    </div>

                    <div className="hidden flex-col items-stretch gap-3 md:flex md:flex-row md:items-center">
                        <label className="flex cursor-pointer items-center rounded-2xl border border-gray-200 bg-white px-5 py-2.5 text-sm text-gray-600 shadow-sm transition-colors hover:border-yellow-400 focus-within:border-yellow-400">
                            <span className="mr-2 font-medium">Sort by:</span>
                            <select
                                className="cursor-pointer bg-transparent font-medium text-gray-900 focus:outline-none"
                                value={filters.sort}
                                onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
                                aria-label="Sort listings"
                            >
                                <option value="newest">Newest first</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                                <option value="area_desc">Square meters</option>
                            </select>
                        </label>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setViewMode("grid")}
                                className={`rounded-2xl border border-gray-200 px-5 py-2.5 text-sm font-medium transition-colors ${
                                    viewMode === "grid" ? "bg-gray-900 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                <span className="inline-flex items-center gap-2">
                                    <Grid className="h-4 w-4" aria-hidden />
                                    Grid
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode("map")}
                                className={`rounded-2xl border border-gray-200 px-5 py-2.5 text-sm font-medium transition-colors ${
                                    viewMode === "map" ? "bg-gray-900 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                <span className="inline-flex items-center gap-2">
                                    <Map className="h-4 w-4" aria-hidden />
                                    Map
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mb-6 flex flex-wrap gap-3 md:hidden">
                    <label className="flex flex-1 min-w-[200px] cursor-pointer items-center rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm">
                        <span className="mr-2 text-gray-600">Sort:</span>
                        <select
                            className="flex-1 cursor-pointer bg-transparent font-medium text-gray-900 focus:outline-none"
                            value={filters.sort}
                            onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
                            aria-label="Sort listings"
                        >
                            <option value="newest">Newest first</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="area_desc">Square meters</option>
                        </select>
                    </label>
                    <div className="flex w-full gap-2">
                        <button
                            type="button"
                            onClick={() => setViewMode("grid")}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium ${
                                viewMode === "grid" ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white"
                            }`}
                        >
                            <Grid className="h-4 w-4" aria-hidden />
                            Grid
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode("map")}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium ${
                                viewMode === "map" ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white"
                            }`}
                        >
                            <Map className="h-4 w-4" aria-hidden />
                            Map
                        </button>
                    </div>
                </div>

                {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {showSkeleton
                            ? Array.from({ length: 6 }, (_, i) => <ListingCardSkeleton key={i} />)
                            : pagedItems.map((x, i) => (
                                  <ListingCard
                                      key={x.id}
                                      item={x}
                                      index={i}
                                      agent={resolveListingAgent(x, realtors)}
                                  />
                              ))}

                        {!showSkeleton && status !== "loading" && pagedItems.length === 0 && status !== "error" ? (
                            <div className="col-span-full rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
                                <p className="text-lg font-semibold text-gray-900">No homes match these filters</p>
                                <p className="mt-2 text-gray-600">Try widening the area or adjusting price.</p>
                                <button
                                    type="button"
                                    className="mt-4 rounded-2xl border-2 border-gray-900 px-8 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-900 hover:text-white"
                                    onClick={() =>
                                        setFilters({
                                            q: "",
                                            type: "all",
                                            roomsMin: "",
                                            roomsMax: "",
                                            priceMin: "",
                                            priceMax: "",
                                            sort: "newest",
                                        })
                                    }
                                >
                                    Reset filters
                                </button>
                            </div>
                        ) : null}
                    </div>
                ) : (
                    <div className="flex h-[600px] w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-300 bg-gray-100 text-gray-500">
                        <Map className="mb-4 h-16 w-16 text-gray-400" aria-hidden />
                        <p className="text-xl font-bold text-gray-700">Interactive Map View</p>
                        <p className="mt-2 max-w-md text-center text-gray-600">
                            In a production build, this area would show an interactive map with pins for all matching
                            homes.
                        </p>
                    </div>
                )}

                {!showSkeleton && status !== "error" && viewMode === "grid" && currentPage < pageCount ? (
                    <div className="mt-8 text-center sm:mt-10">
                        <button
                            type="button"
                            className="inline-block rounded-2xl border-2 border-gray-900 px-10 py-4 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-900 hover:text-white sm:text-base"
                            onClick={() => setPage((p) => p + 1)}
                        >
                            Load more properties
                        </button>
                    </div>
                ) : null}
            </section>

            <section className="bg-gray-900 py-20 text-white" aria-labelledby="cta-heading">
                <div className="mx-auto max-w-3xl px-6 text-center">
                    <h2 id="cta-heading" className="text-4xl font-semibold tracking-tight">
                        Ready to find a home you love?
                    </h2>
                    <p className="mt-4 text-lg text-gray-400">
                        Start with listings, or talk to a Moonhem agent—we’ll help you move from browsing to bidding with
                        confidence.
                    </p>
                    <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                        <Link
                            to="/contact"
                            className="inline-flex items-center justify-center rounded-2xl bg-yellow-500 px-10 py-4 text-lg font-semibold text-gray-900 transition-colors hover:bg-yellow-600"
                        >
                            Get in touch
                        </Link>
                        <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-2xl border border-white/40 px-10 py-4 text-lg font-semibold text-white transition-colors hover:bg-white/10"
                            onClick={() => navigate("/agents")}
                        >
                            Meet the team
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}

function ListingCardSkeleton() {
    return (
        <div
            className="flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
            aria-hidden
        >
            <div className="h-64 animate-pulse bg-gray-200" />
            <div className="flex flex-1 flex-col p-6">
                <div className="h-7 w-2/5 animate-pulse rounded bg-gray-200" />
                <div className="mt-2 h-4 w-4/5 animate-pulse rounded bg-gray-200" />
                <div className="mt-6 flex justify-between border-t border-gray-100 pt-6">
                    <div className="h-9 w-12 animate-pulse rounded bg-gray-100" />
                    <div className="h-9 w-12 animate-pulse rounded bg-gray-100" />
                    <div className="h-9 w-12 animate-pulse rounded bg-gray-100" />
                </div>
                <div className="mt-6 flex items-center gap-3 border-t border-gray-100 pt-6">
                    <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
                    <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
                </div>
            </div>
        </div>
    );
}

function ListingCard({ item, index, agent }) {
    const [saved, setSaved] = useState(false);
    const typeLabel = labelType(item.property_type);
    const cardRef = useRef(null);
    const listingTo = `/listing/${item.id}`;
    const listingState = { listing: item };
    const viewLabel = `View listing: ${item.address || item.city || "home"}`;
    const statusMeta = listingCardStatus(item, index);
    const baths = item.bathrooms > 0 ? item.bathrooms : Math.max(1, Math.min(3, Math.round(item.rooms / 2) || 1));

    useEffect(() => {
        const el = cardRef.current;
        if (!el) return;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduced) {
            el.classList.add("translate-y-0", "opacity-100");
            return;
        }
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        e.target.classList.remove("translate-y-2", "opacity-0");
                        e.target.classList.add("opacity-100", "translate-y-0");
                        io.unobserve(e.target);
                    }
                });
            },
            { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    return (
        <article
            ref={cardRef}
            className="group relative flex translate-y-2 flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white opacity-0 shadow-sm transition-all duration-300 hover:shadow-xl"
        >
            <div className="relative h-64 w-full overflow-hidden">
                <img
                    src={item.image_url ?? "/placeholder.jpg"}
                    alt={listingImageAlt(item.address, item.city, typeLabel)}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                        e.currentTarget.src = "/placeholder.jpg";
                    }}
                />
                <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 to-transparent"
                    aria-hidden
                />

                <div className="absolute left-4 top-4 flex max-w-[calc(100%-4rem)] flex-col items-start gap-2">
                    <div className="rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-gray-900 shadow-sm backdrop-blur-sm">
                        {typeLabel}
                    </div>
                    {statusMeta.badge ? (
                        <div
                            className={`rounded-full px-3 py-1 text-xs font-medium text-white shadow-sm ${statusMeta.badgeClass}`}
                        >
                            {statusMeta.badge}
                        </div>
                    ) : null}
                </div>

                <button
                    type="button"
                    className="absolute right-3 top-3 z-20 rounded-full bg-white/95 p-2 shadow-sm backdrop-blur-sm transition-transform hover:scale-105"
                    aria-label={saved ? "Remove from saved" : "Save listing"}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSaved((s) => !s);
                    }}
                >
                    <Heart
                        className={`h-4 w-4 transition-colors ${saved ? "fill-red-500 text-red-500" : "text-gray-600 hover:text-red-500"}`}
                        strokeWidth={2}
                        aria-hidden
                    />
                </button>
            </div>

            <div className="flex flex-1 flex-col p-6">
                <h3 className="text-2xl font-semibold tabular-nums tracking-tight text-gray-900 transition-colors group-hover:text-yellow-600">
                    {formatSEK(item.price)}
                </h3>

                <p className="mt-1 flex items-center gap-1 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                    <span className="line-clamp-1">{item.address}</span>
                </p>

                <div className="mb-0 mt-6 flex items-center justify-between gap-6 border-t border-gray-100 pt-6 text-sm text-gray-600">
                    <div className="flex flex-col items-center gap-0.5">
                        <Bed className="h-4 w-4 text-gray-400" aria-hidden />
                        <span className="font-medium">{item.rooms} rooms</span>
                    </div>
                    <div className="h-7 w-px bg-gray-200" aria-hidden />
                    <div className="flex flex-col items-center gap-0.5">
                        <Bath className="h-4 w-4 text-gray-400" aria-hidden />
                        <span className="font-medium">{baths} baths</span>
                    </div>
                    <div className="h-7 w-px bg-gray-200" aria-hidden />
                    <div className="flex flex-col items-center gap-0.5">
                        <Square className="h-4 w-4 text-gray-400" aria-hidden />
                        <span className="font-medium">{item.living_area} m²</span>
                    </div>
                </div>

                <div className="mt-6 flex items-center gap-3 border-t border-gray-100 pt-6">
                    <div className="relative shrink-0">
                        <img
                            src={agent.avatar}
                            alt=""
                            className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-sm"
                        />
                        <div
                            className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500"
                            aria-hidden
                        />
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">{agent.name}</p>
                        <p className="text-xs text-gray-500">Listing agent</p>
                    </div>
                </div>
            </div>

            <Link
                className="absolute inset-0 z-10 rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2"
                to={listingTo}
                state={listingState}
                aria-label={viewLabel}
            />
        </article>
    );
}
