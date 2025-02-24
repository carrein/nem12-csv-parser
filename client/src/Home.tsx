import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "./components/Button";
import { Column } from "./components/Column";
import { Error } from "./components/Error";
import { Fieldset } from "./components/Fieldset";
import { Label } from "./components/Label";
import { Layout } from "./components/Layout";
import { Input } from "./components/Radio";
import { isValidCSVType, parseCSV } from "./helpers/csv";
import {
  areMeterReadingsValid,
  extractMeterReadings,
  isValidNem12Type,
} from "./helpers/nem12";
import { createInsertStatement } from "./helpers/sql";
import { uploadNEM12File } from "./services/nem12.service";

type ProcessingOptions = "client" | "server";

// Entrypoint for NEM12 CSV Parser.
// This application is lightly styled to retains HTML semantics and keep things light.
// ##IMPROVEMENT: Consider swapping to a form library if fields increase in complexity.
export const Home = () => {
  const [processingOption, setProcessingOption] =
    useState<ProcessingOptions>("client");
  const [file, setFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [copySuccessMessage, setCopySuccessMessage] = useState(false);
  const [sqlStatement, setSqlStatement] = useState("");
  const [meterReadingsCount, setMeterReadingsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const mutation = useMutation({
    mutationFn: uploadNEM12File,
    onSuccess: (data) => {
      setSqlStatement(data.message);
    },
  });

  const reset = () => {
    setSqlStatement("");
    setErrorMessage("");
    setCopySuccessMessage(false);
    setIsLoading(false);
    setMeterReadingsCount(0);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    reset();

    // Prevent default default behavior of form from refreshing the page.
    event.preventDefault();

    setFile(file);

    if (!file) return;

    if (!isValidCSVType(file)) {
      setErrorMessage("Please upload a valid CSV file.");
      return;
    }

    if (processingOption === "server") {
      // mutation.mutate(file);
      // setSqlStatement(mutation.data.message);
      // setErrorMessage("");
      return;
    }

    setIsLoading(true);

    const parsedFile = await parseCSV(file);

    if (!isValidNem12Type(parsedFile)) {
      setErrorMessage("Invalid NEM12 file. Please check the file format.");
      setIsLoading(false);
      return;
    }

    const meterReadings = extractMeterReadings(parsedFile);

    if (meterReadings.length === 0) {
      setErrorMessage("No valid meter readings found in the file.");
      setIsLoading(false);
      return;
    }

    if (!areMeterReadingsValid(meterReadings)) {
      setErrorMessage("Invalid meter readings found in the file.");
      setIsLoading(false);
      return;
    }

    setErrorMessage("");
    setIsLoading(false);
    setSqlStatement(createInsertStatement(meterReadings));
    setMeterReadingsCount(meterReadings.length);
  };

  const handleCopy = () => {
    navigator.clipboard
      .writeText(sqlStatement)
      .then(() => setCopySuccessMessage(true))
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    reset();
    setFile(file);
  };

  const handleProcessingOptionChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => setProcessingOption(event.target.value as ProcessingOptions);

  return (
    <Layout>
      <h1>NEM12 CSV Parser</h1>
      <div>
        <h3>Generate SQL INSERT statements from a NEM12 compatible CSV file</h3>
        <span>1. Only 200 and 300 NEM12 record indicators are parsed.</span>
        <br />
        <span>
          2. INSERT statements follow a predefined format: aggregated usage over
          a time interval for a specific timestamp.
        </span>
      </div>
      <Column>
        <h2>Upload NEM12 compatible CSV file</h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <Column>
            <legend>1. Select CSV file</legend>
            <Fieldset>
              <input
                disabled={mutation.isPending || isLoading}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
              />
            </Fieldset>
            <legend>2. Select preferred processing type</legend>
            <Fieldset>
              <Label>
                <Input
                  disabled={mutation.isPending || isLoading}
                  type="radio"
                  name="option"
                  value="client"
                  checked={processingOption === "client"} // Control the radio button
                  onChange={handleProcessingOptionChange} // Handle change
                  required
                />
                Client
              </Label>
              <Label>
                <Input
                  disabled={mutation.isPending || isLoading}
                  type="radio"
                  name="option"
                  value="server"
                  checked={processingOption === "server"} // Control the radio button
                  onChange={handleProcessingOptionChange} // Handle change
                />
                Server
              </Label>
            </Fieldset>
            <Button
              type="submit"
              disabled={mutation.isPending || !file || isLoading}
            >
              {mutation.isPending || isLoading ? "Uploading..." : "Upload File"}
            </Button>
            <Label>{errorMessage && <Error>{errorMessage}</Error>}</Label>
          </Column>
        </form>
      </Column>
      <Column>
        {sqlStatement && (
          <Column>
            <h2>Generated INSERT statement</h2>
            <textarea rows={10} value={sqlStatement} readOnly />
            <Label>{`Number of rows: ${meterReadingsCount}`}</Label>
            <Button onClick={handleCopy}>Copy</Button>
            {copySuccessMessage && (
              <span>INSERT statement copied to clipboard.</span>
            )}
          </Column>
        )}
      </Column>
    </Layout>
  );
};
