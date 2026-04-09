import { Link } from "react-router-dom";
import { CardHeading, ContentCard, PageHero, PageMain } from "../ui/PageChrome.jsx";
import { useDocumentTitle } from "../useDocumentTitle.js";

export default function CareersPage() {
    useDocumentTitle("Careers · Moonhem");
    return (
        <div className="min-h-screen bg-gray-50">
            <PageHero
                eyebrow="Moonhem · Careers"
                title="Build a career around great places."
                subtitle="We hire agents, coordinators, and marketing talent who care about craft and client experience."
                imageUrl="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80"
            />

            <PageMain className="flex flex-col gap-8">
                <ContentCard>
                    <CardHeading>Open roles</CardHeading>
                    <p className="mb-4 text-gray-600">
                        We do not always publish every opening online. If you are interested in real estate, photography,
                        or operations in the Nordics, send us a short note and we will get back when there is a fit.
                    </p>
                    <ul className="list-disc space-y-2 pl-5 text-gray-600">
                        <li>Licensed or aspiring residential agents (Stockholm)</li>
                        <li>Part-time listing coordination &amp; customer care</li>
                    </ul>
                </ContentCard>

                <ContentCard>
                    <CardHeading>How to apply</CardHeading>
                    <p className="mb-6 text-gray-600">
                        Email your CV and a few lines on what you want to work on. We read every message.
                    </p>
                    <a
                        href="mailto:careers@moonhem.com?subject=Career%20inquiry"
                        className="inline-flex items-center justify-center rounded-2xl bg-yellow-500 px-8 py-3.5 font-semibold text-white transition hover:bg-yellow-600"
                    >
                        careers@moonhem.com
                    </a>
                </ContentCard>

                <ContentCard>
                    <CardHeading>General questions</CardHeading>
                    <p className="mb-6 text-gray-600">For buyers, sellers, and press, use the main contact channel.</p>
                    <Link
                        to="/contact"
                        className="inline-flex items-center justify-center rounded-2xl border-2 border-gray-900 px-8 py-3.5 font-semibold text-gray-900 transition hover:bg-gray-900 hover:text-white"
                    >
                        Go to contact
                    </Link>
                </ContentCard>
            </PageMain>
        </div>
    );
}
