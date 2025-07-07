import {
  MenuCategoryRepository,
  type CreateMenuCategoryParams,
} from "../infrastructure/menu-category.repository";

export const updateCategory = async (
  id: string,
  params: CreateMenuCategoryParams
) => {
  const updatedCategory = await MenuCategoryRepository.update(id, params);
  return updatedCategory;
};
