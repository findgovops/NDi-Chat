"use client";

import { Button } from "@/features/ui/button";
import { ExternalLink, Pencil } from "lucide-react";
import { FC } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { ExtensionModel } from "../extension-services/models";
import { extensionStore } from "../extension-store";
import { ExtensionCardContextMenu } from "./extension-context-menu";
import { StartNewExtensionChat } from "./start-new-extension-chat";

interface Props {
  extension: ExtensionModel;
  showContextMenu: boolean;
}

export const ExtensionCard: FC<Props> = (props) => {
  const { extension } = props;
  return (
    <Card key={extension.id} className="flex flex-col">
      <CardHeader className="flex flex-row">
        <CardTitle className="flex-1">{extension.name}</CardTitle>
        {props.showContextMenu && (
          <div>
            <ExtensionCardContextMenu extension={extension} />
          </div>
        )}
      </CardHeader>
      <CardContent className="text-muted-foreground flex-1">
        {extension.description} <br /><br />
        {extension.link && (
          <a
            href={extension.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline flex items-center"
          >
            Link to Sharepoint Page
            {/* Optional: Add an external link icon */}
            <ExternalLink className="ml-1 h-4 w-4" />
          </a>
        )}
      </CardContent>
      <CardFooter className="gap-1 content-stretch f">
        {props.showContextMenu && (
          <Button
            variant={"outline"}
            title="Show message"
            onClick={() => extensionStore.openAndUpdate(props.extension)}
          >
            <Pencil size={18} />
          </Button>
        )}

        <StartNewExtensionChat extension={extension} />
      </CardFooter>
    </Card>
  );
};
