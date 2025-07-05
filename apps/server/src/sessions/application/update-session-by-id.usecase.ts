import { Session } from "../domain/session.type";
import { SessionRepository } from "../infrastructure/session.repository";

export const updateSessionById = async (
  id: string,
  data: Partial<Session>,
): Promise<Session | null> => {
  const updateSession = await SessionRepository.findById(id);

  if (!updateSession) {
    throw new Error(`Session with id ${id} not found`);
  }

  return await SessionRepository.updateById(id, data);
};
