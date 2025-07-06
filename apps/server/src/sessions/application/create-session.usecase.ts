import { Remove } from "@/@types/helpers";
import { Session } from "../domain/session.type";
import { SessionRepository } from "../infrastructure/session.repository";
import { encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";

export const createSession = async (
  session: Remove<Session, "id" | "expiresAt" | "createdAt" | "updatedAt">,
  token: string,
): Promise<Session | null> => {
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days

  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

  return await SessionRepository.create({
    id: sessionId,
    expiresAt,
    ...session,
  });
};
