import type { MenuCategory } from "../domain/menu-category.type";
import { MenuCategoryRepository } from "../infrastructure/menu-category.repository";

export type CreateMenuCategoryInput = {
  name: string;
  description: string;
};

export const createCategory = async (input: CreateMenuCategoryInput) => {
  const newCategory = await MenuCategoryRepository.create(input);
  return newCategory;
};
