import { UserRepository } from "@/users/infrastructure/user.repository";
import type { User } from "@/users/domain/user.type";

export const verifyLoggedUser = async (user: User) => {
  if (!user) {
    throw new Error("User not found");
  }
  const userInfo = await UserRepository.getById(user.id);

  if (!userInfo) {
    throw new Error("User not found in database");
  }

  return {
    ...userInfo,
    createdAt: userInfo.createdAt.toISOString(),
  };
};
