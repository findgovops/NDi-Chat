// access-portal.tsx

import { FC } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { ExtensionHero } from "../extensions-page/extension-hero/extension-hero-acess";
import { ExtensionCard } from "../extensions-page/extension-card/extension-card";
import { ExtensionModel } from "../extensions-page/extension-services/models";

interface Props {
  extensions: ExtensionModel[];
}

export const AccessPortalPage: FC<Props> = (props) => {
  return (
    <ScrollArea className="flex-1">
      <main className="flex flex-1 flex-col">
        <ExtensionHero />
        <div className="container max-w-4xl py-3">
          <div className="grid grid-cols-3 gap-3">
            {/* Render existing extensions if needed */}
            {props.extensions.map((extension) => (
              <ExtensionCard
                extension={extension}
                key={extension.id}
                showContextMenu
              />
            ))}
          </div>
        </div>
      </main>
    </ScrollArea>
  );
};

export default AccessPortalPage;