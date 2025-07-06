import { MenuCategoryRepository } from "../infrastructure/menu-category.repository";

export const getAllCategories = async (params: {
  page: number;
  limit: number;
  query?: string;
}) => {
  const { page, limit, query } = params;
  const { menuCategories, total } = await MenuCategoryRepository.getAll({
    page,
    limit,
    query,
  });
  return { menuCategories, total };
};
