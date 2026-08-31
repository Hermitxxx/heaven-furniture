
import { OfferCarousel } from "@/components/Carousel";
import CinematicProductScroll from "@/components/CinematicProductScroll";
import { Features } from "@/components/Features";
import { AnimeNavBar } from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import ZoomInScroll from "@/components/ZoomInScroll";
import Image from "next/image";

export default function HomePage() {
  return (
    <>
      <AnimeNavBar></AnimeNavBar>
      <CinematicProductScroll></CinematicProductScroll>
      <ZoomInScroll></ZoomInScroll>
    </>
  );
}
