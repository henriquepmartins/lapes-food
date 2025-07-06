import { type Static, t } from "elysia";

import { SessionRepository } from "@/sessions/infrastructure/session.repository";
import { UserRepository } from "@/users/infrastructure/user.repository";
import { sha256 } from "@oslojs/crypto/sha2";
import { encodeHexLowerCase } from "@oslojs/encoding";
import type { User } from "@/users/domain/user.type";
import { generateSessionToken } from "@/shared/infrastructure/auth/session";
import { verifyPassword } from "@/shared/infrastructure/auth/password";

export const LoginUserRequestSchema = t.Object({
  email: t.String(),
  password: t.String(),
});

export type LoginUserRequest = Static<typeof LoginUserRequestSchema> & {
  ip: string;
  userAgent: string;
};

export type LoginUserResponse = User & {
  token: string;
};

export const loginUseCase = async (
  loginData: LoginUserRequest
): Promise<LoginUserResponse> => {
  const user = await UserRepository.getByEmail(loginData.email);

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.password) {
    throw new Error("User has no password");
  }
  const passwordMatch = await verifyPassword(
    loginData.password.trim(),
    user.password!
  );

  if (!passwordMatch) {
    throw new Error("Invalid password");
  }

  user.password = null;

  const sessionToken = generateSessionToken();

  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days

  const sessionId = encodeHexLowerCase(
    sha256(new TextEncoder().encode(sessionToken))
  );

  await SessionRepository.create({
    id: sessionId,
    expiresAt,
    ip: loginData.ip,
    userAgent: loginData.userAgent,
    userId: user.id,
  });

  return {
    ...user,
    token: sessionToken,
    createdAt: user.createdAt.toISOString(),
  };
};
