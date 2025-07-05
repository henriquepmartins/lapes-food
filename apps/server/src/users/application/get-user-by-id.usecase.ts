import { UserRepository } from "../infrastructure/user.repository";

export const getUserById = async (id: string) => {
  const user = await UserRepository.getById(id);
  return user;
};
