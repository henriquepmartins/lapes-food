import { MenuItemRepository } from "../infrastructure/menu-item.repository";

export const getAllMenuItemsUsecase = async (params: {
  page: number;
  limit: number;
  query: string;
}) => {
  const menuItems = await MenuItemRepository.getAll(params);
  return menuItems;
};
