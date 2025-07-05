import Elysia from "elysia";
import { UserController } from "./users/infrastructure/user.controller";

const routes = new Elysia({ prefix: "/v1" }).use(UserController);

routes.get("/", () => {
  return {
    status: "success",
    message: "API is running",
  };
});

export { routes as AppRoutes };
