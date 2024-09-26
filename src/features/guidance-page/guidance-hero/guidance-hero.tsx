"use client";
import { Hero, HeroButton } from "@/features/ui/hero";
import { Book, BookOpenText, BookImage, NotebookPen } from "lucide-react";


export const GuidanceHero = () => {
  return (
    <Hero
      title={
        <>
          <BookOpenText size={36} strokeWidth={1.5} /> Guidance
        </>
      }
      description={
        "Guidance is a page for helping users on how to use the site."
      }
    >
    </Hero>
  );
};