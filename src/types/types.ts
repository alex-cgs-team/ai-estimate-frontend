export interface IProfile {
  name: string;
  role: string;
  usage?: {
    count: number;
    paid?: boolean;
    status?: string;
    subscriptionId?: string;
    autoRenew?: boolean;
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

export type SentEmailType = "verifyEmail" | "forgotPassword" | "changeEmail";

export const ResentEmailType = {
  verifyEmail: "verifyEmail",
  forgotPassword: "forgotPassword",
  changeEmail: "changeEmail",
} as const;

export type ResentEmailType =
  (typeof ResentEmailType)[keyof typeof ResentEmailType];
