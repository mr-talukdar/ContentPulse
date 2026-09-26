import { ContentPulseShell } from "@/components/contentpulse-shell";
import { ReportsWorkspace } from "@/components/contentpulse-ui";

export default function ReportsPage() {
  return (
    <ContentPulseShell title="Reports" eyebrow="Weekly synthesis">
      <ReportsWorkspace />
    </ContentPulseShell>
  );
}
