"use client";
import { ChatInput } from "@/features/chat-page/chat-input/chat-input";
import { chatStore, useChat } from "@/features/chat-page/chat-store";
import { ChatLoading } from "@/features/ui/chat/chat-message-area/chat-loading";
import { ChatMessageArea } from "@/features/ui/chat/chat-message-area/chat-message-area";
import ChatMessageContainer from "@/features/ui/chat/chat-message-area/chat-message-container";
import ChatMessageContentArea from "@/features/ui/chat/chat-message-area/chat-message-content";
import { useChatScrollAnchor } from "@/features/ui/chat/chat-message-area/use-chat-scroll-anchor";
import { useSession } from "next-auth/react";
import { FC, useEffect, useRef, useState} from "react";
import { ExtensionModel } from "../extensions-page/extension-services/models";
import { ChatHeader } from "./chat-header/chat-header";
import { CreateChatThread} from "./chat-services/chat-thread-service";
import { CreateChatMessage } from "./chat-services/chat-message-service";
import { ChatRole } from "@/features/chat-page/chat-services/models";
import { UploadImageToStore, GetImageUrl } from "./chat-services/chat-image-service";
import {
  ChatDocumentModel,
  ChatMessageModel,
  ChatThreadModel,
} from "./chat-services/models";
import MessageContent from "./message-content";

interface ChatPageProps {
  messages: Array<ChatMessageModel>;
  chatThread: ChatThreadModel;
  chatDocuments: Array<ChatDocumentModel>;
  extensions: Array<ExtensionModel>;
}

export const ChatPage: FC<ChatPageProps> = (props) => {

  const { data: session } = useSession();
  const [currentThread, setCurrentThread] = useState<ChatThreadModel | null>(props.chatThread);

  useEffect(() => {
    chatStore.initChatSession({
      chatThread: props.chatThread,
      messages: props.messages,
      userName: session?.user?.name!,
    });
  }, [props.messages, session?.user?.name, props.chatThread]);

  const { messages, loading } = useChat();

  const current = useRef<HTMLDivElement>(null);

  useChatScrollAnchor({ ref: current });

  const handleSendMessage = async (messageContent: string, imageData?: Buffer | null, imageName?: string | null): Promise<void> => {
    let thread = currentThread;

    // If there's no valid chat thread, create a new one
    if (!thread || !thread.id) {
      const response = await CreateChatThread(); // Create a new thread
      if (response.status === "OK") {
        thread = response.response;
        setCurrentThread(thread);
        // Update the state/store with the new thread
        chatStore.updateCurrentThread(thread);
      } else {
        console.error("Failed to create chat thread:", response.errors);
        return;
      }
    }

    let multiModalImageUrl: string | undefined = undefined;

    // If there's image data, upload it
    if (imageData && imageName) {
        const uploadResponse = await UploadImageToStore(thread.id, imageName, imageData);
        if (uploadResponse.status === "OK") {
            multiModalImageUrl = GetImageUrl(thread.id, imageName); // Get the URL of the uploaded image
        } else {
            console.error("Failed to upload image:", uploadResponse.errors);
            return;
        }
    }


    // Create the new message associated with the current (or new) thread
    const messageResponse = await CreateChatMessage({
      name: session?.user?.name || "Unknown",
      role: "user", 
      content: messageContent,
      chatThreadId: thread.id,
      multiModalImage: multiModalImageUrl,
    });

    if (messageResponse.status !== "OK") {
      console.error("Failed to create message:", messageResponse.errors);
      return;
    }

    // Update the messages in the state/store
    chatStore.addMessageToThread(thread.id, messageResponse.response)
  };

  return (
    <main className="flex flex-1 relative flex-col">
      <ChatHeader
        chatThread={props.chatThread}
        chatDocuments={props.chatDocuments}
        extensions={props.extensions}
      />
      <ChatMessageContainer ref={current}>
        <ChatMessageContentArea>
          {messages.map((message) => {
            return (
              <ChatMessageArea
                key={message.id}
                profileName={message.name}
                role={message.role}
                onCopy={() => {
                  navigator.clipboard.writeText(message.content);
                }}
                profilePicture={
                  message.role === "assistant"
                    ? "/ai-icon.png"
                    : session?.user?.image
                }
              >
                <MessageContent message={message} />
              </ChatMessageArea>
            );
          })}
          {loading === "loading" && <ChatLoading />}
        </ChatMessageContentArea>
      </ChatMessageContainer>
      <ChatInput onSendMessage={handleSendMessage}/>
    </main>
  );
};
