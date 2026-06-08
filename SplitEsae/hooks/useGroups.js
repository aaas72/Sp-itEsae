import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsAPI } from '../utils/api';

// Hook to fetch groups list
export const useGroups = () => {
  return useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const response = await groupsAPI.getUserGroups();
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // Data stays fresh for 2 minutes
  });
};

// Hook to fetch specific group details
export const useGroupDetails = (groupId) => {
  return useQuery({
    queryKey: ['group', groupId],
    queryFn: async () => {
      const response = await groupsAPI.getGroupDetails(groupId);
      return response.data;
    },
    enabled: !!groupId, // Enable query only if groupId exists
    staleTime: 1 * 60 * 1000, // Data stays fresh for 1 minute
  });
};

// Hook to create new group
export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (groupData) => groupsAPI.createGroup(groupData),
    onSuccess: () => {
      // Update groups list after creating new group
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};

// Hook to delete group
export const useDeleteGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (groupId) => groupsAPI.deleteGroup(groupId),
    onSuccess: () => {
      // Update groups list after deleting group
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};