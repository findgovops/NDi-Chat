import { uniqueId } from "@/features/common/util";
import { HeroButton } from "@/features/ui/hero";
import { Globe } from "lucide-react";
import { ExtensionModel } from "../extension-services/models";
import { extensionStore } from "../extension-store";
import { ChangeEvent, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/features/ui/card";
import { Button } from "@/features/ui/button";

export const BingSearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [API, setApiKey] = useState<string>('');

  const handleApiKeyChange = (e: ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
  };

  const newExample = () => {
    if (!API) {
      alert('Please fill in the API field.');
      return;
    }
  
    const bingExample: ExtensionModel = {
      createdAt: new Date(),
      description: "Bring up to date information with Online Search",
      id: "",
      name: "Online Search",
      executionSteps: `You are an expert in searching the web using BingSearch function. `,
      functions: [
        {
          code: `{
"name": "BingSearch",
"parameters": {
  "type": "object",
  "properties": {
    "query": {
      "type": "object",
      "description": "Ues this as the search query parameters",
      "properties": {
        "BING_SEARCH_QUERY": {
          "type": "string",
          "description": "Search query from the user",
          "example": "What is the current weather in Sydney, Australia?"
        }
      },
      "example": {
        "BING_SEARCH_QUERY": "What is the current weather in Sydney, Australia?"
      },
      "required": ["BING_SEARCH_QUERY"]
    }
  },
  "required": ["query"]
},
"description": "Use BingSearch to search for information on the web to bring up to date information"
}
          `,
          endpoint:
            "https://api.bing.microsoft.com/v7.0/search?q=BING_SEARCH_QUERY",
          id: uniqueId(),
          endpointType: "GET",
          isOpen: false,
        },
      ],
      headers: [
        {
          id: uniqueId(),
          key: "Ocp-Apim-Subscription-Key",
          value: API,
        },
      ],
      isPublished: false,
      type: "EXTENSION",
      userId: "",
      assignedGroups: [],
      link: "",
    };

    extensionStore.openAndUpdate(bingExample);
    setIsOpen(false);
    setApiKey('');
  };

  return (
    <>
    <HeroButton
      title="Online Search"
      description="Bring up to date information with Online Search"
      icon={<Globe />}
      onClick={() => setIsOpen(true)}
    />
    {isOpen && (<Card className="mt-4">
      <CardHeader>
        <CardTitle>Enter Online Search Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <label className="block font-medium mb-1">API</label>
          <input
            type="text"
            value={API}
            onChange={handleApiKeyChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button className="bg-[#07b0e8] hover:bg-[#07b0e8]/90" onClick={newExample}>
          OK
        </Button>
        <Button className="border border-input bg-[#07b0e8] hover:bg-[#07b0e8]/90 "  onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
      </CardFooter>
    </Card>
  )}
  </>
  );
};
