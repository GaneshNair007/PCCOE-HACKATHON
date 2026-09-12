import Link from "next/link";
export default function NotFound() {
  return <section className="ct-page-intro my-12 space-y-5">
    <p className="ct-eyebrow">404 · Page unavailable</p>
    <h1 className="ct-page-title">Let’s find your way back.</h1>
    <p className="ct-intro-copy">This address doesn’t match a CarbonTerra page.</p>
    <Link href="/" className="inline-flex rounded-full px-5 py-3 bg-lime text-black">Return to the scanner</Link>
  </section>;
}
