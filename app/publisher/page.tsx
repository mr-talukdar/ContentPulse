import { ContentPulseShell } from "@/components/contentpulse-shell";
import { PublisherWorkspace } from "@/components/contentpulse-ui";

export default function PublisherPage() {
  return (
    <ContentPulseShell title="Publisher" eyebrow="Release pipeline">
      <PublisherWorkspace />
    </ContentPulseShell>
  );
}
