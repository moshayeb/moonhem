import { Link } from "react-router-dom";
import { CardHeading, ContentCard, PageHero, PageMain } from "../ui/PageChrome.jsx";
import { useDocumentTitle } from "../useDocumentTitle.js";

export default function AboutPage() {
    useDocumentTitle("About · Moonhem");
    return (
        <div className="min-h-screen bg-gray-50">
            <PageHero
                eyebrow="Moonhem · About"
                title="Homes and people, not just listings."
                subtitle="Moonhem is a Stockholm-based real estate platform: curated homes, verified agents, and clear guidance from first search to keys. We focus on fewer, better listings and real conversations—not endless scrolling."
                imageUrl="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80"
            />

            <PageMain className="flex flex-col gap-8">
                <ContentCard>
                    <CardHeading>Who we are</CardHeading>
                    <p className="mb-4 text-gray-600">
                        Moonhem exists to make buying and selling in Sweden feel straightforward. We combine listings,
                        local agent expertise, and practical resources so you always know the next step—whether you are
                        comparing apartments, booking a viewing, or getting ready to bid.
                    </p>
                    <p className="text-gray-600">
                        Our team works with vetted brokers who know their neighborhoods. You message agents directly from
                        each property page, and we keep the experience fast, transparent, and human.
                    </p>
                </ContentCard>

                <ContentCard>
                    <CardHeading>What we do</CardHeading>
                    <p className="mb-4 text-gray-600">
                        Moonhem brings together verified listings, buyer education, and direct contact with agents. Our
                        goal is to make every step—from search to keys—predictable and human.
                    </p>
                    <p className="text-gray-600">
                        We work across Stockholm and surrounding areas, with a bias toward quality over volume.
                    </p>
                </ContentCard>

                <ContentCard>
                    <CardHeading>Values</CardHeading>
                    <ul className="list-disc space-y-3 pl-5 text-gray-600">
                        <li>
                            <span className="font-semibold text-gray-900">Transparency.</span> Plain language on fees,
                            process, and what each listing really offers.
                        </li>
                        <li>
                            <span className="font-semibold text-gray-900">Respect for your time.</span> Fast replies,
                            flexible viewings, and digital options when they help.
                        </li>
                        <li>
                            <span className="font-semibold text-gray-900">Local insight.</span> Agents who know
                            neighborhoods, schools, and commute patterns—not just floor plans.
                        </li>
                    </ul>
                </ContentCard>

                <ContentCard>
                    <CardHeading>Talk to us</CardHeading>
                    <p className="mb-6 text-gray-600">Buying, selling, or partnering—we are happy to hear from you.</p>
                    <div className="flex flex-wrap gap-3">
                        <Link
                            to="/contact"
                            className="inline-flex items-center justify-center rounded-2xl bg-yellow-500 px-8 py-3.5 font-semibold text-white transition hover:bg-yellow-600"
                        >
                            Contact
                        </Link>
                        <Link
                            to="/guide"
                            className="inline-flex items-center justify-center rounded-2xl border-2 border-gray-900 px-8 py-3.5 font-semibold text-gray-900 transition hover:bg-gray-900 hover:text-white"
                        >
                            Buyer guide
                        </Link>
                    </div>
                </ContentCard>
            </PageMain>
        </div>
    );
}
