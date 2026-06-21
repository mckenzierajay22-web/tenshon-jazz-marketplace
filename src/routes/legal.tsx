import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/legal")({
  component: LegalPage,
});

function LegalPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-stone-100 p-24">
      <div className="max-w-3xl mx-auto space-y-16">
        <section>
          <h1 className="text-4xl font-serif font-bold mb-8">Terms of Service</h1>
          <div className="prose prose-invert">
            <p>By using this website and purchasing music, you agree to the following terms:</p>
            <ul>
              <li>The music purchased is for personal use only unless otherwise stated in a separate license agreement.</li>
              <li>Unauthorized distribution, reselling, or public performance for profit is strictly prohibited.</li>
              <li>All sales are final once the digital download has been initiated.</li>
            </ul>
          </div>
        </section>

        <section>
          <h1 className="text-4xl font-serif font-bold mb-8">Privacy Policy</h1>
          <div className="prose prose-invert">
            <p>Your privacy is important to us. We only collect the necessary information to process your orders:</p>
            <ul>
              <li>Email address for authentication and delivery of digital goods.</li>
              <li>Proof of payment information for verification purposes.</li>
              <li>We never share your personal data with third parties.</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
