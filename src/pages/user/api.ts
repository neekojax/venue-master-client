import { fetchPost } from "@/helper/fetchHelper";

export type ResetPasswordPayload = {
  old_password: string;
  new_password: string;
};

export const resetPassword = async (data: ResetPasswordPayload) => {
  return await fetchPost("passport/reset-password", data);
};
