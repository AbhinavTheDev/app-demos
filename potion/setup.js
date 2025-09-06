import { runQuery } from "./utils/utils.js";

const kbName = "notes_kb";
const agentName = "notes_assistant";

async function createNotesProject() {
  const query = "CREATE PROJECT IF NOT EXISTS notes_project;";
  const result = await runQuery(query);
  console.log("--------Project \n", result);
  if (result.success) {
    await createMLEngine();
  }
}

async function createMLEngine() {
  const query = `
    CREATE ML_ENGINE IF NOT EXISTS google_gemini_engine 
    FROM google_gemini 
    USING 
      api_key = '${process.env.google_api_key}';
  `;
  const result = await runQuery(query);
  console.log("\n------------ML Engine\n", result);
  return result;
}

export default async function setup() {
  return await createNotesProject();
}
