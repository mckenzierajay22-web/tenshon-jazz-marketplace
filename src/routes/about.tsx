import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-stone-100 p-24">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-serif font-bold mb-8">About TENSHON</h1>
        <p className="text-xl text-stone-400 mb-12 leading-relaxed">
          TENSHON is a celebrated jazz and blues composer dedicated to preserving the soulful traditions 
          of the genres while infusing them with modern island influences.
        </p>
        <div className="prose prose-invert max-w-none">
          <p>
            Based in the heart of St. Ann, Jamaica, TENSHON has spent decades perfecting his craft. 
            This marketplace was created to allow fans to support original music directly, 
            bypassing traditional gatekeepers and ensuring the artist receives fair compensation for their art.
          </p>
          <p className="mt-8">
            Every piece you hear on this platform is composed, recorded, and produced by TENSHON himself. 
            By purchasing a license, you are not just buying music—you are supporting the continuation of 
            the jazz and blues legacy.
          </p>
        </div>
        <Link to="/" className="mt-12 inline-block px-8 py-3 bg-amber-500 text-zinc-950 font-bold rounded-xl">
          Explore the Music
        </Link>
      </div>
    </div>
  );
}
