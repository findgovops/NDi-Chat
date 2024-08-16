import { ChatPage } from "@/features/chat-page/chat-page";
import { FindAllExtensionForCurrentUser } from "@/features/extensions-page/extension-services/extension-service";
import { FindAllPersonaForCurrentUser } from "@/features/persona-page/persona-services/persona-service";
import { FindAllChatMessagesForCurrentUser } from "@/features/chat-page/chat-services/chat-message-service";
import { DisplayError } from "@/features/ui/error/display-error";
import { ServerActionResponse } from "@/features/common/server-action-response";
import { FindAllChatThreadForCurrentUser } from "@/features/chat-page/chat-services/chat-thread-service";
import { ChatMessageModel } from "@/features/chat-page/chat-services/models";
import { ChatDocumentModel } from "@/features/chat-page/chat-services/models";
import { FindAllChatDocuments } from "@/features/chat-page/chat-services/chat-document-service";
import { ChatThreadModel } from "@/features/chat-page/chat-services/models";
import { CHAT_THREAD_ATTRIBUTE } from "@/features/chat-page/chat-services/models";


export default async function Home() {
  const [personaResponse, extensionResponse, chatThreadsResponse] = await Promise.all([
    FindAllPersonaForCurrentUser(),
    FindAllExtensionForCurrentUser(),
    FindAllChatThreadForCurrentUser()
 
  ]);

  if (personaResponse.status !== "OK") {
    return <DisplayError errors={personaResponse.errors} />;
  }

  if (extensionResponse.status !== "OK") {
    return <DisplayError errors={extensionResponse.errors} />;
  }

  if (chatThreadsResponse.status !== "OK") {
    return <DisplayError errors={chatThreadsResponse.errors} />;
  }
  
  

  let lastActiveThread = null;
  let messageResponse: ServerActionResponse<ChatMessageModel[]>;  // Default to empty messages
  let documentResponse: ServerActionResponse<ChatDocumentModel[]>;

  if (chatThreadsResponse.response.length > 0) {
    // Get the last active thread (first in the list)
    lastActiveThread = chatThreadsResponse.response[0];

    // Fetch messages for the last active thread
    messageResponse = await FindAllChatMessagesForCurrentUser(lastActiveThread.id);
    documentResponse = await FindAllChatDocuments(lastActiveThread.id)
    

    if (messageResponse.status !== "OK") {
      return <DisplayError errors={messageResponse.errors} />;
    }

    if (documentResponse.status !== "OK") {
      return <DisplayError errors={documentResponse.errors} />;
    }
  }else {
    // If no threads are found, set a default empty response
    messageResponse = { status: "OK", response: [] };
    documentResponse = { status: "OK", response: [] };
  }

  const defaultChatThread: ChatThreadModel = {
    // Populate with default values that satisfy ChatThreadModel
    id: "",
    name: "",
    createdAt: new Date(),
    lastMessageAt: new Date(),
    userId: "",
    useName: "",
    isDeleted: false ,
    bookmarked: false,
    personaMessage: "",
    personaMessageTitle: "",
    extension: [],
    type: CHAT_THREAD_ATTRIBUTE,
  };

  
  return (
    <ChatPage
      messages={messageResponse.response}
      chatThread={lastActiveThread || defaultChatThread}
      chatDocuments={documentResponse.response}
      extensions={extensionResponse.response}
    />
  );
}
