#!/usr/bin/env tsx

import { mkdir, writeFile } from "node:fs/promises"
import { dirname } from "node:path"

const { CREAO_TEMPORARY_TOKEN, CREAO_API_BASE_URL } = process.env
if (!CREAO_TEMPORARY_TOKEN || !CREAO_API_BASE_URL) {
  console.error("Error: cannot download code snippet. User not authenticated.");
  process.exit(1);
}

const sourceIds = process.argv.slice(2).map(x => x.trim()).filter(Boolean)
if (sourceIds.length === 0) {
  console.error("Error: no code snippet name provided.");
  process.exit(1);
}

interface APIResponse {
  missingSourceIds: string[];
  snippets: {
    _id?: string | undefined;
    isPublic?: boolean | undefined;
    userId?: string | undefined;
    sourceId: string;
    name: string;
    prompt: string;
    files: {
      [x: string]: string;
    };
    status: "active" | "disabled";
    createdAt: string;
    updatedAt: string;
  }[];
}

async function main() {
  const response = await fetch(`${CREAO_API_BASE_URL}/code-snippets/fetch`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${CREAO_TEMPORARY_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sourceIds: sourceIds,
    }),
  }).then(res => res.json()) as APIResponse;
  if (!response.snippets?.length) {
    console.error("no code snippet found in server, please generate them from scratch.");
    process.exit(1);
  }

  // --------------------------
  console.log(`✅ Found ${response.snippets.length} code snippets from server: ${response.snippets.map(x => x.name).join(", ")}`);
  for (const snippet of response.snippets) {
    console.log('')
    console.log(`## downloaded: ${snippet.name}`);

    console.log('<files>')
    for (const [filePath, fileContent] of Object.entries(snippet.files)) {
      await mkdir(dirname(filePath), { recursive: true });
      await writeFile(filePath, fileContent);
      console.log(`${filePath}`);
    }
    console.log('</files>')

    console.log('<usage>')
    console.log(snippet.prompt);
    console.log('</usage>')
  }

  if (response.missingSourceIds.length > 0) {
    console.log('')
    console.error(`⚠️ missing these resources, please generate them from scratch: ${response.missingSourceIds.join(", ")}`);
  }
}

main().catch(err => {
  console.error(`Failed to download code snippet: ${err}`);
  process.exit(1);
});
