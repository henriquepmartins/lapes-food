import { MenuItemRepository } from "../infrastructure/menu-item.repository";

export const deleteMenuItemUsecase = async (id: string) => {
  await MenuItemRepository.delete(id);
};
