// ai-search-issues.tsx
import React, { useState, useEffect, ChangeEvent } from 'react';
import { uniqueId } from '@/features/common/util';
import { HeroButton } from '@/features/ui/hero';
import { PaintBucket } from 'lucide-react';
import { ExtensionModel } from '../extension-services/models';
import { extensionStore } from '../extension-store';
import { useSession } from 'next-auth/react'; 

// Import necessary UI components
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '../../ui/card';
import { Button } from '@/features/ui/button';

// Import the function to get available groups
import { getAvailableGroups } from '@/features/access-page/group-service';
import { useRouter } from 'next/navigation';

export const AISearch: React.FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [indexSearch, setIndexSearch] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [groups, setGroups] = useState<Array<{ id: string; displayName: string }>>([]);
  const { data: session } = useSession(); // Get session data

  // Fetch groups when the component mounts
  useEffect(() => {
    const fetchGroups = async () => {
      if (session?.accessToken) {
        const availableGroups = await getAvailableGroups(session.accessToken);
        setGroups(availableGroups);
      } else {
        console.error('No access token available');
      }
    };
    fetchGroups();
  }, [session]);

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

  const handleGroupChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedGroup(e.target.value);
  };

  const newExample = () => {
    if (!name || !apiKey || !indexSearch || !selectedGroup) {
      alert('Please fill in all fields.');
      return;
    }

    const aiSearchExample: ExtensionModel = {
      createdAt: new Date(),
      description: 'NDiGPT AI Bucket',
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
          value: 'ndichatenvsearchqkl6lyswcexbe',
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
      assignedGroups: [selectedGroup], 
      
    };

    extensionStore.openAndUpdate(aiSearchExample);
    setIsOpen(false);
    // Reset form fields
    setName('');
    setApiKey('');
    setIndexSearch('');
    setSelectedGroup('');
    router.push(`/extensions/new?assignedGroupId=${selectedGroup}`);
  };

  return (
    <>
      <HeroButton
        title="NDiGPT Bucket"
        description="Bring your own NDiGPT Search"
        icon={<PaintBucket />}
        onClick={() => setIsOpen(true)}
      />
      {isOpen && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Enter Bucket Details</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Existing form fields */}
            <div className="mb-4">
              <label className="block font-medium mb-1">Bucket Name</label>
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1">API</label>
              <input
                type="text"
                value={apiKey}
                onChange={handleApiKeyChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1">Index</label>
              <input
                type="text"
                value={indexSearch}
                onChange={handleIndexSearchChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            {/* New dropdown for group selection */}
            <div className="mb-4">
              <label className="block font-medium mb-1">Assign to Group</label>
              <select
                name="assignedGroups"
                multiple
                value={selectedGroup}
                onChange={handleGroupChange}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="" disabled>
                  Select a group
                </option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.displayName}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              className="bg-[#07b0e8] hover:bg-[#07b0e8]/90"
              onClick={newExample}
            >
              OK
            </Button>
            <Button
              className="border border-input bg-[#07b0e8] hover:bg-[#07b0e8]/90"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
          </CardFooter>
        </Card>
      )}
    </>
  );
};