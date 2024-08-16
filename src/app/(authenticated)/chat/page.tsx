import { ChatPage } from "@/features/chat-page/chat-page";
import { FindAllExtensionForCurrentUser } from "@/features/extensions-page/extension-services/extension-service";
import { FindAllPersonaForCurrentUser } from "@/features/persona-page/persona-services/persona-service";
import { FindAllChatMessagesForCurrentUser } from "@/features/chat-page/chat-services/chat-message-service";
import { CreateChatMessage } from "@/features/chat-page/chat-services/chat-message-service";
import { DisplayError } from "@/features/ui/error/display-error";
import chatMessageContainer from "@/features/ui/chat/chat-message-area/chat-message-container";
import chatMessageContent from "@/features/ui/chat/chat-message-area/chat-message-content";
import { chatStore } from "@/features/chat-page/chat-store";
import { ChatMessageArea } from "@/features/ui/chat/chat-message-area/chat-message-area";
import { FindAllChatThreadForCurrentUser } from "@/features/chat-page/chat-services/chat-thread-service";
import { FindAllChatDocuments } from "@/features/chat-page/chat-services/chat-document-service";

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

  // Get the last active thread (first in the list)
  const lastActiveThread = chatThreadsResponse.response[0]

  // Fetch messages for the last active thread
  const messageResponse = await FindAllChatMessagesForCurrentUser(lastActiveThread.id);
  const documentResponse = await FindAllChatDocuments(lastActiveThread.id)

  if (messageResponse.status !== "OK") {
    return <DisplayError errors={messageResponse.errors} />;
  }

  if (documentResponse.status !== "OK") {
    return <DisplayError errors={documentResponse.errors} />;
  }
  return (
    <ChatPage
      messages={messageResponse.response}
      chatThread={lastActiveThread}
      chatDocuments={documentResponse.response}
      extensions={extensionResponse.response}
    />
  );
}
