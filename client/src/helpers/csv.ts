import Papa, { ParseResult } from "papaparse";

export const isValidCSVType = (file: File): boolean => file.type === "text/csv";

export const parseCSV = async (file: File): Promise<string[][]> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      Papa.parse(file, {
        complete: (result: ParseResult<string[]>) => {
          resolve(result.data);
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
          reject("Error parsing CSV");
        },
      });
    });
  });
};
