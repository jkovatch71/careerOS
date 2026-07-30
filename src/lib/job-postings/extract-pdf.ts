import "server-only";

import { extractText } from "unpdf";

export const MAX_JOB_DESCRIPTION_PDF_SIZE = 3 * 1024 * 1024;
const MINIMUM_JOB_DESCRIPTION_TEXT = 200;
const MAXIMUM_JOB_DESCRIPTION_TEXT = 30_000;

function cleanText(value: string) {
  return value
    .replace(/\u0000/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function extractJobDescriptionPdf(value: unknown) {
  if (!(value instanceof File)) throw new Error("Choose a PDF job description.");
  const file = value;
  if (file.size === 0) throw new Error("Choose a PDF job description.");
  if (file.size > MAX_JOB_DESCRIPTION_PDF_SIZE) {
    throw new Error("Choose a PDF no larger than 3 MB.");
  }
  if (
    (file.type && file.type !== "application/pdf") ||
    !file.name.toLocaleLowerCase("en-US").endsWith(".pdf")
  ) {
    throw new Error("Choose a PDF job description.");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const signature = new TextDecoder("ascii").decode(bytes.slice(0, 5));
  if (signature !== "%PDF-") throw new Error("That file is not a valid PDF.");

  let extractedText = "";
  try {
    const result = await extractText(bytes, { mergePages: true });
    extractedText = result.text;
  } catch {
    throw new Error("Career OS could not read that PDF.");
  }

  const cleaned = cleanText(extractedText);
  if (cleaned.length < MINIMUM_JOB_DESCRIPTION_TEXT) {
    throw new Error(
      "Career OS could not extract enough text. If this is a scanned PDF, copy and paste the job description instead.",
    );
  }
  if (cleaned.length > MAXIMUM_JOB_DESCRIPTION_TEXT) {
    throw new Error(
      "That PDF contains more than 30,000 characters. Copy the relevant job description and use Paste posting instead.",
    );
  }

  return cleaned;
}
