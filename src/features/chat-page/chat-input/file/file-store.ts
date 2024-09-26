// file-store.ts

"use client";

import { ServerActionResponse } from "@/features/common/server-action-response";
import {
  showError,
  showSuccess,
} from "@/features/globals/global-message-store";
import { proxy, useSnapshot } from "valtio";
import { IndexDocuments } from "../../chat-services/azure-ai-search/azure-ai-search";
import {
  CrackDocument,
  CreateChatDocument,
} from "../../chat-services/chat-document-service";
import { chatStore } from "../../chat-store";

/**
 * Interface representing an uploaded file.
 */
interface UploadedFile {
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
}

/**
 * Interface representing the upload state per chat thread.
 */
interface ChatUploadState {
  uploadedFiles: UploadedFile[];
}

/**
 * FileStore class manages file uploads per chat thread.
 */
class FileStore {
  public uploadButtonLabel: string = "";
  public maxFilesPerChat: number = 10; // Maximum number of allowed uploads per chat

  /**
   * A mapping from chatThreadId to its corresponding upload state.
   */
  public chatUploads: Record<string, ChatUploadState> = {};

  /**
   * Retrieves the upload state for a given chatThreadId.
   * Initializes the state if it doesn't exist.
   * @param chatThreadId - The ID of the chat thread.
   */
  public getUploadState(chatThreadId: string): ChatUploadState {
    if (!this.chatUploads[chatThreadId]) {
      this.chatUploads[chatThreadId] = {
        uploadedFiles: [],
      };
    }
    return this.chatUploads[chatThreadId];
  }

  /**
   * Handles file changes from the file input.
   * @param props - Contains formData and chatThreadId.
   */
  public async onFileChange(props: {
    formData: FormData;
    chatThreadId: string;
  }) {
    const { formData, chatThreadId } = props;

    try {
      chatStore.updateLoading("file upload");

      const newFiles: File[] = Array.from(
        formData.getAll("files")
      ) as File[];

      const uploadState = this.getUploadState(chatThreadId);

      // **Enforce the total file limit per chat**
      if (uploadState.uploadedFiles.length + newFiles.length > this.maxFilesPerChat) {
        showError(
          `You can only upload up to ${this.maxFilesPerChat} files per chat. You have already uploaded ${uploadState.uploadedFiles.length} file(s).`
        );
        return;
      }

      for (const file of newFiles) {
        const singleFileFormData = new FormData();
        singleFileFormData.append("file", file);
        singleFileFormData.append("id", chatThreadId);

        this.uploadButtonLabel = `Processing ${file.name}`;
        const crackingResponse = await CrackDocument(singleFileFormData);

        if (crackingResponse.status === "OK") {
          let index = 0;

          const documentIndexResponses: Array<
            ServerActionResponse<boolean>
          > = [];

          for (const doc of crackingResponse.response) {
            this.uploadButtonLabel = `Indexing document [${index + 1}]/[${
              crackingResponse.response.length
            }]`;

            const indexResponses = await IndexDocuments(
              file.name,
              [doc],
              chatThreadId
            );

            documentIndexResponses.push(...indexResponses);
            index++;
          }

          const allDocumentsIndexed = documentIndexResponses.every(
            (r) => r.status === "OK"
          );

          if (allDocumentsIndexed) {
            this.uploadButtonLabel = `${file.name} loaded`;

            const response = await CreateChatDocument(file.name, chatThreadId);

            if (response.status === "OK") {
              // Add the successfully uploaded file to the chat's upload list
              uploadState.uploadedFiles.push({
                name: file.name,
                size: file.size,
                type: file.type,
                uploadDate: new Date(),
              });

              showSuccess({
                title: "File Upload",
                description: `${file.name} uploaded successfully.`,
              });
            } else {
              showError(response.errors.map((e) => e).join("\n"));
            }
          } else {
            const errors: Array<string> = [];

            documentIndexResponses.forEach((r) => {
              if (r.status === "ERROR") {
                errors.push(...r.errors.map((e) => e.message));
              }
            });

            showError(
              "Looks like not all documents were indexed.\n" +
                errors.join("\n")
            );
          }
        } else {
          showError(crackingResponse.errors.map((e) => e.message).join("\n"));
        }
      }
    } catch (error) {
      showError("" + error);
    } finally {
      this.uploadButtonLabel = "";
      chatStore.updateLoading("idle");
    }
  }

  /**
   * Resets the uploadedFiles list for a specific chat thread.
   * Useful when starting a new chat.
   * @param chatThreadId - The ID of the chat thread.
   */
  public resetUploads(chatThreadId: string) {
    if (this.chatUploads[chatThreadId]) {
      this.chatUploads[chatThreadId].uploadedFiles = [];
    }
  }
}

export const fileStore = proxy(new FileStore());

/**
 * Hook to access the file store's state for a specific chat thread.
 * @param chatThreadId - The ID of the chat thread.
 */
export function useFileStore(chatThreadId: string) {
  const snapshot = useSnapshot(fileStore);

  // Access the uploadedFiles via the snapshot
  const uploadState = snapshot.chatUploads[chatThreadId];
  const uploadedFiles = uploadState ? uploadState.uploadedFiles : [];
  const uploadButtonLabel = snapshot.uploadButtonLabel;

  return {
    uploadedFiles,
    uploadButtonLabel,
    onFileChange: (formData: FormData) =>
      fileStore.onFileChange({ formData, chatThreadId }),
  };
}