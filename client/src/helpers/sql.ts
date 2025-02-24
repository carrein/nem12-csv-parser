import { MeterReading } from "../types/types";

// Create an INSERT statement given a set of MeterReadings.
export const createInsertStatement = (
  meterReadings: MeterReading[]
): string => {
  const formattedReadings = meterReadings.map(
    (item) =>
      `('${item.nmi}', TO_TIMESTAMP('${item.timestamp}'::text, 'YYYYMMDD'), ${item.consumption})`
  );
  const values = formattedReadings.join(", ");
  return `INSERT INTO meter_readings (nmi, timestamp, consumption) VALUES ${values};`;
};
