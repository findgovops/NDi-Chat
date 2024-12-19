"use client";

import { FC } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { useSession } from "next-auth/react";
import { PersonaCardContextMenu } from "./persona-card-context-menu";
import { StartNewPersonaChat } from "./start-new-persona-chat";
import { ViewPersona } from "./persona-view";
import { PersonaModel } from "../persona-services/models";

interface Props {
  persona: PersonaModel;
  showContextMenu: boolean;
}

export const PersonaCard: FC<Props> = (props) => {
  const { persona, showContextMenu } = props;
  const { data: session } = useSession();

  return (
    <Card key={persona.id} className="flex flex-col">
      <CardHeader className="flex flex-row">
        <CardTitle className="flex-1">
          {persona.name}
          {/* Show assigned groups only if user is admin and there are assigned groups */}
          {session?.user?.isAdmin && persona.assignedGroups?.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Groups: {persona.assignedGroups.join(", ")}
            </div>
          )}
        </CardTitle>
        {showContextMenu && (
          <div>
            <PersonaCardContextMenu persona={persona} />
          </div>
        )}
      </CardHeader>
      <CardContent className="text-muted-foreground flex-1">
        {persona.description}
      </CardContent>
      <CardFooter className="gap-1 content-stretch f">
        {showContextMenu && <ViewPersona persona={persona} />}
        <StartNewPersonaChat persona={persona} />
      </CardFooter>
    </Card>
  );
};
