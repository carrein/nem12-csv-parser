import {
  BaseEntity,
  Entity,
  PrimaryKey,
  Property,
  Unique,
} from "@mikro-orm/core";

import { v4 as uuidv4 } from "uuid";

@Entity({ tableName: "meter_readings" })
@Unique({ properties: ["nmi", "timestamp"] })
export class MeterReading extends BaseEntity {
  @PrimaryKey()
  id!: number;

  @Property({ type: "string", length: 10 })
  nmi!: string;

  @Property({ columnType: "timestamp", nullable: true })
  timestamp?: Date;

  @Property({ columnType: "numeric" })
  consumption!: number;
}
