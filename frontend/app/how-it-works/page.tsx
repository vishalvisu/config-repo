import { GuidePage } from "@/components/content/GuidePage";
import { HOW_IT_WORKS } from "@/lib/content/guides";
import { guideMetadata } from "@/lib/content/metadata";

export const metadata = guideMetadata(HOW_IT_WORKS);

export default function HowItWorksPage() {
  return <GuidePage guide={HOW_IT_WORKS} />;
}
