import { useMutation } from "@tanstack/react-query";
import { groupsAPI } from "../utils/api";

export const useInviteUser = () => {
  return useMutation({
    mutationFn: async ({ email, groupId }) => {
      if (!email || !groupId) {
        throw new Error("E-posta ve Grup Kimliği gereklidir");
      }

      const response = await groupsAPI.inviteUser({ email, groupId });
      return response;
    },
  });
};
