// extension-page.tsx

"use client"; 

import React, { FC, useEffect, useState } from 'react';
import { ExtensionModel } from './extension-services/models';
import { getCurrentUserGroups } from '../auth-page/helpers';
import { GetExtensionsForUser } from './extension-services/extension-service';
import { AddExtension } from './add-extension/add-new-extension';
import { ScrollArea } from '../ui/scroll-area';
import { ExtensionCard } from './extension-card/extension-card';
import { ExtensionHero } from './extension-hero/extension-hero';

export const ExtensionPage: FC = () => {
  const [extensions, setExtensions] = useState<ExtensionModel[]>([]);

  useEffect(() => {
    const fetchExtensions = async () => {
      const userGroups = await getCurrentUserGroups();
      const response = await GetExtensionsForUser(userGroups);

      if (response.status === 'OK') {
        setExtensions(response.response);
      } else {
        console.error('Error fetching extensions:', response.errors);
      }
    };

    fetchExtensions();
  }, []);

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
