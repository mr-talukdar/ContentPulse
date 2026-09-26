import { ContentPulseShell } from "@/components/contentpulse-shell";
import { AnalyticsWorkspace } from "@/components/contentpulse-ui";

export default function AnalyticsPage() {
  return (
    <ContentPulseShell title="Analytics" eyebrow="Like-for-like performance">
      <AnalyticsWorkspace />
    </ContentPulseShell>
  );
}
