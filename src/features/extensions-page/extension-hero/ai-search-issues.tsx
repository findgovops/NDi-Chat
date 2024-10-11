// AISearch.tsx
import React, { useState, ChangeEvent } from 'react';
import { uniqueId } from '@/features/common/util';
import { HeroButton } from '@/features/ui/hero';
import { FileSearch } from 'lucide-react';
import { ExtensionModel } from '../extension-services/models';
import { extensionStore } from '../extension-store';

// Import necessary UI components
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../ui/card';
import { Button } from '@/features/ui/button';

export const AISearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [indexSearch, setIndexSearch] = useState<string>('');

  // Event handlers
  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleApiKeyChange = (e: ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
  };

  const handleIndexSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIndexSearch(e.target.value);
  };

  const newExample = () => {
    if (!name || !apiKey || !indexSearch) {
      alert('Please fill in all fields.');
      return;
    }

    const aiSearchExample: ExtensionModel = {
      createdAt: new Date(),
      description: 'NDiGPT AI Search',
      id: '',
      name: name,
      executionSteps: `You are an expert in searching internal documents using aisearch function. You must always include a citation at the end of your answer and don't include a full stop after the citations. Use the format for your citation {% citation items=[{name:\\"filename 1\\",id:\\"file id\\"}, {name:\\"filename 2\\",id:\\"file id\\"}] /%}`,
      functions: [
        {
          code: `{
    "name": "aisearch",
    "parameters": {
      "type": "object",
      "properties": {
        "body": {
          "type": "object",
          "description": "Body of search for relevant information",
          "properties": {
            "search": {
              "type": "string",
              "description": "The exact search value from the user"
            }
          },
          "required": ["search"]
        }
      },
      "required": ["body"]
    },
    "description": "You must use this to search for content based on user questions."
    }`,
          endpoint: `https://ndichatenvsearchqkl6lyswcexbe.search.windows.net/indexes/${indexSearch}/docs/search?api-version=2024-07-01`,
          id: uniqueId(),
          endpointType: 'POST',
          isOpen: false,
        },
      ],
      headers: [
        {
          id: uniqueId(),
          key: 'vectors',
          value: 'chunk_id, parent_id, chunk, title, text_vector',
        },
        {
          id: uniqueId(),
          key: 'api-Key',
          value: apiKey,
        },
        {
          id: uniqueId(),
          key: 'searchName',
          value: name,
        },
        {
          id: uniqueId(),
          key: 'indexName',
          value: indexSearch,
        },
        {
          id: uniqueId(),
          key: 'Content-Type',
          value: 'application/json',
        },
      ],
      isPublished: false,
      type: 'EXTENSION',
      userId: '',
    };

    extensionStore.openAndUpdate(aiSearchExample);
    setIsOpen(false);
    // Reset form fields
    setName('');
    setApiKey('');
    setIndexSearch('');
  };

  return (
    <>
      <HeroButton
        title="NDiGPT Search"
        description="Bring your own NDiGPT Search"
        icon={<FileSearch />}
        onClick={() => setIsOpen(true)}
      />
      {isOpen && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Enter Search Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <label className="block font-medium mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1">api-Key</label>
              <input
                type="text"
                value={apiKey}
                onChange={handleApiKeyChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1">indexName</label>
              <input
                type="text"
                value={indexSearch}
                onChange={handleIndexSearchChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button className="border border-input bg-[#07b0e8] hover:bg-[#07b0e8]/90 "  onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-[#07b0e8] hover:bg-[#07b0e8]/90" onClick={newExample}>
              OK
            </Button>
          </CardFooter>
        </Card>
      )}
    </>
  );
};
