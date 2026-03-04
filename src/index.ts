import "dotenv/config";

import fastifyCors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastifyApiReference from "@scalar/fastify-api-reference";
import Fastify from "fastify";
import {
  jsonSchemaTransform,
  jsonSchemaTransformObject,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";

import z from "zod";

import { auth } from "./lib/auth.js";
import { homeRoutes } from "./routes/home.js";
import { workoutPlanRoutes } from "./routes/workout-plan.js";

const app = Fastify({
  logger: true,
});
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

await app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "gym-manager-api",
      description: "API para gerenciamento de treinos",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Localhost",
      },
    ],
  },
  transform: jsonSchemaTransform,
  transformObject: jsonSchemaTransformObject,
});

app.get("/openapi.json", async () => {
  await app.ready();
  return app.swagger();
});

await app.register(fastifyApiReference, {
  routePrefix: "/documentation",
  configuration: {
    sources: [
      {
        title: "Gym Manager API",
        slug: "gym-manager-api",
        url: "/openapi.json", // 👈 CORRETO NO V5
      },
      {
        title: "Auth API",
        slug: "auth-api",
        url: "/api/auth/open-api/generate-schema",
      },
    ],
  },
});

await app.register(fastifyCors, {
  origin: ["http://localhost:3000"],
  credentials: true,
});

//Routes
await app.register(workoutPlanRoutes, { prefix: "/workout-plans" });
await app.register(homeRoutes, { prefix: "/home" });

app.withTypeProvider<ZodTypeProvider>().route({
  method: "GET",
  url: "/",

  schema: {
    description: "Health check",
    tags: ["Health"],
    response: {
      200: z.object({
        message: z.string(),
      }),
    },
  },
  handler: async () => {
    return { message: "Gym Manager API is running 🚀" };
  },
});

app.route({
  method: ["GET", "POST"],
  url: "/api/auth/*",
  async handler(request, reply) {
    try {
      const url = new URL(request.url, `http://${request.headers.host}`);

      const headers = new Headers();
      Object.entries(request.headers).forEach(([key, value]) => {
        if (value) headers.append(key, value.toString());
      });

      const req = new Request(url.toString(), {
        method: request.method,
        headers,
        ...(request.body ? { body: JSON.stringify(request.body) } : {}),
      });

      const response = await auth.handler(req);

      reply.status(response.status);
      response.headers.forEach((value, key) => reply.header(key, value));
      reply.send(response.body ? await response.text() : null);
    } catch (error) {
      app.log.error(error, "Authentication error");
      reply.status(500).send({
        error: "Internal authentication error",
        code: "AUTH_FAILURE",
      });
    }
  },
});

try {
  await app.listen({
    port: Number(process.env.PORT ?? 3000),
    host: "0.0.0.0",
  });

  app.log.info("Server running at http://localhost:3000");
  app.log.info("API Docs available at http://localhost:3000/documentation");
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
