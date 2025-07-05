import { UserRepository } from "../infrastructure/user.repository";

export const deleteUser = async (id: string) => {
  const user = await UserRepository.delete(id);
  return user;
};
