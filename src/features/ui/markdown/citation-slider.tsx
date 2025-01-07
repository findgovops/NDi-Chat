import { Button } from "@/ui/button";
import {
  Sheet,
  SheetContent,
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
  sourceUrl: string;
}

export const CitationSlider: FC<SliderProps> = (props) => {
  const { onCitationClick } = useMarkdownContext();

  if (!onCitationClick) throw new Error("onCitationClick is null");

  const [node, formAction] = useFormState(onCitationClick, null);
  
  console.log("CitationSlider =>", props.name, props.sourceUrl);

  return (
    <a
      href={props.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: "blue", textDecoration: "underline" }}
    >
      {props.name}
    </a>
  );
  
};
