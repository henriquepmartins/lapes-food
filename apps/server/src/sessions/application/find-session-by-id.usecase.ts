import { Session } from "../domain/session.type";
import { SessionRepository } from "../infrastructure/session.repository";

export const findSessionById = async (id: string): Promise<Session> => {
  const session = await SessionRepository.findById(id);
  if (!session) {
    throw new Error(`Session with id ${id} not found`);
  }

  return session;
};
