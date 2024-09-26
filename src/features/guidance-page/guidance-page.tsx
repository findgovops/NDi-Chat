import { FC } from "react";
import { GuidanceHero } from "./guidance-hero/guidance-hero";
import { ScrollArea } from "@radix-ui/react-scroll-area";

interface Props {

}

export const GuidancePage: FC<Props> = async () => {
  return (
    <ScrollArea className="flex-1">
      <main className="flex flex-1 flex-col">
        <GuidanceHero />
        <p>Test</p>
      </main>
    </ScrollArea>
  );
};