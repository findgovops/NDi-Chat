"use server";
import "server-only";

import { userHashedId } from "@/features/auth-page/helpers";
import { HistoryContainer } from "@/features/common/services/cosmos";

import { RevalidateCache } from "@/features/common/navigation-helpers";
import { ServerActionResponse } from "@/features/common/server-action-response";
import { DocumentIntelligenceInstance } from "@/features/common/services/document-intelligence";
import { uniqueId } from "@/features/common/util";
import { SqlQuerySpec } from "@azure/cosmos";
import { EnsureIndexIsCreated } from "./azure-ai-search/azure-ai-search";
import { CHAT_DOCUMENT_ATTRIBUTE, ChatDocumentModel } from "./models";
import ExcelJS from 'exceljs';
import officeParser from 'officeparser';

const MAX_UPLOAD_DOCUMENT_SIZE: number = 20000000;
const CHUNK_SIZE = 8000; // Updated chunk size
const CHUNK_OVERLAP = Math.floor(CHUNK_SIZE * 0.25);

// Sanitize content function
function sanitizeContent(content: string): string {
  return content.replace(/[\x00-\x1F\x7F-\x9F]/g, "");
}

export const CrackDocument = async (
  formData: FormData
): Promise<ServerActionResponse<string[]>> => {
  try {
    const response = await EnsureIndexIsCreated();
    if (response.status === "OK") {
      const fileResponse = await LoadFile(formData);
      if (fileResponse.status === "OK") {
        const sanitizedContent = sanitizeContent(fileResponse.response.join("\n"));
        const splitDocuments = await ChunkDocumentWithOverlap(sanitizedContent);

        return {
          status: "OK",
          response: splitDocuments,
        };
      }

      return fileResponse;
    }

    return response;
  } catch (e) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `${e}`,
        },
      ],
    };
  }
};

const LoadFile = async (
  formData: FormData
): Promise<ServerActionResponse<string[]>> => {
  try {
    const file: File | null = formData.get("file") as unknown as File;

    const fileSize = process.env.MAX_UPLOAD_DOCUMENT_SIZE
      ? Number(process.env.MAX_UPLOAD_DOCUMENT_SIZE)
      : MAX_UPLOAD_DOCUMENT_SIZE;

    if (file && file.size < fileSize) {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      const docs: Array<string> = [];

      if (fileExtension === "xlsx") {
        // Handle Excel files using exceljs library
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const workbook = new ExcelJS.Workbook();

        await workbook.xlsx.load(buffer);

        // Iterate over all sheets
        workbook.eachSheet((worksheet) => {
          let sheetText = "";

          // Iterate over all rows in the sheet
          worksheet.eachRow((row: ExcelJS.Row) => {
            const values = row.values as ExcelJS.CellValue[];
            const rowValues = values.slice(1).map((cell: ExcelJS.CellValue) => {
              if (cell === null || cell === undefined) {
                return "";
              } else if (typeof cell === "object") {
                if ("formula" in cell) {
                  return cell.result !== undefined && cell.result !== null
                    ? String(cell.result)
                    : "";
                } else if ("text" in cell) {
                  return cell.text;
                } else {
                  return JSON.stringify(cell);
                }
              } else {
                return String(cell);
              }
            });

            sheetText += rowValues.join("\t") + "\n";
          });

          docs.push(sheetText);
        });
      } else if (fileExtension === "csv") {
        // Handle CSV files
        const arrayBuffer = await file.arrayBuffer();
        const decoder = new TextDecoder("utf-8");
        const text = decoder.decode(arrayBuffer);
        docs.push(text);
      } else if (fileExtension === "pptx") {
        // Handle PowerPoint files using officeparser
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const content = await officeParser.parseOfficeAsync(buffer);
        docs.push(content);
      } else {
        // Handle other file types using Azure Form Recognizer
        const client = DocumentIntelligenceInstance();
        const blob = new Blob([file], { type: file.type });

        const poller = await client.beginAnalyzeDocument(
          "prebuilt-read",
          await blob.arrayBuffer()
        );
        const { paragraphs } = await poller.pollUntilDone();

        if (paragraphs) {
          for (const paragraph of paragraphs) {
            docs.push(paragraph.content);
          }
        }
      }

      return {
        status: "OK",
        response: docs,
      };
    } else {
      return {
        status: "ERROR",
        errors: [
          {
            message: `File is too large and must be less than ${MAX_UPLOAD_DOCUMENT_SIZE} bytes.`,
          },
        ],
      };
    }
  } catch (e: any) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `Error processing file: ${e.message}`,
        },
      ],
    };
  }
};





export const FindAllChatDocuments = async (
  chatThreadID: string
): Promise<ServerActionResponse<ChatDocumentModel[]>> => {
  try {
    const querySpec: SqlQuerySpec = {
      query:
        "SELECT * FROM root r WHERE r.type=@type AND r.chatThreadId = @threadId AND r.isDeleted=@isDeleted",
      parameters: [
        {
          name: "@type",
          value: CHAT_DOCUMENT_ATTRIBUTE,
        },
        {
          name: "@threadId",
          value: chatThreadID,
        },
        {
          name: "@isDeleted",
          value: false,
        },
      ],
    };

    const { resources } = await HistoryContainer()
      .items.query<ChatDocumentModel>(querySpec)
      .fetchAll();

    if (resources) {
      return {
        status: "OK",
        response: resources,
      };
    } else {
      return {
        status: "ERROR",
        errors: [
          {
            message: "No documents found",
          },
        ],
      };
    }
  } catch (e) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `${e}`,
        },
      ],
    };
  }
};

export const CreateChatDocument = async (
  fileName: string,
  chatThreadID: string
): Promise<ServerActionResponse<ChatDocumentModel>> => {
  try {
    const modelToSave: ChatDocumentModel = {
      chatThreadId: chatThreadID,
      id: uniqueId(),
      userId: await userHashedId(),
      createdAt: new Date(),
      type: CHAT_DOCUMENT_ATTRIBUTE,
      isDeleted: false,
      name: fileName,
    };

    const { resource } =
      await HistoryContainer().items.upsert<ChatDocumentModel>(modelToSave);
    RevalidateCache({
      page: "chat",
      params: chatThreadID,
    });

    if (resource) {
      return {
        status: "OK",
        response: resource,
      };
    }

    return {
      status: "ERROR",
      errors: [
        {
          message: "Unable to save chat document",
        },
      ],
    };
  } catch (e) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `${e}`,
        },
      ],
    };
  }
};

export async function ChunkDocumentWithOverlap(
  document: string
): Promise<string[]> {
  const chunks: string[] = [];

  if (document.length <= CHUNK_SIZE) {
    // If the document is smaller than the desired chunk size, return it as a single chunk.
    chunks.push(document);
    return chunks;
  }

  let startIndex = 0;

  // Split the document into chunks of the desired size, with overlap.
  while (startIndex < document.length) {
    const endIndex = startIndex + CHUNK_SIZE;
    const chunk = document.substring(startIndex, endIndex);
    chunks.push(chunk);
    startIndex = endIndex - CHUNK_OVERLAP;
  }

  return chunks;
}
