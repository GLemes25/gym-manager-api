import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import "dotenv/config";

import Fastify from "fastify";
import {
  jsonSchemaTransform,
  jsonSchemaTransformObject,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import z from "zod";

const app = Fastify({
  logger: true,
});
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

await app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "gym-manager-api",
      description: "Api para gerenciamento de treinos",
      version: "1.0.0",
    },
    servers: [
      {
        description: "Localhost",
        url: "http://localhost:3000",
      },
    ],
  },
  transform: jsonSchemaTransform,
  transformObject: jsonSchemaTransformObject,
});

await app.register(fastifySwaggerUI, {
  routePrefix: "/documentation",
});

app.withTypeProvider<ZodTypeProvider>().route({
  method: "GET",
  url: "/",

  schema: {
    description: "hello world",
    tags: ["hello world"],
    response: {
      200: z.object({
        message: z.string(),
      }),
    },
  },
  handler: () => {
    return { message: "ralio world" };
  },
});

try {
  await app.listen({ port: Number(process.env.PORT ?? 3000) });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
