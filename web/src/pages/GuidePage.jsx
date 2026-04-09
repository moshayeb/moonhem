import { useNavigate } from "react-router-dom";
import Guides from "../Guides.jsx";
import { CardHeading, ContentCard, PageHero, PageMain } from "../ui/PageChrome.jsx";
import { useDocumentTitle } from "../useDocumentTitle.js";

export default function GuidePage() {
    useDocumentTitle("Buyer guide · Moonhem");
    const navigate = useNavigate();
    const onOpenArticle = (slug) =>
        navigate(`/article/${slug || "buy"}`, { state: { from: "guide" } });

    return (
        <div className="min-h-screen bg-gray-50">
            <PageHero
                eyebrow="Moonhem · Guide"
                title="How to buy a home with Moonhem."
                subtitle="A quick overview from alerts to contracts so you know each step."
                imageUrl="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1600&q=80"
            />

            <PageMain className="flex flex-col gap-8">
                <ContentCard>
                    <CardHeading>Step by step</CardHeading>
                    <ol className="list-decimal space-y-4 pl-5 text-gray-600">
                        <li>
                            <span className="font-semibold text-gray-900">Track your area.</span> Use search and save
                            filters to catch new listings instantly.
                        </li>
                        <li>
                            <span className="font-semibold text-gray-900">Book a viewing.</span> Message the agent on
                            the detail page and propose times that work.
                        </li>
                        <li>
                            <span className="font-semibold text-gray-900">Run your numbers.</span> Compare mortgage rates
                            and costs early to know your budget.
                        </li>
                        <li>
                            <span className="font-semibold text-gray-900">Place a bid.</span> Align with the agent on
                            rules and timeline before bidding.
                        </li>
                        <li>
                            <span className="font-semibold text-gray-900">Contract & inspection.</span> Make sure
                            conditions (move-in, inspection, financing) are included.
                        </li>
                    </ol>
                </ContentCard>

                <div className="grid gap-6 md:grid-cols-3">
                    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                        <div className="text-lg font-semibold text-gray-900">Fast contact</div>
                        <p className="mt-2 text-sm text-gray-600">Messages go straight to the agent from the listing.</p>
                    </div>
                    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                        <div className="text-lg font-semibold text-gray-900">Safe steps</div>
                        <p className="mt-2 text-sm text-gray-600">
                            Clear checkpoints so you don’t miss anything important.
                        </p>
                    </div>
                    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                        <div className="text-lg font-semibold text-gray-900">Rates & budget</div>
                        <p className="mt-2 text-sm text-gray-600">
                            Have your budget ready before bidding for a faster deal.
                        </p>
                    </div>
                </div>
            </PageMain>

            <section className="bg-white py-16">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="mb-12 text-center">
                        <h2 className="text-3xl font-semibold tracking-tight text-gray-900">Guides &amp; inspiration</h2>
                        <p className="mt-2 text-gray-600">Short tips to keep buyers informed.</p>
                    </div>
                    <Guides onOpenArticle={onOpenArticle} />
                </div>
            </section>
        </div>
    );
}
