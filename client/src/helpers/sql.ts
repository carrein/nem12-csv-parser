import { MeterReading } from "../types/types";

// Create an INSERT statement given a set of MeterReadings.
export const createInsertStatement = (
  meterReadings: MeterReading[]
): string => {
  const formattedReadings = meterReadings
    .map((item) => {
      const formattedTimestamp = item.timestamp;
      return `('${item.nmi}', '${formattedTimestamp}', ${item.consumption})`;
    })
    .join(", ");
  return `INSERT INTO meter_readings (nmi, timestamp, consumption) VALUES ${formattedReadings};`;
};
