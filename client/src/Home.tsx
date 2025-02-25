import { useMutation, useQuery } from "@tanstack/react-query";
import Papa, { ParseStepResult } from "papaparse";
import { useState } from "react";
import { Button } from "./components/Button";
import { Column } from "./components/Column";
import { Error } from "./components/Error";
import { Label } from "./components/Label";
import { Layout } from "./components/Layout";
import { Rows } from "./components/Rows";
import { WarningButton } from "./components/WarningButton";
import {
  areMeterReadingsNonEmpty,
  areMeterReadingsUnique,
  isValidNem12Type,
} from "./helpers/nem12";
import { createInsertStatement } from "./helpers/sql";
import { trpc } from "./trpc";
import {
  MeterReading,
  MINUTES_IN_A_DAY,
  NEM12_INTERVAL_METER_READING_DATA,
  NEM12_NMI_DETAILS,
  NEM12_START_OF_DATA,
} from "./types/types";

// Entrypoint for NEM12 CSV Parser.
// This application is lightly styled to retains HTML semantics and keep things light.
// ##IMPROVEMENT: Consider swapping to a form library if fields increase in complexity.
export const Home = () => {
  const [file, setFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [copySuccessMessage, setCopySuccessMessage] = useState(false);
  const [sqlStatement, setSqlStatement] = useState("");
  const [meterReadingsCount, setMeterReadingsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  // Only show INSERT SQL statement button if server is online.
  const { status } = useQuery(
    trpc.healthCheckRouter.healthCheck.queryOptions()
  );
  const mutation = useMutation(
    trpc.meterReadingRouter.insertSQLMeterReadingStatement.mutationOptions({
      onSuccess: (data) => {
        setFile(null);
        setErrorMessage(`Successfully inserted ${data.changes} changes.`);
      },
      onError: (error) => {
        setErrorMessage(error.message);
      },
    })
  );

  const reset = () => {
    setSqlStatement("");
    setErrorMessage("");
    setCopySuccessMessage(false);
    setIsLoading(false);
    setMeterReadingsCount(0);
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    reset();
    setFile(file);

    // Prevent default default behavior of form from refreshing the page.
    event.preventDefault();

    setFile(file);

    if (!file) return;

    if (file.type !== "text/csv") {
      setErrorMessage("Please upload a valid CSV file.");
      return;
    }

    setIsLoading(true);

    let nmi = "";
    let intervalLength = "";
    const meterReadings: MeterReading[] = [];

    // Stream each individual row instead of loading entire file in browser memory.
    Papa.parse(file, {
      step: (row: ParseStepResult<string[]>) => {
        const currentRow = row.data as string[];

        // Inspect row 100 of the file to verify NEM12 compatability.
        if (currentRow[0] === NEM12_START_OF_DATA) {
          if (!isValidNem12Type(currentRow)) {
            setErrorMessage(
              "Invalid NEM12 file. Please check the file format."
            );
            setIsLoading(false);
            return;
          }
        }

        // Inspect row 200 to grab the NMI and interval length details.
        // Every subsequent row 300 entry will be associated with this NMI.
        if (currentRow[0] === NEM12_NMI_DETAILS) {
          nmi = currentRow[1];
          intervalLength = currentRow[8];
        }

        // Inspect row 300 to grab reading data.
        if (currentRow[0] === NEM12_INTERVAL_METER_READING_DATA) {
          const interval = parseInt(intervalLength, 10);
          // The number of values provided must equal 1440 (1 day) divided by
          // the IntervalLength. This is a repeating field with individual
          // field values separated by comma delimiters.
          const readingsCount = MINUTES_IN_A_DAY / interval;

          // Accumulate consumption reading figure across the row.
          const consumptionValues = currentRow.slice(2, 2 + readingsCount);
          const consumption = consumptionValues.reduce((acc, val) => {
            return acc + parseFloat(val);
          }, 0);

          meterReadings.push({
            nmi,
            timestamp: currentRow[1],
            consumption: consumption.toString(),
          });
        }
      },
      complete: () => {
        // No valid readings are found i.e. missing 200 or 300 rows.
        if (meterReadings.length === 0) {
          setErrorMessage("No valid meter readings found in the file.");
          setIsLoading(false);
          return;
        }

        // Readings with non-unique NMI and timestamp combination exists
        // OR readings with missing NMI, timestamp or consumption value exists.
        if (!areMeterReadingsNonEmpty(meterReadings)) {
          setErrorMessage("Meter readings contain empty NMI or reading field.");
          setIsLoading(false);
          return;
        }

        // OR readings with missing NMI, timestamp or consumption value exists.
        if (!areMeterReadingsUnique(meterReadings)) {
          setErrorMessage(
            "Meter readings violate unique NMI with timestamp constraints."
          );
          setIsLoading(false);
          return;
        }

        setErrorMessage("");
        setIsLoading(false);
        setSqlStatement(createInsertStatement(meterReadings));
        setMeterReadingsCount(meterReadings.length);
        return;
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
      },
    });
  };

  const handleCopy = () => {
    navigator.clipboard
      .writeText(sqlStatement)
      .then(() => setCopySuccessMessage(true))
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  // const handleFileChange = async (
  //   event: React.ChangeEvent<HTMLInputElement>
  // ) => {
  //   const file = event.target.files?.[0];

  //   if (!file) return;

  //   reset();
  //   setFile(file);
  // };

  return (
    <Layout>
      <h1>NEM12 CSV Parser</h1>
      <div>
        <h2>Generate SQL INSERT statements from a NEM12 compatible CSV file</h2>
        <span>1. Only 200 and 300 NEM12 record indicators are parsed.</span>
        <br />
        <span>
          2. INSERT statements follow a predefined format: aggregated usage over
          a time interval for a specific timestamp.
        </span>
      </div>
      <Column>
        <h2>1. Upload NEM12 compatible CSV file</h2>
        <Column>
          <input
            disabled={mutation.isPending || isLoading}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
          />
        </Column>
      </Column>
      <Column>
        {sqlStatement && (
          <Column>
            <h2>2. Get an INSERT statement</h2>
            <textarea rows={10} value={sqlStatement} readOnly />
            <Label>{`Number of rows: ${meterReadingsCount}`}</Label>
            <Rows>
              <Button onClick={handleCopy}>Copy</Button>
              {status === "success" && (
                <WarningButton
                  disabled={mutation.isPending || !file || isLoading}
                  onClick={() => {
                    var userConfirmed = confirm(
                      "Alert! This will attempt to run the generated SQL statement against the database."
                    );
                    if (userConfirmed) {
                      mutation.mutate(sqlStatement);
                    }
                  }}
                >
                  Execute INSERT statement
                </WarningButton>
              )}
            </Rows>
            {copySuccessMessage && (
              <span>INSERT statement copied to clipboard.</span>
            )}
          </Column>
        )}
        <Label>{errorMessage && <Error>{errorMessage}</Error>}</Label>
      </Column>
    </Layout>
  );
};
