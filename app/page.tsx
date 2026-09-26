import { ContentPulseShell } from "@/components/contentpulse-shell";
import { CommandCenter } from "@/components/contentpulse/command-center";

export default function Home() {
  return (
    <ContentPulseShell title="Command Center" eyebrow="Overview">
      <CommandCenter />
    </ContentPulseShell>
  );
}
