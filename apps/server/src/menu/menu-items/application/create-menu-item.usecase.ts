import {
  MenuItemRepository,
  type CreateMenuItemParams,
} from "../infrastructure/menu-item.repository";

export const createMenuItemUsecase = async (params: CreateMenuItemParams) => {
  const item = await MenuItemRepository.create(params);
  return item;
};
