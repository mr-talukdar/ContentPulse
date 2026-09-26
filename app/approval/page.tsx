import { ContentPulseShell } from "@/components/contentpulse-shell";
import { ApprovalWorkspace } from "@/components/contentpulse-ui";

export default function ApprovalPage() {
  return (
    <ContentPulseShell title="Approval Queue" eyebrow="Human review">
      <ApprovalWorkspace />
    </ContentPulseShell>
  );
}
