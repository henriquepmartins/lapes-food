import Elysia from "elysia";
import { UserController } from "./users/infrastructure/user.controller";
import { AuthController } from "./auth/infrastructure/auth.controller";
import { MenuCategoryController } from "./menu/menu-categories/infrastructure/menu-category.controller";
import { MenuItemController } from "./menu/menu-items/infrastructure/menu-item.controller";
import { MenuPhotoController } from "./menu/menu-photos/infrastructure/menu-photo.controller";
import { OrderController } from "./orders/infrastructure/order.controller";

const routes = new Elysia({ prefix: "/v1" })
  .use(UserController)
  .use(AuthController)
  .use(MenuCategoryController)
  .use(MenuItemController)
  .use(MenuPhotoController)
  .use(OrderController);

routes.get("/", () => {
  return {
    status: "success",
    message: "API is running",
  };
});

export { routes as AppRoutes };
