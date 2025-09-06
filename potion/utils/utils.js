import dotenv from "dotenv";
import fs from "fs";
import FormData from "form-data";
import fetch from "node-fetch";
import { createMindsDBNotesCSV } from "./csv.js";

dotenv.config({ path: "./.env" });

export const runQuery = async (query) => {
  try {
    const res = await fetch(`${process.env.MindsDB_URL}/api/sql/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const rawData = await res.json();
    // console.log("Raw data received:", rawData);

    if (rawData.type === "error") {
      throw new Error(`MindsDB error: ${rawData.error_message}`);
    }

    const transformedData =
      rawData.data?.map((row) => {
        const obj = {};
        rawData.column_names?.forEach((col, idx) => {
          obj[col] = row[idx];
        });
        return obj;
      }) || [];

    return { success: true, data: transformedData };
  } catch (error) {
    console.error("MindsDB query error:", error);
    return { success: false, error: error.message };
  }
};
export const uploadNotesData = async (notes) => {
  const notesFile = "./notes_data.csv";
  try {
    console.log("📤 Uploading CSV file to MindsDB...");

    // Create CSV file using the data.js function
    const csvFilePath = createMindsDBNotesCSV(notes, notesFile);

    // Create FormData for Node.js
    const form = new FormData();
    const fileStream = fs.createReadStream(csvFilePath);

    form.append("file", fileStream, {
      filename: "notes_data.csv",
      contentType: "text/csv",
    });
    form.append("original_file_name", "notes_data.csv");

    const response = await fetch(`${process.env.MindsDB_URL}/api/files/notes_data`, {
      method: "PUT",
      body: form,
      headers: { ...form.getHeaders() },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(`Upload failed: ${JSON.stringify(result)}`);
    }

    console.log("✅ CSV notes data uploaded successfully:", result);

    // Clean up temp file
    if (fs.existsSync(csvFilePath)) {
      fs.unlinkSync(csvFilePath);
    }

    return { success: true, data: result };
  } catch (error) {
    console.error("❌ Error uploading notes data:", error);
    return { success: false, error: error.message };
  }
};
