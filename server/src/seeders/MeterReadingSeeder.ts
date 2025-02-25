import type { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";
import { MeterReading } from "../models/meterReading.entity.js";

export class MeterReadingSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    em.create(MeterReading, {
      nmi: "GENCO",
      timestamp: new Date("2023-10-01T10:00:00Z"),
      consumption: 10.0,
    });

    em.create(MeterReading, {
      nmi: "ARCON",
      timestamp: new Date("2023-10-02T10:00:00Z"),
      consumption: 20.0,
    });

    em.create(MeterReading, {
      nmi: "TRINE",
      timestamp: new Date("2023-10-03T10:00:00Z"),
      consumption: 30.0,
    });
  }
}
