import { MenuCategoryRepository } from "../infrastructure/menu-category.repository";

export const getCategoryById = async (id: string) => {
  const category = await MenuCategoryRepository.getById(id);
  return category;
};
