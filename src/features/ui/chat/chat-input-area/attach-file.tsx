// AttachFile.tsx

import { Paperclip } from "lucide-react";
import { useRef } from "react";
import { Button } from "../../button";
import { showError } from "@/features/globals/global-message-store";

interface AttachFileProps {
  onFileChange: (formData: FormData) => void;
}

const AttachFile: React.FC<AttachFileProps> = ({ onFileChange }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleClick = () => {
    // Trigger the file input click event
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return; // No files selected

    const fileArray = Array.from(files);
    if (fileArray.length === 0) return; // No files selected

    if (fileArray.length > 10) {
      showError("You can only upload up to 10 files.");
      return;
    }

    const formData = new FormData();
    fileArray.forEach((file) => {
      formData.append("files", file);
    });

    onFileChange(formData);
    event.target.value = ""; // Clear the input after handling the files
  };

  return (
    <>
      <Button
        size="icon"
        variant={"ghost"}
        onClick={handleClick}
        type="button"
        aria-label="Attach file to chat"
      >
        <Paperclip size={16} />
      </Button>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
        multiple // Allow multiple file selection
        accept=".pdf,.doc,.docx,.txt,.jpg,.png,.pptx,.xlsx,.csv" // Include PowerPoint and Excel file types
      />
    </>
  );
};

export default AttachFile;