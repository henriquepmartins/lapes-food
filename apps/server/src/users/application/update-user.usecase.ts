import type { User } from "../domain/user.type";
import { UserRepository } from "../infrastructure/user.repository";

export const updateUser = async (id: string, data: Partial<User>) => {
  const user = await UserRepository.update(id, data);
  return user;
};
