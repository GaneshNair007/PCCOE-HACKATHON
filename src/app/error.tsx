"use client";
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return <section role="alert" className="ct-page-intro my-8 space-y-5">
    <p className="ct-eyebrow">Something went wrong</p>
    <h1 className="ct-page-title">Your workspace couldn’t load.</h1>
    <p className="ct-intro-copy">Try loading this page again.</p>
    <button onClick={reset} className="rounded-full px-5 py-3 bg-lime text-black">Try again</button>
  </section>;
}
