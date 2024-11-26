"use client";

import { AI_NAME } from "@/features/theme/theme-config";
import { Hero } from "@/features/ui/hero";
import { PaintBucket, Shield } from "lucide-react";
import { AISearch } from "./ai-search-admin";
import { BingSearch } from "./bing-search";
import { BingSearchAdmin } from "./bing-search-admin";

export const ExtensionHero = () => {

  return (
    <Hero
      title={
        <>
          <Shield size={36} strokeWidth={1.5} /> Admin Portal
        </>
      }
      description={`Seamlessly connect ${AI_NAME} with internal APIs or external
        resources`}
    >
      <AISearch />
      <BingSearchAdmin />
    </Hero>
  );
};