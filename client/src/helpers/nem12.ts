import { MeterReading } from "../types/types";

// Validate if a file is NEM12 compatible.
export const isValidNem12Type = (data: string[][]): boolean =>
  data[0][0] === "100" && data[0][1] === "NEM12";

// Extract MeterReading from a parsed NEM12 file.
export const extractMeterReadings = (data: string[][]): MeterReading[] => {
  const meterReadings: MeterReading[] = [];
  let nmi = "";
  let intervalLength = "";

  for (const currentRow of data) {
    if (currentRow[0] === "200") {
      // Extract NMI and interval length from record 200
      nmi = currentRow[1];
      intervalLength = currentRow[8];
    }

    if (currentRow[0] === "300") {
      const interval = parseInt(intervalLength, 10);
      // The number of values provided must equal 1440 divided by
      // the IntervalLength. This is a repeating field with individual
      // field values separated by comma delimiters.
      const readingsCount = 1440 / interval;
      const consumptionValues = currentRow.slice(2, 2 + readingsCount);

      // Accumulate consumption figures across entry.
      const consumption = consumptionValues.reduce((acc, val) => {
        return acc + parseFloat(val);
      }, 0);

      meterReadings.push({
        nmi,
        timestamp: currentRow[1],
        consumption: consumption.toString(),
      });
    }
  }

  return meterReadings;
};

// Given a set of meter readings, check if they fulfill validity constraints.
export const areMeterReadingsValid = (
  meterReadings: MeterReading[]
): boolean => {
  const observedReadings = new Set<string>();

  for (const reading of meterReadings) {
    if (!reading.nmi || !reading.timestamp || !reading.consumption) {
      return false;
    }
    const uniqueKey = `${reading.nmi}-${reading.timestamp}`;

    if (observedReadings.has(uniqueKey)) return false;

    observedReadings.add(uniqueKey);
  }

  return true;
};
