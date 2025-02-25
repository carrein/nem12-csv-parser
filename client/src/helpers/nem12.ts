import { MeterReading, NEM12, NEM12_START_OF_DATA } from "../types/types";

// Validate if a file is NEM12 compatible by looking at the first row.
export const isValidNem12Type = (data: string[]): boolean =>
  data[0] === NEM12_START_OF_DATA && data[1] === NEM12;

// Validate if required meter reading fields are non-empty.
export const areMeterReadingsNonEmpty = (
  meterReadings: MeterReading[]
): boolean => {
  for (const reading of meterReadings) {
    if (!reading.nmi || !reading.consumption) {
      return false;
    }
  }

  return true;
};

// Validate if meter readings have unique NMI and timestamp combination.
export const areMeterReadingsUnique = (
  meterReadings: MeterReading[]
): boolean => {
  const observedReadings = new Set<string>();

  for (const reading of meterReadings) {
    const uniqueKey = `${reading.nmi}-${reading.timestamp}`;

    if (observedReadings.has(uniqueKey)) return false;

    observedReadings.add(uniqueKey);
  }

  return true;
};
