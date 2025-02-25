import { IncomingMessage, Server, ServerResponse } from "http";
import request from "supertest";
import { afterAll, beforeAll, expect, test } from "vitest";
import { initTestApp } from "../utils.js";

let app: Server<typeof IncomingMessage, typeof ServerResponse>;

beforeAll(async () => {
  app = await initTestApp(3000);
});

afterAll(async () => {
  await app.close();
});

test("healthcheck", async () => {
  const res = await request(app).get("/trpc/healthCheckRouter.healthCheck");
  expect(res.statusCode).toBe(200);
});
