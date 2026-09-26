import { ContentPulseShell } from "@/components/contentpulse-shell";
import { InsightsWorkspace } from "@/components/contentpulse-ui";

export default function InsightsPage() {
  return (
    <ContentPulseShell title="Insights" eyebrow="AI learning loop">
      <InsightsWorkspace />
    </ContentPulseShell>
  );
}
