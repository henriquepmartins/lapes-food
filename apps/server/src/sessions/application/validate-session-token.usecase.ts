import { UserRepository } from "@/users/infrastructure/user.repository";
import { SessionRepository } from "../infrastructure/session.repository";
import { encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";

export async function validateSessionToken(token: string) {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

  const session = await SessionRepository.findById(sessionId);

  if (!session) {
    throw new Error("Invalid session token");
  }

  if (Date.now() >= session.expiresAt.getTime()) {
    await SessionRepository.deleteByUserId(session.id);
    throw new Error("Session expired");
  }

  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await SessionRepository.updateById(sessionId, session);
  }

  const user = await UserRepository.getById(session.userId);

  // @ts-ignore
 user.password = null;

  if (!user) {
    throw new Error("User not found");
  }

  return { session, user };
}
