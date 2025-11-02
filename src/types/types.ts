export interface IProfile {
  name: string;
  role: string;
}

export type FileKind = "image" | "text";

export type FileEntry = {
  id: string;
  file: File;
  kind: FileKind;
  fileType: string;
  description: string;
};
