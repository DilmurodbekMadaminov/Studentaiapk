import * as pdfjsLib from "pdfjs-dist";
// @ts-ignore
import * as mammoth from "mammoth";
import { getAbsoluteApiUrl } from "./apiConfig";

const version = pdfjsLib.version || "4.10.38";
const cdnUrl = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.mjs`;

// Set default worker source initially
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = cdnUrl;
} catch (e) {
  console.warn("Could not set initial workerSrc:", e);
}

// Bypassing CORS web worker restriction (especially on mobile devices/iFrame) by serving native worker at root
async function ensureWorkerLoaded() {
  try {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    
    // Check if we are running in a restricted sandbox or secure iframe environment
    if (!origin || origin === "null" || origin.startsWith("file:")) {
      console.warn("[PDF.js] Restrictive origin detected, using Blob fallback option.");
      throw new Error("Sandbox/file origin detected");
    }

    // Set workerSrc directly to the same-origin static file
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    console.log("[PDF.js] Worker setup successfully using same-origin static path: /pdf.worker.min.mjs");
  } catch (error: any) {
    console.warn("[PDF.js] Failed setting up direct worker path, attempting Blob backup setup:", error.message || error);
    try {
      if (pdfjsLib.GlobalWorkerOptions.workerSrc && pdfjsLib.GlobalWorkerOptions.workerSrc.startsWith("blob:")) {
        return; // Already loaded from blob
      }

      // Fetch the static worker code to pack into a Blob URL (which works inside sandboxed iframes)
      const primaryUrl = "/pdf.worker.min.mjs";
      let text = "";
      try {
        const response = await fetch(primaryUrl);
        if (response.ok) {
          text = await response.text();
        }
      } catch (fetchErr) {
        console.warn("[PDF.js] Same-origin fetch failed, falling back to CDN fetch.");
      }

      if (!text || text.length < 5000) {
        const cdnResponse = await fetch(cdnUrl, { mode: "cors" });
        if (cdnResponse.ok) {
          text = await cdnResponse.text();
        }
      }

      if (text && text.length > 50000) {
        const blob = new Blob([text], { type: "application/javascript" });
        const blobUrl = URL.createObjectURL(blob);
        pdfjsLib.GlobalWorkerOptions.workerSrc = blobUrl;
        console.log("[PDF.js] Blob-wrapped Same-Origin Worker loaded successfully.");
      } else {
        throw new Error("Could not fetch valid worker code.");
      }
    } catch (fallbackError: any) {
      console.error("[PDF.js] Blob fallback failed, falling back to direct CDN string url:", fallbackError);
      pdfjsLib.GlobalWorkerOptions.workerSrc = cdnUrl;
    }
  }
}

export async function extractTextFromPdf(file: File): Promise<string[]> {
  try {
    // Ensure worker is loaded safely bypassing cross-origin security errors on other devices
    await ensureWorkerLoaded();

    let arrayBuffer: ArrayBuffer;
    if (typeof file.arrayBuffer === "function") {
      arrayBuffer = await file.arrayBuffer();
    } else {
      arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
      });
    }

    let pdf;
    try {
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      pdf = await loadingTask.promise;
    } catch (workerError: any) {
      console.error("[PDF.js] Worker initialization failed or security flag triggered. Emulating main-thread fake worker...", workerError);
      try {
        // Disable workerSrc to force PDF.js into synchronous main-thread (fake worker) execution mode
        pdfjsLib.GlobalWorkerOptions.workerSrc = "";
      } catch (e) {}
      
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      pdf = await loadingTask.promise;
    }

    // Process pages in batches to avoid OOM on mobile devices
    const pageTexts: string[] = [];
    const batchSize = 15;

    for (let i = 1; i <= pdf.numPages; i += batchSize) {
      const batchPromises = [];
      for (let j = i; j < i + batchSize && j <= pdf.numPages; j++) {
        batchPromises.push(
          (async () => {
            const page = await pdf.getPage(j);
            const textContent = await page.getTextContent();

            let lastY: number | null = null;
            let text = "";

            for (const item of textContent.items) {
              if (!("str" in item)) continue;

              const y = item.transform[5];
              if (lastY !== null && Math.abs(y - lastY) > 5) {
                text += "\n"; // New line
              } else if (lastY !== null) {
                text += " "; // Same line
              }
              text += item.str;
              lastY = y;
            }
            return text;
          })(),
        );
      }
      const batchResults = await Promise.all(batchPromises);
      pageTexts.push(...batchResults);
    }

    return pageTexts;
  } catch (error: any) {
    console.error("[PDF Extraction Error]:", error);
    throw new Error(`PDF matnini ajratib olishda xatolik: ${error.message || error}`);
  }
}

function splitIntoPages(text: string, charsPerPage: number = 2000): string[] {
  const paragraphs = text.split(/\n+/);
  const pages: string[] = [];
  let currentPage = "";

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;
    if (currentPage.length + trimmed.length > charsPerPage && currentPage.length > 0) {
      pages.push(currentPage.trim());
      currentPage = trimmed;
    } else {
      if (currentPage.length > 0) {
        currentPage += "\n\n" + trimmed;
      } else {
        currentPage = trimmed;
      }
    }
  }
  if (currentPage.length > 0) {
    pages.push(currentPage.trim());
  }

  if (pages.length === 0) {
    pages.push(text || "(Hujjat bo'sh)");
  }
  return pages;
}

export async function extractTextFromDocx(file: File): Promise<string[]> {
  try {
    let arrayBuffer: ArrayBuffer;
    if (typeof file.arrayBuffer === "function") {
      arrayBuffer = await file.arrayBuffer();
    } else {
      arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
      });
    }

    // @ts-ignore
    const mammothObj = mammoth.default || mammoth;
    const result = await mammothObj.extractRawText({ arrayBuffer });
    const text = result.value || "";
    
    return splitIntoPages(text, 2000);
  } catch (error: any) {
    console.error("[Word DOCX Extraction Error]:", error);
    throw new Error(`Word (.docx) hujjatidan matnni ajratib olishda xatolik: ${error.message || error}`);
  }
}

export async function extractTextFromDoc(file: File): Promise<string[]> {
  try {
    let arrayBuffer: ArrayBuffer;
    if (typeof file.arrayBuffer === "function") {
      arrayBuffer = await file.arrayBuffer();
    } else {
      arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
      });
    }

    const decoder = new TextDecoder("utf-8", { fatal: false });
    const rawText = decoder.decode(arrayBuffer);
    
    let cleanedText = rawText
      .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Filter out long nonsensical chunks often found in binary files
    cleanedText = cleanedText.replace(/[^\x20-\x7E\xA0-\xFF\u0400-\u04FF\u0100-\u017F\u0180-\u024F]{20,}/g, " ");
    cleanedText = cleanedText.replace(/\s+/g, " ").trim();

    if (cleanedText.length < 50) {
      throw new Error("Eski Word (.doc) faylidagi matn topilmadi. Iltimos, ushbu faylni .docx formatida qayta saqlab saqlab yuklang.");
    }
    
    return splitIntoPages(cleanedText, 2000);
  } catch (error: any) {
    console.error("[Word DOC Extraction Error]:", error);
    throw new Error(`Word (.doc) hujjatidan o'qishda xatolik: ${error.message || error}. Tavsiya: universal matn uchun .docx yoki .txt formatidan foydalaning.`);
  }
}

