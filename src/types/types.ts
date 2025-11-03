export interface IProfile {
  name: string;
  role: string;
  usage?: {
    count: number;
    paid?: boolean;
    status?: string;
    subscriptionId?: string;
  };
}

export type ISaveProfile = Omit<IProfile, "usage">;

export type FileKind = "image" | "text";

export type FileEntry = {
  id: string;
  file: File;
  kind: FileKind;
  fileType: string;
  description: string;
};

export type UseModalReturn = {
  toggle: () => void;
  isVisible: boolean;
  close: () => void;
};
