import { env } from "@/shared/infrastructure/env";
import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { AppRoutes } from "./app.routes";

const packageJson = JSON.parse(await Bun.file("./package.json").text());

const app = new Elysia({
  serve: {
    idleTimeout: 255,
    hostname: "0.0.0.0",
  },
})
  .use(
    cors({
      credentials: true,
      allowedHeaders: ["content-type"],
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
      origin: (request): boolean => {
        const origin = request.headers.get("origin");

        if (!origin) {
          return false;
        }

        return true;
      },
    })
  )
  .use(AppRoutes);

app.use(
  swagger({
    swaggerOptions: {
      deepLinking: true,
      withCredentials: true,
    },
    documentation: {
      servers: [
        {
          url: `http://localhost:${env.PORT}`,
          description: "Development Server",
        },
        {
          url: "https://api.lapes.com.br",
          description: "Production",
        },
      ],
      info: {
        title: "Lapes Food",
        version: "1.0.0",
        description: `Documentação da API do Lapes Food - © ${new Date().getFullYear()} Todos os direitos reservados.`,
      },
    },

    path: "/docs",
  })
);

export type app = typeof app;

async function startServer() {
  try {
    await app.listen(env.PORT);
    console.log(
      `  🧑‍💻Lapes API \n
  ⏳ Time: ${new Date().toISOString()} \n
  🚪 Port: ${app.server?.port} \n
  🌐 URL: http://localhost:${app.server?.port} \n
  📚 Documentation: http://localhost:${app.server?.port}/docs \n
  © ${new Date().getFullYear()} Lapes Cesupa. All rights reserved.\n  https://lapes.cesupa.br\n  \n  `
    );
  } catch (error) {
    console.error("Erro ao iniciar o servidor:", error);
    process.exit(1);
  }
}

startServer();
