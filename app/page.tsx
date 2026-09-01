import CinematicProductScroll from "@/components/CinematicProductScroll";
import { CinematicFooter } from "@/components/Footer";
import { AnimeNavBar } from "@/components/Navbar";
import ZoomInScroll from "@/components/ZoomInScroll";

export default function HomePage() {
  return (
    <>
      <AnimeNavBar />
      <CinematicProductScroll />
      <ZoomInScroll />
      <CinematicFooter />
    </>
  );
}
