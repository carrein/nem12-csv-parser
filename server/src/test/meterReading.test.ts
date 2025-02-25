import { IncomingMessage, Server, ServerResponse } from "http";
import request from "supertest";
import { afterAll, beforeAll, expect, test } from "vitest";
import { initTestApp } from "../utils.js";

let app: Server<typeof IncomingMessage, typeof ServerResponse>;

beforeAll(async () => {
  app = await initTestApp(4000);
});

afterAll(async () => {
  await app.close();
});

test("meterReading", async () => {
  const res = await request(app)
    .post("/trpc/meterReadingRouter.listMeterReadings") // Change to POST
    .send({ limit: 10, offset: 0 }); // Send the input data if required

  expect(res.statusCode).toBe(200);

  expect(res.body.result.data).toMatchObject({
    items: [
      {
        nmi: "GENCO",
        timestamp: "2023-10-01T10:00:00.000Z",
        consumption: 10.0,
      },
      {
        nmi: "ARCON",
        timestamp: "2023-10-02T10:00:00.000Z",
        consumption: 20.0,
      },
      {
        nmi: "TRINE",
        timestamp: "2023-10-03T10:00:00.000Z",
        consumption: 30.0,
      },
    ],
    total: 3,
  });
});
