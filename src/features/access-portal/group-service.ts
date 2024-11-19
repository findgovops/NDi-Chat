// group-service.ts

import { GroupModel } from '@/features/extensions-page/extension-services/models';

export const getAvailableGroups = async (accessToken: string): Promise<GroupModel[]> => {
  try {
    const graphResponse = await fetch('https://graph.microsoft.com/v1.0/groups', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await graphResponse.json();

    const groups: GroupModel[] = data.value.map((group: any) => ({
      id: group.id,
      displayName: group.displayName,
    }));

    return groups;
  } catch (error) {
    console.error('Error fetching groups:', error);
    return [];
  }
};