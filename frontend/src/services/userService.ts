/**
 * 사용자 관련 API 서비스 (내 정보 / 프로필)
 */

import api from "@/lib/api";
import type { User } from "@/types/user";

interface UpdateMeResponse {
  status: "success" | "error";
  data?: User;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * 닉네임 변경 API
 * PATCH /api/v1/users
 */
export async function updateNickname(nickname: string): Promise<UpdateMeResponse> {
  const response = await api.patch<UpdateMeResponse>("/users", {
    nickname,
  });
  return response.data;
}

const userService = {
  updateNickname,
};

export default userService;

