// guidance-page.tsx

import { ReactElement } from "react";
import { GuidanceHero } from "./guidance-hero/guidance-hero";
import { ScrollArea } from "@radix-ui/react-scroll-area";


const GuidancePage = async (): Promise<ReactElement> => {
  const documentUrl = "https://59c573de354093bc651d3b14a0a25ec0.cdn.bubble.io/f1727455946076x361973318464588350/NDi%20ChatGPT%20Guidebook.pdf"; // Replace with your actual PDF URL

  // Optional: Validate the URL format
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  if (!isValidUrl(documentUrl)) {
    return (
      <ScrollArea className="flex-1">
        <main className="flex flex-1 flex-col">
          <GuidanceHero />
          <div className="container max-w-4xl py-3">
            <p className="text-red-500">Invalid document URL provided.</p>
          </div>
        </main>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <main className="flex flex-1 flex-col">
        <GuidanceHero />
        <div className="container max-w-4xl py-3 h-screen">
          {/* Embed PDF Document */}
          <div className="pdf-embed-container h-full w-full">
            <embed
              src={documentUrl}
              type="application/pdf"
              className="w-full h-full"
              title="Guidance Document"
            />
            {/* Fallback Link */}
            <p className="mt-2 text-center">
              It appears you don't have a PDF plugin for this browser. You can
              <a href={documentUrl} className="text-blue-500 underline ml-1">
                click here to download the PDF file.
              </a>
            </p>
          </div>
        </div>
      </main>
    </ScrollArea>
  );
};

export default GuidancePage;