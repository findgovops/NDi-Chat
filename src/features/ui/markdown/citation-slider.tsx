// citation-slider.tsx

import { Button } from "@/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/ui/sheet";
import { FC } from "react";
import { useFormState } from "react-dom";
import { ScrollArea } from "../scroll-area";
import { useMarkdownContext } from "./markdown-context";

interface SliderProps {
  name: string;
  index: number;
  id: string;
  sourceUrl: string; // We'll place this in the sheet footer
}

export const CitationSlider: FC<SliderProps> = (props) => {
  const { onCitationClick } = useMarkdownContext();
  if (!onCitationClick) throw new Error("onCitationClick is null");

  const [node, formAction] = useFormState(onCitationClick, null);

  return (
    <form>
      <input type="hidden" name="id" value={props.id} />
      <Sheet>
        <SheetTrigger asChild>
          {/* The user clicks this button to open the sheet */}
          <Button
            variant="outline"
            size="sm"
            formAction={formAction}
            type="submit"
            className="mr-2"
          >
            {props.name || `Citation #${props.index + 1}`}
          </Button>
        </SheetTrigger>
        <SheetContent className="min-w-[480px] sm:w-[540px] flex flex-col">
          <SheetHeader>
            <SheetTitle>{props.name}</SheetTitle>
          </SheetHeader>
          <ScrollArea className="flex-1 flex -mx-6">
            <div className="px-6 whitespace-pre-wrap">{node}</div>
          </ScrollArea>
          <SheetFooter>
            {props.sourceUrl && (
              <a
                href={props.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-600 text-sm"
              >
                View Source
              </a>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </form>
  );
};
