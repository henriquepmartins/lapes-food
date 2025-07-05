import { createSession } from "@/sessions/application/create-session.usecase";
import type { Session } from "@/sessions/domain/session.type";
import { encodeBase32LowerCaseNoPadding } from "@oslojs/encoding";

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);

  return token;
}

export async function generateSession(
  data: Omit<Session, "id" | "expiresAt" | "createdAt" | "updatedAt">
): Promise<string> {
  const sessionToken = generateSessionToken();

  await createSession(
    {
      ...data,
    },
    sessionToken
  );

  return sessionToken;
}
