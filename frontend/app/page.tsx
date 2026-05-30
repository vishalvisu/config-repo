import { HomeDashboard } from "@/components/dashboard/HomeDashboard";
import { HomeFaq } from "@/components/content/HomeFaq";
import { HomeHero } from "@/components/content/HomeHero";

export default function Home() {
  return (
    <>
      <HomeHero />
      <HomeDashboard />
      <HomeFaq />
    </>
  );
}
