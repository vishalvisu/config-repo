import { GuidePage } from "@/components/content/GuidePage";
import { THUMBNAIL_TIPS } from "@/lib/content/guides";
import { guideMetadata } from "@/lib/content/metadata";

export const metadata = guideMetadata(THUMBNAIL_TIPS);

export default function ThumbnailTipsPage() {
  return <GuidePage guide={THUMBNAIL_TIPS} />;
}
