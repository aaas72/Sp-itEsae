// hooks/usePendingInvitations.js
import { useQuery } from "@tanstack/react-query";
import { groupsAPI } from "../utils/api";

export const usePendingInvitations = () => {
  return useQuery(
    ["pendingInvitations"],
    async () => {
      const data = await groupsAPI.getPendingInvitations();
      return data; // Expect { success, data: [...] }
    },
    {
      staleTime: 1000 * 60, // One minute
      onError: (err) => console.error("Error fetching invitations:", err),
    }
  );
};
