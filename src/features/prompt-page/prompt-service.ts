"use server";

import {
  ServerActionResponse,
  zodErrorsToServerActionErrors,
} from "@/features/common/server-action-response";
import {
  PROMPT_ATTRIBUTE,
  PromptModel,
  PromptModelSchema,
} from "@/features/prompt-page/models";
import { SqlQuerySpec } from "@azure/cosmos";
import { getCurrentUser, getCurrentUserGroups, userHashedId } from "../auth-page/helpers";
import { ConfigContainer } from "../common/services/cosmos";
import { uniqueId } from "../common/util";

export const CreatePrompt = async (
  props: PromptModel
): Promise<ServerActionResponse<PromptModel>> => {
  try {
    const user = await getCurrentUser();
    
    // 1) Return UNAUTHORIZED if NOT admin
    if (!user.isAdmin) {
      return {
        status: "UNAUTHORIZED",
        errors: [
          { message: "Only admins can create prompts" }
        ],
      };
    }

    // 2) Construct the model normally for admins
    const modelToSave: PromptModel = {
      id: uniqueId(),
      name: props.name,
      description: props.description,
      isPublished: props.isPublished, // let admin control publish
      userId: await userHashedId(),
      createdAt: new Date(),
      type: "PROMPT",
      assignedGroups: props.assignedGroups ?? [],
    };

    // 3) Validate and save as before
    const valid = ValidateSchema(modelToSave);
    if (valid.status !== "OK") return valid;

    const { resource } = await ConfigContainer().items.create<PromptModel>(
      modelToSave
    );

    if (resource) {
      return { status: "OK", response: resource };
    } else {
      return {
        status: "ERROR",
        errors: [{ message: "Error creating prompt" }],
      };
    }
  } catch (error) {
    return {
      status: "ERROR",
      errors: [
        { message: `Error creating prompt: ${error}` }
      ],
    };
  }
};

export const FindAllPrompts = async (): Promise<
  ServerActionResponse<Array<PromptModel>>
> => {
  try {
    const userId = await userHashedId();
    const user = await getCurrentUser();
    const userGroups = await getCurrentUserGroups(user.accessToken!);
    
    const querySpec: SqlQuerySpec = {
      query: `
        SELECT * FROM r
        WHERE r.type = @type
          AND (
            (r.isPublished = @isPublished AND EXISTS (
              SELECT VALUE g FROM g IN r.assignedGroups
              WHERE ARRAY_CONTAINS(@userGroups, g)
            ))
            OR r.userId = @userId
          )
      `,
      parameters: [
        { name: "@type", 
          value: PROMPT_ATTRIBUTE 
        },
        { 
          name: "@isPublished",
          value: true 
        },
        { name: "@userGroups",
          value: userGroups 
        },
        { name: "@userId", 
          value: userId 
        },
      ],
    };

    const { resources } = await ConfigContainer()
      .items.query<PromptModel>(querySpec)
      .fetchAll();

    return {
      status: "OK",
      response: resources,
    };
  } catch (error) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `Error retrieving prompt: ${error}`,
        },
      ],
    };
  }
};

export const EnsurePromptOperation = async (
  promptId: string
): Promise<ServerActionResponse<PromptModel>> => {
  const promptResponse = await FindPromptByID(promptId);
  const currentUser = await getCurrentUser();

  if (promptResponse.status === "OK") {
      return promptResponse;
    }
  return {
    status: "UNAUTHORIZED",
    errors: [
      {
        message: `Prompt not found with id: ${promptId}`,
      },
    ],
  };
};

export const DeletePrompt = async (
  promptId: string
): Promise<ServerActionResponse<PromptModel>> => {
  try {
    const promptResponse = await EnsurePromptOperation(promptId);

    if (promptResponse.status === "OK") {
      const { resource: deletedPrompt } = await ConfigContainer()
        .item(promptId, promptResponse.response.userId)
        .delete();

      return {
        status: "OK",
        response: deletedPrompt,
      };
    }

    return promptResponse;
  } catch (error) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `Error deleting prompt: ${error}`,
        },
      ],
    };
  }
};

export const FindPromptByID = async (
  id: string
): Promise<ServerActionResponse<PromptModel>> => {
  try {
    const querySpec: SqlQuerySpec = {
      query: "SELECT * FROM root r WHERE r.type=@type AND r.id=@id",
      parameters: [
        {
          name: "@type",
          value: PROMPT_ATTRIBUTE,
        },
        {
          name: "@id",
          value: id,
        },
      ],
    };

    const { resources } = await ConfigContainer()
      .items.query<PromptModel>(querySpec)
      .fetchAll();

    if (resources.length === 0) {
      return {
        status: "NOT_FOUND",
        errors: [
          {
            message: "Prompt not found",
          },
        ],
      };
    }

    return {
      status: "OK",
      response: resources[0],
    };
  } catch (error) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `Error finding prompt: ${error}`,
        },
      ],
    };
  }
};

export const UpsertPrompt = async (
  promptInput: PromptModel
): Promise<ServerActionResponse<PromptModel>> => {
  try {
    const user = await getCurrentUser();

    // 1) Block non-admins from upserting
    if (!user.isAdmin) {
      return {
        status: "UNAUTHORIZED",
        errors: [
          { message: "Only admins can update prompts" }
        ],
      };
    }

    // 2) Ensure the prompt actually exists
    const promptResponse = await FindPromptByID(promptInput.id);
    if (promptResponse.status !== "OK") {
      return promptResponse;
    }
    const existingPrompt = promptResponse.response;

    // 3) Build the updated model
    const modelToUpdate: PromptModel = {
      ...existingPrompt,
      name: promptInput.name,
      description: promptInput.description,
      isPublished: promptInput.isPublished,  // admin controls publish
      createdAt: new Date(),
      assignedGroups: promptInput.assignedGroups ?? existingPrompt.assignedGroups,
    };

    // 4) Validate and save
    const validationResponse = ValidateSchema(modelToUpdate);
    if (validationResponse.status !== "OK") {
      return validationResponse;
    }

    const { resource } = await ConfigContainer().items.upsert<PromptModel>(
      modelToUpdate
    );

    if (resource) {
      return { status: "OK", response: resource };
    }
    return {
      status: "ERROR",
      errors: [{ message: "Error updating prompt" }],
    };
  } catch (error) {
    return {
      status: "ERROR",
      errors: [
        { message: `Error updating prompt: ${error}` }
      ],
    };
  }
};


const ValidateSchema = (model: PromptModel): ServerActionResponse => {
  const validatedFields = PromptModelSchema.safeParse(model);

  if (!validatedFields.success) {
    return {
      status: "ERROR",
      errors: zodErrorsToServerActionErrors(validatedFields.error.errors),
    };
  }

  return {
    status: "OK",
    response: model,
  };
};
