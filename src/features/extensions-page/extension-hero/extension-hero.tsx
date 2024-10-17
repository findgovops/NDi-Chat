"use client";

import { AI_NAME } from "@/features/theme/theme-config";
import { Hero } from "@/features/ui/hero";
import { PaintBucket } from "lucide-react";
import { AISearch } from "./ai-search-issues";
import { BingSearch } from "./bing-search";
import { NewExtension } from "./new-extension";

export const ExtensionHero = () => {
  return (
    <Hero
      title={
        <>
          <PaintBucket size={36} strokeWidth={1.5} /> Buckets
        </>
      }
      description={`Seamlessly connect ${AI_NAME} with internal APIs or external
        resources`}
    >
      <BingSearch />
      <AISearch />
    </Hero>
  );
};
