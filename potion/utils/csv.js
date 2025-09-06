import fs from "fs";

export default function createCSVFromJSON(jsonData, outputPath = "./notes_data.csv") {
  // Handle different input formats
  const dataArray = Array.isArray(jsonData) ? jsonData : 
                   (jsonData.data ? jsonData.data : [jsonData]);
  
  if (!dataArray || dataArray.length === 0) {
    throw new Error("No data provided to convert to CSV");
  }

  // Get headers from the first item
  const headers = Object.keys(dataArray[0]);

  // Create CSV content
  let csvContent = headers.join(",") + "\n";

  // Add data rows
  dataArray.forEach((item) => {
    const row = headers
      .map((header) => {
        // Handle various data types and escape CSV special characters
        let cell = String(item[header] || "");
        
        // Escape quotes by doubling them and wrap in quotes if contains comma, quote, or newline
        if (cell.includes('"') || cell.includes(',') || cell.includes('\n') || cell.includes('\r')) {
          cell = '"' + cell.replace(/"/g, '""') + '"';
        }
        
        return cell;
      })
      .join(",");
    csvContent += row + "\n";
  });

  // Write to CSV file
  fs.writeFileSync(outputPath, csvContent, 'utf8');
  
  console.log(`CSV file created successfully at: ${outputPath}`);
  return outputPath;
}

// Additional utility function for MindsDB-specific CSV format
export function createMindsDBNotesCSV(notes, outputPath = "./notes_data.csv") {
  // Transform notes to MindsDB-optimized format
  const notesData = notes.map((note, index) => ({
    id: note.id || index + 1,
    note_title: note.title,
    note_content: note.content,
    note_category: note.category,
    note_created_at: note.createdAt || new Date().toISOString(),
    // note_updated_at: note.updatedAt || new Date().toISOString(),
    // note_tags: Array.isArray(note.tags) ? note.tags.join(';') : '', // Use semicolon for tags
    // word_count: note.content ? note.content.split(' ').length : 0
  }));

  return createCSVFromJSON(notesData, outputPath);
}
