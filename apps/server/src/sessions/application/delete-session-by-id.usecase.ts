import { SessionRepository } from "../infrastructure/session.repository";

export const deleteSessionById = async (id: string): Promise<boolean> => {
  const deleteSession = await SessionRepository.findById(id);

  return deleteSession ? true : false;
};
