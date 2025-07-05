import { UserRepository } from "@/users/infrastructure/user.repository";
import type { User } from "../domain/user.type";

export const createUser = async (
  user: Omit<User, "id" | "createdAt" | "updatedAt">
): Promise<User> => {
  const existingUser = await UserRepository.getByEmail(user.email);

  if (existingUser) {
    throw new Error("Email is already in use");
  }

  const newUser = await UserRepository.create({
    ...user,
    role: "customer",
  });

  return {
    ...newUser,
    createdAt: newUser.createdAt.toISOString(),
  };
};
