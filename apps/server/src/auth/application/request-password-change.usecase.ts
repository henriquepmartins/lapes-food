import {
  hashPassword,
  verifyPassword,
} from "@/shared/infrastructure/auth/password";
import { UserRepository } from "@/users/infrastructure/user.repository";
import { t } from "elysia";

export const ChangePasswordRequestSchema = t.Object({
  email: t.String(),
  currentPassword: t.String(),
  newPassword: t.String(),
});

export const changePassword = async (
  email: string,
  currentPassword: string,
  newPassword: string,
  confirmationNewPassword: string
) => {
  const user = await UserRepository.getByEmail(email);
  if (!user) {
    return false;
  }
  const passwordMatch = await verifyPassword(
    currentPassword.trim(),
    user.password!
  );

  if (!passwordMatch) {
    return false;
  }

  if (
    newPassword === confirmationNewPassword &&
    newPassword.trim().length > 6 &&
    newPassword.trim() !== currentPassword.trim()
  ) {
    const hashedNewPassword = await hashPassword(newPassword.trim());
    await UserRepository.update(user.id, {
      password: hashedNewPassword,
    });

    return true;
  }
};
