import { MenuItemRepository } from "../infrastructure/menu-item.repository";

export const getMenuItemByIdUsecase = async (id: string) => {
  const menuItem = await MenuItemRepository.getById(id);
  return menuItem;
};
