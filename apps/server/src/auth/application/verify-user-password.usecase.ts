import { UserRepository } from "@/users/infrastructure/user.repository";

export const verifyUserHasPasswordUseCase = async (
  email: string
): Promise<string> => {
  const user = await UserRepository.getByEmail(email);

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.password) {
    throw new Error("User does not have a password");
  }

  return "User has password";
};
