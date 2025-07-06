import { Session } from "../domain/session.type";
import { SessionRepository } from "../infrastructure/session.repository";

export const getSessionById = async (id: string): Promise<Session | null> => {
  return await SessionRepository.findById(id);
};
