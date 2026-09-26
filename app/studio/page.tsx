import { ContentPulseShell } from "@/components/contentpulse-shell";
import { StudioWorkspace } from "@/components/contentpulse-ui";

export default function StudioPage() {
  return (
    <ContentPulseShell title="Generative Studio" eyebrow="Create" wide>
      <StudioWorkspace />
    </ContentPulseShell>
  );
}
