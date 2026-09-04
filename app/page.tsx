import { CinematicFooter } from "@/components/Footer";
import HeroScroll from "@/components/HeroScroll";
import { AnimeNavBar } from "@/components/Navbar";
import ZoomInScroll from "@/components/ZoomInScroll";

export default function HomePage() {
  return (
    <>
      <AnimeNavBar></AnimeNavBar>
      <HeroScroll></HeroScroll>
      <ZoomInScroll />
      <CinematicFooter />
    </>
  );
}
