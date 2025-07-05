import { sha256 } from "@oslojs/crypto/sha2";
import { encodeHexLowerCase } from "@oslojs/encoding";
import { SessionRepository } from "../infrastructure/session.repository";

export const invalidateSessionByToken = async (
  token: string
): Promise<void> => {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

  await SessionRepository.deleteById(sessionId);
};
