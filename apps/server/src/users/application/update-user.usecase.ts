import type { User } from "../domain/user.type";
import { UserRepository } from "../infrastructure/user.repository";
import { hashPassword } from "@/shared/infrastructure/auth/password";

export const updateUser = async (id: string, data: Partial<User>) => {
  let updateData = { ...data };
  if (data.password) {
    updateData.password = await hashPassword(data.password);
  }
  const user = await UserRepository.update(id, updateData);
  return user;
};
