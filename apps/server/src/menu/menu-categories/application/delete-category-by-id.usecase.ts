import { MenuCategoryRepository } from "../infrastructure/menu-category.repository";

export const deleteCategoryById = async (id: string) => {
  const deletedCategory = await MenuCategoryRepository.delete(id);
  return deletedCategory;
};
