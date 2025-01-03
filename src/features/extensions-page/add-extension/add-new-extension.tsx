"use client";

import { ServerActionResponse } from "@/features/common/server-action-response";
import { LoadingIndicator } from "@/features/ui/loading";
import { Textarea } from "@/features/ui/textarea";
import { useSession } from "next-auth/react";
import { ChangeEvent, FC, useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { ScrollArea } from "../../ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../../ui/sheet";
import { Switch } from "../../ui/switch";
import {
  AddOrUpdateExtension,
  extensionStore,
  useExtensionState,
} from "../extension-store";
import { AddFunction } from "./add-function";
import { EndpointHeader } from "./endpoint-header";
import { ErrorMessages } from "./error-messages";
import { getAvailableGroups } from "@/features/access-page/group-service";
import { useRouter } from "next/navigation";

interface Props {}

export const AddExtension: FC<Props> = (props) => {
  const { isOpened, extension } = useExtensionState();

  const { data } = useSession();
  const initialState: ServerActionResponse | undefined = undefined;

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

  const [formState, formAction] = useFormState(
    AddOrUpdateExtension,
    initialState
  );

  const PublicSwitch = () => {
    if (data === undefined || data === null) return null;

    if (data?.user?.isAdmin) {
      return (
        <div className="flex items-center space-x-2">
          <Switch name="isPublished" defaultChecked={extension.isPublished} />
          <Label htmlFor="description">Publish</Label>
        </div>
      );
    }
  };

  return (
    <Sheet
      open={isOpened}
      onOpenChange={(value) => {
        extensionStore.updateOpened(value);
      }}
    >
      <SheetContent className="min-w-[680px] flex flex-col">
        <SheetHeader>
          <SheetTitle>Extension</SheetTitle>
        </SheetHeader>
        <form action={formAction} className="flex-1 flex flex-col ">
          <ScrollArea
            className="h-full -mx-6 max-h-[calc(100vh-140px)]"
            type="always"
          >
            <div className="pb-6 px-6 flex gap-8 flex-col">
              <ErrorMessages />
              <input type="hidden" name="id" defaultValue={extension.id} />
              <div className="grid gap-2">
                <Label>Name</Label>
                <Input
                  type="text"
                  required
                  name="name"
                  defaultValue={extension.name}
                  placeholder="Name of your Extension"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Short description</Label>
                <Input
                  type="text"
                  required
                  defaultValue={extension.description}
                  name="description"
                  placeholder="Short description"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Detail description</Label>
                <Textarea
                  required
                  defaultValue={extension.executionSteps}
                  name="executionSteps"
                  placeholder="Describe specialties and the steps to execute the bucket"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Sharepoint link</Label>
                <Textarea
                  required
                  defaultValue={extension.link}
                  name="link"
                  placeholder="Sharepoint link for the bucket"
                />
              </div>
              <div className="mb-4">
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
              <EndpointHeader />
              <AddFunction />
            </div>
          </ScrollArea>
          <SheetFooter className="py-2 flex sm:justify-between flex-row">
            <PublicSwitch />
            <Submit />
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

function Submit() {
  const { isLoading } = useExtensionState();
  return (
    <Button disabled={isLoading} className="gap-2 bg-[#07b0e8] hover:bg-[#07b0e8]/90">
      <LoadingIndicator isLoading={isLoading} />
      Save
    </Button>
  );
}
