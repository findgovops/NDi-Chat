"use client";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/ui/sheet";
import { useSession } from "next-auth/react";
import { ChangeEvent, FC, useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { ServerActionResponse } from "../common/server-action-response";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { LoadingIndicator } from "../ui/loading";
import { ScrollArea } from "../ui/scroll-area";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import { addOrUpdatePrompt, promptStore, usePromptState } from "./prompt-store";
import { getAvailableGroups } from "../access-page/group-service";

interface SliderProps {}

export const AddPromptSlider: FC<SliderProps> = (props) => {
  const initialState: ServerActionResponse | undefined = undefined;

  const { isOpened, prompt } = usePromptState();

  const [formState, formAction] = useFormState(addOrUpdatePrompt, initialState);


  const { data } = useSession();

  const [groups, setGroups] = useState<Array<{ id: string; displayName: string }>>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]); 

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

  const handleGroupChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const selected: string[] = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setSelectedGroups(selected);
  };

  const PublicSwitch = () => {
    if (data === undefined || data === null) return null;

    if (data?.user?.isAdmin) {
      return (
        <div className="flex items-center space-x-2">
          <Switch name="isPublished" defaultChecked={prompt.isPublished} />
          <Label htmlFor="description">Publish</Label>
        </div>
      );
    }
  };

  return (
    <Sheet
      open={isOpened}
      onOpenChange={(value) => {
        promptStore.updateOpened(value);
      }}
    >
      <SheetContent className="min-w-[480px] sm:w-[540px] flex flex-col">
        <SheetHeader>
          <SheetTitle>Persona</SheetTitle>
        </SheetHeader>
        <form action={formAction} className="flex-1 flex flex-col">
          <ScrollArea
            className="flex-1 -mx-6 flex max-h-[calc(100vh-140px)]"
            type="always"
          >
            <div className="pb-6 px-6 flex gap-8 flex-col  flex-1">
              <input type="hidden" name="id" defaultValue={prompt.id} />
              {formState && formState.status === "OK" ? null : (
                <>
                  {formState &&
                    formState.errors.map((error, index) => (
                      <div key={index} className="text-red-500">
                        {error.message}
                      </div>
                    ))}
                </>
              )}
              <div className="grid gap-2">
                <Label>Name</Label>
                <Input
                  type="text"
                  required
                  name="name"
                  defaultValue={prompt.name}
                  placeholder="Name of the prompt"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Short description</Label>
                <Textarea
                  required
                  defaultValue={prompt.description}
                  name="description"
                  className="h-96"
                  placeholder="eg: Write a funny joke that a 5 year old would understand"
                />
                {data?.user?.isAdmin && (
                  <>
                <label className="block font-medium mb-1">Assign to Group(s)</label>
                <select
                  name="assignedGroups"
                  multiple
                  value={selectedGroups}
                  onChange={handleGroupChange}
                  className="w-full px-3 py-2 border rounded"
                >
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.displayName}
                    </option>
                  ))}
                </select>
                </>
                )}
              </div>
            </div>
          </ScrollArea>
          <SheetFooter className="py-2 flex sm:justify-between flex-row">
            <PublicSwitch /> <Submit />
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

function Submit() {
  const status = useFormStatus();
  return (
    <Button disabled={status.pending} className="gap-2 bg-[#07b0e8] hover:bg-[#07b0e8]/90">
      <LoadingIndicator isLoading={status.pending} />
      Save
    </Button>
  );
}
