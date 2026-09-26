import { ContentPulseShell } from "@/components/contentpulse-shell";
import { CommandCenter } from "@/components/contentpulse-ui";

export default function Home() {
  return (
    <ContentPulseShell title="Command Center" eyebrow="Overview">
      <CommandCenter />
    </ContentPulseShell>
  );
}
