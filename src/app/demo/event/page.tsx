import { DemoEventContent } from "./demo-event";

// The measurement runner reads server HTML, including the selected image variant.
export const dynamic = "force-dynamic";
export default function DemoEventPage({ searchParams }: { searchParams: { variant?: string } }) {
  const variant = (searchParams.variant || "baseline") as "baseline" | "optimized" | "broken";
  return <DemoEventContent variant={variant} />;
}
