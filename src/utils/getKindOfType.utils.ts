import type { FileKind } from "@/types/types";

export const getKind = (f: File): FileKind => {
  const t = f.type.toLowerCase();
  if (t.startsWith("image/")) return "image";
  if (
    t === "application/pdf" ||
    t === "application/msword" ||
    t ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  )
    return "text";
  const ext = f.name.split(".").pop()?.toLowerCase();
  return ["png", "jpg", "jpeg"].includes(ext ?? "") ? "image" : "text";
};

export const getFileExt = (file: File) =>
  file.name.split(".").pop()?.toLowerCase() ?? "";