export async function extractTextFromPlainText(file: File): Promise<string[]> {
  try {
    const text = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file, "utf-8");
    });
    return splitIntoPages(text, 2000);
  } catch (error: any) {
    console.error("[Plain Text Extraction Error]:", error);
    throw new Error(`Matn faylini (.txt) o'qishda xatolik: ${error.message || error}`);
  }
}

export async function extractTextFromFile(file: File): Promise<string[]> {
  try {
    // Read file as base64 on the client
    const fileBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const commaIdx = result.indexOf(",");
        if (commaIdx !== -1) {
          resolve(result.substring(commaIdx + 1));
        } else {
          resolve(result);
        }
      };
      reader.onerror = () => reject(new Error("FileReader o'qishda xatolik"));
      reader.readAsDataURL(file);
    });

    console.log(`[Document Extraction] Fast parsing on server via backend APIs: "${file.name}"...`);
    const response = await fetch(getAbsoluteApiUrl("/api/parse-document"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileBase64, fileName: file.name }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.pages && Array.isArray(data.pages) && data.pages.length > 0) {
        console.log(`[Document Extraction] Server-side parsing completed successfully for "${file.name}": ${data.pages.length} pages parsed.`);
        return data.pages;
      }
    }
    console.warn("[Document Extraction] Server-side parsing did not succeed, falling back to local browser parser...");
  } catch (err: any) {
    console.warn("[Document Extraction] Request to server-side parser failed, trying local client-side parsing fallback:", err?.message || err);
  }

  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) {
    return extractTextFromPdf(file);
  } else if (name.endsWith(".docx")) {
    return extractTextFromDocx(file);
  } else if (name.endsWith(".doc")) {
    return extractTextFromDoc(file);
  } else if (
    name.endsWith(".txt") || 
    name.endsWith(".log") || 
    name.endsWith(".csv") || 
    name.endsWith(".json") || 
    name.endsWith(".xml") ||
    name.endsWith(".html") ||
    name.endsWith(".md")
  ) {
    return extractTextFromPlainText(file);
  } else {
    // Default fallback: Try to read as plain text
    return extractTextFromPlainText(file);
  }
}
