import Elysia from "elysia";
import { UserController } from "./users/infrastructure/user.controller";
import { AuthController } from "./auth/infrastructure/auth.controller";

const routes = new Elysia({ prefix: "/v1" })
  .use(UserController)
  .use(AuthController);

routes.get("/", () => {
  return {
    status: "success",
    message: "API is running",
  };
});

export { routes as AppRoutes };
