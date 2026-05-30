import { GuidePage } from "@/components/content/GuidePage";
import { HINGLISH_TITLES } from "@/lib/content/guides";
import { guideMetadata } from "@/lib/content/metadata";

export const metadata = guideMetadata(HINGLISH_TITLES);

export default function HinglishTitlesPage() {
  return <GuidePage guide={HINGLISH_TITLES} />;
}
