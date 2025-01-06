"use client";
import { FC } from "react";
import { CitationSlider } from "./citation-slider";
import { ExtensionModel } from "@/features/extensions-page/extension-services/models";

interface SingleCitation {
  name: string;
  id: string;
}

interface Props {
  items: SingleCitation[];
  extensions: ExtensionModel[];
}

export const citation = {
  render: "Citation",
  selfClosing: true,
  attributes: {
    items: { type: Array },
    extensions: { type: Array },
  },
};

export const Citation: FC<Props> = ({ items, extensions }) => {
  // Group citations by name, if you want to organize them
  const citationsByName = items.reduce((acc, citation) => {
    if (!acc[citation.name]) acc[citation.name] = [];
    acc[citation.name].push(citation);
    return acc;
  }, {} as Record<string, SingleCitation[]>);

  return (
    <div className="interactive-citation p-4 border mt-4 flex flex-col rounded-md gap-2">
      {Object.entries(citationsByName).map(([citationName, citations], idx) => (
        <div key={idx} className="flex flex-col gap-2">
          <div className="font-semibold text-sm">{citationName}</div>
          <div className="flex gap-2">
            {citations.map((citationObj, i) => (
              <div key={i}>
                {/* In practice, you might filter or find the matching extension
                    if 'name' matches. Right now, we just show *all* extensions
                    for each citation. */}
                {extensions?.map((extension) => (
                  <CitationSlider
                    key={extension.id}
                    id={extension.id}
                    name={extension.name}
                    index={i}
                    sourceUrl={extension.link}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
