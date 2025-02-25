import {
  EntityManager,
  EntityRepository,
  MikroORM,
  Options,
} from "@mikro-orm/sqlite";
import { MeterReading } from "./models/meterReading.entity.js";

export interface Services {
  orm: MikroORM;
  em: EntityManager;
  meterReading: EntityRepository<MeterReading>;
}

let cache: Services;

export async function initORM(options?: Options): Promise<Services> {
  if (cache) {
    return cache;
  }

  const orm = await MikroORM.init(options);

  return (cache = {
    orm,
    em: orm.em,
    meterReading: orm.em.getRepository(MeterReading),
  });
}
