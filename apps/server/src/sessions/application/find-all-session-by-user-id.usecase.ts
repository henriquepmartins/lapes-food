import { Session } from "../domain/session.type";
import { SessionRepository } from "../infrastructure/session.repository";

export const findAllSessionByUserId = async (
  userId: string,
): Promise<Session[] | null> => {
  const sessions = await SessionRepository.findAllByUserId(userId);
  return sessions;
};
