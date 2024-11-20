"use client";

import { AI_NAME } from "@/features/theme/theme-config";
import { Hero } from "@/features/ui/hero";
import { PaintBucket, Shield } from "lucide-react";
import { AISearch } from "./ai-search-access";
import { BingSearch } from "./bing-search";

export const ExtensionHero = () => {

  return (
    <Hero
      title={
        <>
          <Shield size={36} strokeWidth={1.5} /> Access Portal
        </>
      }
      description={`Seamlessly connect ${AI_NAME} with internal APIs or external
        resources`}
    >
      <AISearch />
    </Hero>
  );
};