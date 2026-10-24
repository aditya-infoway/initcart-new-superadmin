export const isValidFileType = (file: File) =>
  ["image/jpeg", "image/jpg", "image/png"].includes(file.type);

async function loadImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = rej;
    });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function cropAndCompress(
  file: File,
  w: number,
  h: number,
  maxKB: number,
  startQuality: number,
  minQuality: number,
): Promise<File> {
  const img = await loadImage(file);

  const targetRatio = w / h;
  let sw = img.width;
  let sh = img.height;
  if (sw / sh > targetRatio) sw = sh * targetRatio;
  else sh = sw / targetRatio;
  const sx = (img.width - sw) / 2;
  const sy = (img.height - sh) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);

  let quality = startQuality;
  let blob: Blob | null = null;
  while (quality > minQuality) {
    blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", quality));
    if (blob && blob.size / 1024 <= maxKB) break;
    quality -= 0.05;
  }
  if (!blob) throw new Error("Image processing failed");
  return new File([blob], file.name, { type: "image/jpeg" });
}

/** Icon: 200 x 200, max 100 KB */
export const compressImage = (file: File, size = 200, maxKB = 100) =>
  cropAndCompress(file, size, size, maxKB, 0.9, 0.3);

/** Banner: default 800 x 500, max 300 KB (SubCategory uses 600 x 1000) */
export const compressBanner = (file: File, w = 800, h = 500, maxKB = 300) =>
  cropAndCompress(file, w, h, maxKB, 0.92, 0.5);