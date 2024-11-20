// /src/features/extensions-page/extension-page.tsx

"use client";

import React, { FC } from 'react';
import { ExtensionModel } from './extension-services/models';
// Remove client-side data fetching imports
// import { getCurrentUserGroups } from '../auth-page/helpers';
// import { GetExtensionsForUser } from './extension-services/extension-service';
// import { useSession } from 'next-auth/react';
import { ScrollArea } from '../ui/scroll-area';
import { ExtensionCard } from './extension-card/extension-card';
import { ExtensionHero } from './extension-hero/extension-hero';
import { AddExtension } from './add-extension/add-new-extension';

interface Props {
  extensions: ExtensionModel[];
}

export const ExtensionPage: FC<Props> = ({ extensions }) => {
  return (
    <ScrollArea className="flex-1">
      <main className="flex flex-1 flex-col">
        <ExtensionHero />
        <div className="container max-w-4xl py-3">
          <div className="grid grid-cols-3 gap-3">
            {extensions.map((extension) => (
              <ExtensionCard
                extension={extension}
                key={extension.id}
                showContextMenu
              />
            ))}
          </div>
        </div>
        <AddExtension />
      </main>
    </ScrollArea>
  );
};

// If you prefer default exports
export default ExtensionPage;