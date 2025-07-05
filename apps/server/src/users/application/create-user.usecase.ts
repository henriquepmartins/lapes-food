import { UserRepository } from "@/users/infrastructure/user.repository";
import type { User } from "../domain/user.type";
import { hashPassword } from "@/shared/infrastructure/auth/password";

export const createUser = async (
  user: Omit<User, "id" | "createdAt" | "updatedAt">
): Promise<User> => {
  const existingUser = await UserRepository.getByEmail(user.email);

  if (existingUser) {
    throw new Error("Email is already in use");
  }

  const hashedPassword = user.password
    ? await hashPassword(user.password)
    : null;

  const newUser = await UserRepository.create({
    ...user,
    password: hashedPassword,
    role: "customer",
  });

  return {
    ...newUser,
    createdAt: newUser.createdAt.toISOString(),
  };
};
