import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { fetchListing, fetchUsers, sendMessage } from "../api";
import { normalizeRealtorsFromUsers } from "../agentsNormalize.js";
import { useAuth } from "../AuthContext.jsx";
import {
    formatSEK,
    labelType,
    listingGalleryUrls,
    listingImageAlt,
    normalizeListing,
    resolveListingAgent,
} from "../listingFormat.js";
import { useDocumentTitle } from "../useDocumentTitle.js";

export default function ListingDetailPage() {
    const { user } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [listing, setListing] = useState(() => {
        const passed = location.state?.listing;
        return passed && String(passed.id) === String(id) ? normalizeListing(passed, 0) : null;
    });
    const [loadStatus, setLoadStatus] = useState("loading");
    const [loadError, setLoadError] = useState("");

    const [message, setMessage] = useState("");
    const [msgStatus, setMsgStatus] = useState("idle");
    const [msgError, setMsgError] = useState("");

    const [galleryIndex, setGalleryIndex] = useState(0);
    const [realtors, setRealtors] = useState([]);
    const touchStartX = useRef(null);

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

    useEffect(() => {
        let ignore = false;
        const passed = location.state?.listing;
        const sameAsState = passed && String(passed.id) === String(id);

        async function load() {
            setLoadStatus("loading");
            setLoadError("");
            try {
                const raw = await fetchListing(id);
                if (ignore) return;
                if (raw == null) {
                    setLoadStatus("error");
                    setLoadError("Listing not found.");
                    setListing(null);
                    return;
                }
                setListing(normalizeListing(raw, 0));
                setLoadStatus("ready");
            } catch (e) {
                if (!ignore) {
                    setLoadStatus("error");
                    setLoadError(e?.message || "Failed to load listing");
                    if (!sameAsState) {
                        setListing(null);
                    }
                }
            }
        }

        if (sameAsState) {
            setListing(normalizeListing(passed, 0));
        }

        load();
        return () => {
            ignore = true;
        };
    }, [id, location.key, location.state]);

    const l = listing;
    useDocumentTitle(
        loadStatus === "ready" && l
            ? `${(l.title || l.address || "Listing").slice(0, 56)} · Moonhem`
            : "Listing · Moonhem"
    );

    const galleryUrls = l ? listingGalleryUrls(l) : [];
    useEffect(() => {
        setGalleryIndex(0);
    }, [id, l?.image_url]);

    const goGallery = useCallback(
        (delta) => {
            if (galleryUrls.length <= 1) return;
            setGalleryIndex((i) => (i + delta + galleryUrls.length) % galleryUrls.length);
        },
        [galleryUrls.length]
    );

    useEffect(() => {
        if (galleryUrls.length <= 1) return;
        const onKey = (e) => {
            if (e.key === "ArrowLeft") {
                e.preventDefault();
                goGallery(-1);
            }
            if (e.key === "ArrowRight") {
                e.preventDefault();
                goGallery(1);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [galleryUrls.length, goGallery]);

    const onBack = () => navigate(-1);

    if (loadStatus === "loading" && !listing) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
                <div className="mh-detailSkeleton">
                    <div className="mh-skeletonBlock mh-detailSkeletonHero" />
                    <div className="mh-skeletonLine mh-skeletonLine--short" />
                    <div className="mh-skeletonLine" />
                    <div className="mh-skeletonLine mh-skeletonLine--medium" />
                </div>
                </div>
            </div>
        );
    }

    if (loadStatus === "error" && !listing) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
                <div className="mh-breadcrumb">
                    <button className="mh-link" type="button" onClick={() => navigate("/")}>
                        ← Back to home
                    </button>
                </div>
                <p style={{ color: "crimson", fontWeight: 700 }}>{loadError}</p>
                </div>
            </div>
        );
    }

    const typeLabel = labelType(l.property_type);
    const imgAlt = listingImageAlt(l.address, l.city, typeLabel);
    const mainImg = galleryUrls[galleryIndex] ?? l.image_url;
    const crumbTitle = (l.title || l.address || "Property").slice(0, 48);
    const agent = resolveListingAgent(l, realtors);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!user) {
            setMsgError("Please log in to send a message.");
            return;
        }
        if (!l.realtor_id) {
            setMsgError("No realtor attached to this listing.");
            return;
        }
        if (!message.trim()) return;

        setMsgStatus("sending");
        setMsgError("");
        try {
            await sendMessage({
                receiver_id: l.realtor_id,
                listing_id: l.id ?? 0,
                content: message.trim(),
            });
            setMsgStatus("sent");
            setMessage("");
        } catch (err) {
            setMsgStatus("error");
            setMsgError(err.message || "Failed to send message");
        } finally {
            setTimeout(() => setMsgStatus("idle"), 1200);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-28">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <nav className="mh-breadcrumbTrail" aria-label="Breadcrumb">
                <Link to="/" className="mh-breadcrumbLink">
                    Home
                </Link>
                <span className="mh-breadcrumbSep" aria-hidden="true">
                    /
                </span>
                <Link to={{ pathname: "/", hash: "listings" }} className="mh-breadcrumbLink">
                    Listings
                </Link>
                <span className="mh-breadcrumbSep" aria-hidden="true">
                    /
                </span>
                <span className="mh-breadcrumbCurrent" aria-current="page">
                    {crumbTitle}
                </span>
            </nav>
            <div className="mh-breadcrumb">
                <button className="mh-link" type="button" onClick={onBack}>
                    ← Back
                </button>
            </div>

            <div className="mh-detailHero">
                <div
                    className="mh-detailMedia"
                    onTouchStart={(e) => {
                        touchStartX.current = e.changedTouches[0]?.clientX ?? null;
                    }}
                    onTouchEnd={(e) => {
                        const x0 = touchStartX.current;
                        touchStartX.current = null;
                        const x1 = e.changedTouches[0]?.clientX;
                        if (x0 == null || x1 == null) return;
                        const d = x1 - x0;
                        if (Math.abs(d) < 48) return;
                        goGallery(d < 0 ? 1 : -1);
                    }}
                >
                    <img src={mainImg} alt={imgAlt} />
                    <div className="mh-detailTag">{l.property_type}</div>
                    <div className="mh-detailSave">♡ Save</div>
                    {galleryUrls.length > 1 ? (
                        <>
                            <div className="mh-galleryCounter" aria-live="polite">
                                {galleryIndex + 1} / {galleryUrls.length}
                            </div>
                            <button
                                type="button"
                                className="mh-galleryNav mh-galleryNav--prev"
                                aria-label="Previous image"
                                onClick={() => goGallery(-1)}
                            >
                                ‹
                            </button>
                            <button
                                type="button"
                                className="mh-galleryNav mh-galleryNav--next"
                                aria-label="Next image"
                                onClick={() => goGallery(1)}
                            >
                                ›
                            </button>
                        </>
                    ) : null}
                </div>
                <div className="mh-detailInfo">
                    <div className="mh-price">{formatSEK(l.price)}</div>
                    <div className="mh-detailMeta">
                        {[
                            l.property_type && { label: "Type", value: l.property_type },
                            l.living_area && { label: "Living", value: `${l.living_area} m²` },
                            l.lot_size && { label: "Lot", value: `${l.lot_size} m²` },
                            l.rooms && { label: "Rooms", value: `${l.rooms}` },
                            l.year_built && { label: "Built", value: l.year_built },
                            l.city && { label: "City", value: l.city },
                        ]
                            .filter(Boolean)
                            .map((item, idx) => (
                                <span key={idx} className="mh-metaPill">
                                    <span className="mh-muted">{item.label}</span> {item.value}
                                </span>
                            ))}
                    </div>
                    <h1 className="mh-detailTitle">{l.title ?? l.address}</h1>
                    <div className="mh-muted">{l.address}</div>
                    <div className="mh-detailAgent">
                        <img className="mh-agentAvatar" src={agent.avatar} alt="" />
                        <div>
                            <div className="mh-agentName">{agent.name}</div>
                            <div className="mh-muted">{agent.agency || "Moonhem Real Estate"}</div>
                            {agent.phone ? (
                                <a className="mh-link" href={`tel:${agent.phone}`} style={{ fontSize: 13 }}>
                                    {agent.phone}
                                </a>
                            ) : null}
                            {agent.email ? (
                                <div>
                                    <a className="mh-link" href={`mailto:${agent.email}`} style={{ fontSize: 13 }}>
                                        {agent.email}
                                    </a>
                                </div>
                            ) : null}
                        </div>
                    </div>
                    <form id="mh-agent-message" className="mh-messageBox" onSubmit={handleSend}>
                        <label className="mh-field" style={{ margin: 0 }}>
                            <span>Message the agent</span>
                            <textarea
                                className="mh-textarea"
                                placeholder="Hi, I'm interested in this property. Could we schedule a viewing?"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={3}
                            />
                        </label>
                        {msgError ? <div className="mh-error">{msgError}</div> : null}
                        <div className="mh-detailActions">
                            <button className="mh-btn" type="submit" disabled={msgStatus === "sending"}>
                                {msgStatus === "sending"
                                    ? "Sending…"
                                    : msgStatus === "sent"
                                      ? "Sent!"
                                      : "Send message"}
                            </button>
                            {!user ? (
                                <div className="mh-muted" style={{ fontSize: 12 }}>
                                    <Link
                                        className="mh-link"
                                        to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`}
                                    >
                                        Log in
                                    </Link>{" "}
                                    to send messages.
                                </div>
                            ) : null}
                        </div>
                    </form>
                </div>
            </div>

            <div className="mh-detailBody">
                <div className="mh-detailSection">
                    <h3>About the home</h3>
                    <p className="mh-dialogText">{l.description}</p>
                    <button className="mh-ghost" type="button">
                        View full description
                    </button>
                </div>
                <div className="mh-detailSection">
                    <h3>Key figures</h3>
                    <div className="mh-keyGrid">
                        <div>
                            <div className="mh-muted">Price</div>
                            <div className="mh-strong">{formatSEK(l.price)}</div>
                        </div>
                        <div>
                            <div className="mh-muted">Living area</div>
                            <div className="mh-strong">{l.living_area || "—"} m²</div>
                        </div>
                        <div>
                            <div className="mh-muted">Lot</div>
                            <div className="mh-strong">{l.lot_size || "—"} m²</div>
                        </div>
                        <div>
                            <div className="mh-muted">Type</div>
                            <div className="mh-strong">{l.property_type}</div>
                        </div>
                        {l.year_built ? (
                            <div>
                                <div className="mh-muted">Year built</div>
                                <div className="mh-strong">{l.year_built}</div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>

            <LoanCalculator price={l.price} />

            <div className="mh-detailSticky" role="region" aria-label="Quick actions">
                <a
                    href="#mh-agent-message"
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-yellow-500 px-6 py-3.5 text-center font-semibold text-white shadow-lg transition hover:bg-yellow-600 sm:w-auto"
                >
                    Message agent
                </a>
            </div>
            </div>
        </div>
    );
}

function LoanCalculator({ price }) {
    const [downPct, setDownPct] = useState(15);
    const [rate, setRate] = useState(3.5);
    const [years, setYears] = useState(30);

    const principal = Math.max(0, Number(price || 0) * (1 - downPct / 100));
    const monthly = calcMonthly(principal, rate, years);
    const downPayment = Math.max(0, Number(price || 0) * (downPct / 100));

    return (
        <div className="mh-detailSection mh-loanCard">
            <h3>Estimate your loan</h3>
            <div className="mh-loanGrid">
                <label className="mh-field">
                    <span>Home price (SEK)</span>
                    <input
                        className="mh-input"
                        type="number"
                        value={price ?? 0}
                        readOnly
                        style={{ background: "#f5f5f5" }}
                    />
                </label>
                <label className="mh-field">
                    <span>Down payment (%)</span>
                    <input
                        className="mh-input"
                        type="number"
                        min="0"
                        max="100"
                        value={downPct}
                        onChange={(e) => setDownPct(Number(e.target.value) || 0)}
                    />
                </label>
                <label className="mh-field">
                    <span>Interest rate (%)</span>
                    <input
                        className="mh-input"
                        type="number"
                        min="0"
                        step="0.1"
                        value={rate}
                        onChange={(e) => setRate(Number(e.target.value) || 0)}
                    />
                </label>
                <label className="mh-field">
                    <span>Term (years)</span>
                    <input
                        className="mh-input"
                        type="number"
                        min="1"
                        max="50"
                        value={years}
                        onChange={(e) => setYears(Number(e.target.value) || 0)}
                    />
                </label>
            </div>

            <div className="mh-loanGrid values">
                <div className="mh-loanRow">
                    <span className="mh-muted">Down payment</span>
                    <span className="mh-loanValue">{formatSEK(downPayment)}</span>
                </div>
                <div className="mh-loanRow">
                    <span className="mh-muted">Estimated monthly</span>
                    <span className="mh-loanValue">{formatSEK(monthly)}</span>
                </div>
            </div>
            <div className="mh-muted" style={{ fontSize: 12, marginTop: 6 }}>
                Simple annuity estimate; exclude fees/insurance. Adjust rate/term for your bank offer.
            </div>
        </div>
    );
}

function calcMonthly(principal, annualRatePct, years) {
    const r = (annualRatePct / 100) / 12;
    const n = years * 12;
    if (r === 0) return n > 0 ? principal / n : 0;
    return principal * (r / (1 - Math.pow(1 + r, -n)));
}
