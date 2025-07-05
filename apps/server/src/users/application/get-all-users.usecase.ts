import { UserRepository } from "../infrastructure/user.repository";

export const getAllUsers = async (params: {
  page: number;
  limit: number;
  query?: string;
}) => {
  const { page, limit, query } = params;
  const users = await UserRepository.getAll({ page, limit, query });
  return users.users.map((user) => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
  }));
};
