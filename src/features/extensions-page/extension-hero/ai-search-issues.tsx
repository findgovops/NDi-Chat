import { useState } from 'react';
import { uniqueId } from "@/features/common/util";
import { HeroButton } from "@/features/ui/hero";
import { FileSearch } from "lucide-react";
import { ExtensionModel } from "../extension-services/models";
import { extensionStore } from "../extension-store";
// Import your UI components for Modal, Input, and Button
import { Button } from '@/features/ui/button';
import { Input } from '@/features/ui/input';
import { Modal } from '@/features/ui/modal';

export const AISearch = () => {
  // State variables for modal visibility and form inputs
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [indexSearch, setIndexSearch] = useState('');

  // Function to handle the creation of a new example with user input
  const newExample = () => {
    const aiSearchExample: ExtensionModel = {
      createdAt: new Date(),
      description: "NDiGPT AI Search",
      id: "",
      name: name, // Use the Name from input
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
          endpoint: `searchUrl.windows.net/indexes/${indexSearch}/docs/search?api-version=2024-07-01`, // Use indexSearch from input
          id: uniqueId(),
          endpointType: "POST",
          isOpen: false,
        },
      ],
      headers: [
        {
          id: uniqueId(),
          key: "vectors",
          value: "chunk_id, parent_id, chunk, title, text_vector",
        },
        {
          id: uniqueId(),
          key: "api-Key",
          value: apiKey, // Use apiKey from input
        },
        {
          id: uniqueId(),
          key: "searchName",
          value: name, // Use Name from input
        },
        {
          id: uniqueId(),
          key: "indexName",
          value: indexSearch, // Use indexSearch from input
        },
        {
          id: uniqueId(),
          key: "Content-Type",
          value: "application/json",
        },
      ],
      isPublished: false,
      type: "EXTENSION",
      userId: "",
    };

    // Update the extension store with the new example
    extensionStore.openAndUpdate(aiSearchExample);
    // Close the modal after submission
    setModalOpen(false);
  };

  // Function to open the modal when the HeroButton is clicked
  const handleClick = () => {
    setModalOpen(true);
  };

  return (
    <>
      <HeroButton
        title="NDiGPT Search"
        description="Bring your own NDiGPT Search"
        icon={<FileSearch />}
        onClick={handleClick}
      />
      {modalOpen && (
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
          <h2>Enter Search Details</h2>
          <div>
            <label>Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label>api-Key</label>
            <Input value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
          </div>
          <div>
            <label>indexSearch</label>
            <Input value={indexSearch} onChange={(e) => setIndexSearch(e.target.value)} />
          </div>
          <Button onClick={newExample}>OK</Button>
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
        </Modal>
      )}
    </>
  );
};
