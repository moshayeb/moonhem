import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ContentCard, PageHero, PageMain } from "../ui/PageChrome.jsx";
import { useDocumentTitle } from "../useDocumentTitle.js";

const ARTICLES = {
    buy: {
        title: "Buy a home: 5 steps",
        subtitle: "A clear path from first viewing to signed contract.",
        hero: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80",
        sections: [
            {
                heading: "1) Set your search",
                bullets: [
                    "Save filters for area, price, and type to catch new listings fast.",
                    "Enable alerts so you see homes the moment they are listed.",
                ],
            },
            {
                heading: "2) View & compare",
                bullets: [
                    "Book viewings directly with the agent; prepare 2–3 options to compare.",
                    "Take notes on condition, light, noise, and potential renovations.",
                ],
            },
            {
                heading: "3) Run your numbers",
                bullets: [
                    "Align with your bank on max budget, rate, and amortization.",
                    "Include fees, insurance, and monthly costs in your estimate.",
                ],
            },
            {
                heading: "4) Bid with confidence",
                bullets: [
                    "Agree on bidding rules and timeline with the agent before you start.",
                    "Be ready to show financing confirmation if requested.",
                ],
            },
            {
                heading: "5) Contract & handover",
                bullets: [
                    "Include inspection, financing, and move-in terms in the contract.",
                    "Confirm utilities, keys, and final walk-through date.",
                ],
            },
        ],
    },
    sell: {
        title: "Sell faster",
        subtitle: "Raise impact with better visuals, copy, and timing.",
        hero: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
        sections: [
            {
                heading: "Prep and styling",
                bullets: [
                    "Declutter, neutralize colors, and add light to key rooms.",
                    "Fix small defects; they reduce friction and boost perceived quality.",
                ],
            },
            {
                heading: "Photos & copy",
                bullets: [
                    "Hire a pro photographer; focus on first photo and living areas.",
                    "Write crisp copy: highlight light, layout, storage, and nearby transit.",
                ],
            },
            {
                heading: "Pricing & timing",
                bullets: [
                    "Align pricing with recent comparables; avoid overpricing early.",
                    "List mid-week for peak attention; coordinate viewings close together.",
                ],
            },
            {
                heading: "During showings",
                bullets: [
                    "Provide a fact sheet with fees, renovations, and floor plan.",
                    "Collect questions and answer quickly; momentum matters.",
                ],
            },
        ],
    },
    finance: {
        title: "Financing",
        subtitle: "Understand rate, amortization, and down payment basics.",
        hero: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1600&q=80",
        sections: [
            {
                heading: "Down payment",
                bullets: [
                    "Typical minimum is 15% of the purchase price.",
                    "Higher down payment lowers your monthly cost and rate risk.",
                ],
            },
            {
                heading: "Interest rate",
                bullets: [
                    "Fixed rate gives predictability; variable can benefit in falling rate environments.",
                    "Run scenarios (±1–2%) to see how payment changes over time.",
                ],
            },
            {
                heading: "Amortization",
                bullets: [
                    "Longer terms reduce monthly cost but raise total interest paid.",
                    "Match term to your horizon; overpay when you can to cut interest.",
                ],
            },
            {
                heading: "Extra costs",
                bullets: [
                    "Include insurance, fees, taxes, and monthly charges in your budget.",
                    "Keep a buffer for maintenance and unexpected repairs.",
                ],
            },
        ],
    },
};

export default function ArticlePage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const article = ARTICLES[slug] || ARTICLES.buy;
    useDocumentTitle(`${article.title} · Moonhem`);

    const onBack = () => {
        if (location.state?.from === "guide") {
            navigate("/guide");
        } else {
            navigate("/");
        }
    };

    const backLabel = location.state?.from === "guide" ? "Back to buyer guide" : "Back to home";

    return (
        <div className="min-h-screen bg-gray-50">
            <PageHero
                eyebrow="Guide"
                title={article.title}
                subtitle={article.subtitle}
                imageUrl={article.hero}
                minHeightClass="min-h-[280px] md:min-h-[340px]"
            />
            <div className="mx-auto max-w-7xl px-6 pb-4 pt-6">
                <button
                    type="button"
                    className="rounded-2xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-800 shadow-sm transition hover:border-yellow-500"
                    onClick={onBack}
                >
                    {backLabel}
                </button>
            </div>

            <PageMain className="flex flex-col gap-8 pt-0">
                {article.sections.map((sec) => (
                    <ContentCard key={sec.heading}>
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">{sec.heading}</h2>
                        <ul className="list-disc space-y-2 pl-5 text-gray-600">
                            {sec.bullets.map((b) => (
                                <li key={b}>{b}</li>
                            ))}
                        </ul>
                    </ContentCard>
                ))}
            </PageMain>
        </div>
    );
}
