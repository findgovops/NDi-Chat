// chat-input.tsx

"use client";

import {
  ResetInputRows,
  onKeyDown,
  onKeyUp,
  useChatInputDynamicHeight,
} from "@/features/chat-page/chat-input/use-chat-input-dynamic-height";

import AttachFile from "@/features/ui/chat/chat-input-area/attach-file"; // Ensure correct import path
import {
  ChatInputActionArea,
  ChatInputForm,
  ChatInputPrimaryActionArea,
  ChatInputSecondaryActionArea,
} from "@/features/ui/chat/chat-input-area/chat-input-area";
import { ChatTextInput } from "@/features/ui/chat/chat-input-area/chat-text-input";
import { ImageInput } from "@/features/ui/chat/chat-input-area/image-input";
import { Microphone } from "@/features/ui/chat/chat-input-area/microphone";
import { StopChat } from "@/features/ui/chat/chat-input-area/stop-chat";
import { SubmitChat } from "@/features/ui/chat/chat-input-area/submit-chat";
import React, { useEffect, useRef, useState } from "react";
import { chatStore, useChat } from "../chat-store";
import { useFileStore } from "../chat-input/file/file-store"; 
import { PromptSlider } from "./prompt/prompt-slider";
import {
  speechToTextStore,
  useSpeechToText,
} from "./speech/use-speech-to-text";
import {
  textToSpeechStore,
  useTextToSpeech,
} from "./speech/use-text-to-speech";

interface ChatInputProps {
  onSendMessage: (
    messageContent: string,
    imageData?: Buffer | null,
    imageName?: string | null
  ) => Promise<void>;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const { loading, input, chatThreadId } = useChat();

  // **Pass chatThreadId to useFileStore**
  const { uploadButtonLabel, uploadedFiles, onFileChange } = useFileStore(chatThreadId);

  const { isPlaying } = useTextToSpeech();
  const { isMicrophoneReady } = useSpeechToText();
  const { rows } = useChatInputDynamicHeight();

  const [imageData, setImageData] = useState<Buffer | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);

  const submitButton = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // **Reset uploaded files when a new chat is started**
  useEffect(() => {
    // Reset uploaded files for the new chat
    // Assuming that a new chatThreadId indicates a new chat
    //fileStore.resetUploads(chatThreadId);
  }, [chatThreadId]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      await chatStore.submitChat(e.currentTarget, imageData, imageName);
      chatStore.updateInput(""); // Clear the input field after sending
      ResetInputRows(); // Reset input rows
      setImageData(null); // Clear the image data after sending
      setImageName(null); // Clear the image name after sending
    }
  };

  return (
    <ChatInputForm
      ref={formRef}
      onSubmit={submit}
      status={uploadButtonLabel}
    >
      <ChatTextInput
        onBlur={(e) => {
          if (e.currentTarget.value.replace(/\s/g, "").length === 0) {
            ResetInputRows();
          }
        }}
        onKeyDown={(e) => {
          onKeyDown(e, () => formRef.current?.requestSubmit());
        }}
        onKeyUp={(e) => {
          onKeyUp(e);
        }}
        value={input}
        rows={rows}
        onChange={(e) => {
          chatStore.updateInput(e.currentTarget.value);
        }}
      />
      <ChatInputActionArea>
        <ChatInputSecondaryActionArea>
          {/* **Pass the onFileChange function to AttachFile** */}
          <AttachFile onFileChange={onFileChange} />
          <PromptSlider />
        </ChatInputSecondaryActionArea>
        <ChatInputPrimaryActionArea>
          <ImageInput />
          {/* <Microphone
            startRecognition={() => speechToTextStore.startRecognition()}
            stopRecognition={() => speechToTextStore.stopRecognition()}
            isPlaying={isPlaying}
            stopPlaying={() => textToSpeechStore.stopPlaying()}
            isMicrophoneReady={isMicrophoneReady}
          /> */}
          {loading === "loading" ? (
            <StopChat stop={() => chatStore.stopGeneratingMessages()} />
          ) : (
            <SubmitChat ref={submitButton} />
          )}
        </ChatInputPrimaryActionArea>
      </ChatInputActionArea>
    </ChatInputForm>
  );
};
