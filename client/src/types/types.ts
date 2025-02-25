// General purpose file to declare types.
// Consider colocating these objects if the project grows.
export const NEM12 = "NEM12";
export const NEM12_START_OF_DATA = "100";
export const NEM12_NMI_DETAILS = "200";
export const NEM12_INTERVAL_METER_READING_DATA = "300";
export const MINUTES_IN_A_DAY = 1440;

export type MeterReading = {
  nmi: string;
  timestamp: string;
  consumption: string;
};
