import "server-only";

import mammoth from "mammoth";
import { extractText } from "unpdf";

const MINIMUM_RESUME_TEXT = 200;

function cleanText(value: string) {
  return value.replace(/\u0000/g, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

export async function extractResumeText(file: Blob, storagePath: string) {
  const extension = storagePath.split(".").pop()?.toLowerCase();
  const arrayBuffer = await file.arrayBuffer();
  let text = "";

  if (extension === "pdf") {
    const result = await extractText(new Uint8Array(arrayBuffer), { mergePages: true });
    text = result.text;
  } else if (extension === "docx") {
    const result = await mammoth.extractRawText({ buffer: Buffer.from(arrayBuffer) });
    text = result.value;
  } else if (extension === "doc") {
    throw new Error("Legacy DOC files cannot be analyzed. Upload a PDF or DOCX version of this resume.");
  } else {
    throw new Error("This resume file type cannot be analyzed. Upload a PDF or DOCX file.");
  }

  const cleaned = cleanText(text);
  if (cleaned.length < MINIMUM_RESUME_TEXT) {
    throw new Error("Career OS could not extract enough text. If this is a scanned PDF, upload a text-based PDF or DOCX file.");
  }

  return cleaned;
}
