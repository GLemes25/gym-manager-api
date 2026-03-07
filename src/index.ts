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
import { env } from "./lib/env.js";
import { aiRoutes } from "./routes/ai.js";
import { homeRoutes } from "./routes/home.js";
import { meRoutes } from "./routes/me.js";
import { statsRoutes } from "./routes/stats.js";
import { workoutPlanRoutes } from "./routes/workout-plan.js";

const envToLogger = {
  development: {
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  },
  production: true,
  test: false,
};

const app = Fastify({
  logger: envToLogger[env.NODE_ENV],
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
        url: env.API_BASE_URL,
        description: "API Base Url",
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
  origin: [env.WEB_APP_BASE_URL],
  credentials: true,
});

//Routes
await app.register(workoutPlanRoutes, { prefix: "/workout-plans" });
await app.register(homeRoutes, { prefix: "/home" });
await app.register(statsRoutes, { prefix: "/stats" });
await app.register(meRoutes, { prefix: "/me" });
await app.register(aiRoutes, { prefix: "/ai" });

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
  method: ["GET", "POST", "OPTIONS"],
  url: "/api/auth/*",
  schema: {
    hide: true,
  },
  async handler(request, reply) {
    if (request.method === "OPTIONS") {
      return reply.status(204).send();
    }

    try {
      const url = new URL(request.url, `http://${request.headers.host}`);

      const headers = new Headers();
      Object.entries(request.headers).forEach(([key, value]) => {
        if (value) headers.append(key, value.toString());
      });

      const req = new Request(url.toString(), {
        method: request.method,
        headers,
        body:
          request.method !== "GET" && request.body
            ? JSON.stringify(request.body)
            : undefined,
      });

      const response = await auth.handler(req);

      reply.status(response.status);

      response.headers.forEach((value, key) => {
        reply.header(key, value);
      });
      reply.send(response.body);
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
    port: Number(env.PORT),
    host: "0.0.0.0",
  });

  app.log.info(`Server running at ${env.API_BASE_URL}`);
  app.log.info(`API Docs available at ${env.API_BASE_URL}/documentation`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
