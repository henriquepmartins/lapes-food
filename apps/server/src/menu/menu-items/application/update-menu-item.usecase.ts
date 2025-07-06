import { MenuItemRepository } from "../infrastructure/menu-item.repository";

export const updateMenuItemUsecase = async (id: string, params: any) => {
  const menuItem = await MenuItemRepository.update(id, params);
  return menuItem;
};
