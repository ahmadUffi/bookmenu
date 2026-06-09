import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { uploadConfig } from "@/lib/config";

const execFileAsync = promisify(execFile);

type PdfOptimizationResult = {
  body: Blob;
  optimized: boolean;
  originalBytes: number;
  outputBytes: number;
  skippedReason?: string;
};

function qpdfBinary() {
  return process.env.QPDF_BINARY_PATH || "qpdf";
}

export async function optimizePdfForUpload(file: File): Promise<PdfOptimizationResult> {
  const originalBytes = file.size;

  if (originalBytes < uploadConfig.pdfCompressionThresholdBytes) {
    return {
      body: file,
      optimized: false,
      originalBytes,
      outputBytes: originalBytes,
      skippedReason: "PDF is below the compression threshold.",
    };
  }

  const workDir = path.join(tmpdir(), `flipdulu-pdf-${randomUUID()}`);
  const inputPath = path.join(workDir, "input.pdf");
  const outputPath = path.join(workDir, "output.pdf");

  try {
    await mkdir(workDir, { recursive: true });
    await writeFile(inputPath, Buffer.from(await file.arrayBuffer()));

    await execFileAsync(qpdfBinary(), [
      inputPath,
      "--compress-streams=y",
      "--object-streams=generate",
      "--recompress-flate",
      "--compression-level=9",
      outputPath,
    ]);

    const optimizedBytes = await readFile(outputPath);

    if (optimizedBytes.byteLength <= 0) {
      return {
        body: file,
        optimized: false,
        originalBytes,
        outputBytes: originalBytes,
        skippedReason: "QPDF produced an empty output file.",
      };
    }

    if (optimizedBytes.byteLength >= originalBytes) {
      return {
        body: file,
        optimized: false,
        originalBytes,
        outputBytes: originalBytes,
        skippedReason: "QPDF output was not smaller than the original PDF.",
      };
    }

    return {
      body: new Blob([optimizedBytes], { type: "application/pdf" }),
      optimized: true,
      originalBytes,
      outputBytes: optimizedBytes.byteLength,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown QPDF error.";

    console.warn("PDF optimization skipped:", message);

    return {
      body: file,
      optimized: false,
      originalBytes,
      outputBytes: originalBytes,
      skippedReason: message,
    };
  } finally {
    await rm(workDir, { force: true, recursive: true });
  }
}
