import CinematicProductScroll from "@/components/CinematicProductScroll";
import { Features } from "@/components/Features";
import { AnimeNavBar } from "@/components/Navbar";
import Image from "next/image";

export default function HomePage() {
  return (
    <>
      <AnimeNavBar></AnimeNavBar>
      <CinematicProductScroll></CinematicProductScroll>
      <Features></Features>
    </>
  );
}
