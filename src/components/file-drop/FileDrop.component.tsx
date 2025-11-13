import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FolderPNG } from "@/assets/images";
import { TEXT } from "@/shared/constants/text";
import { useError } from "@/hooks";

type Props = {
  onFiles?: (files: File[]) => void;
  accept?: { [mime: string]: string[] };
  maxFiles?: number;
  disabled?: boolean;
  imgDisabled?: boolean;
  textDisabled?: boolean;
};

export function FileDropzone({
  onFiles,
  accept,
  maxFiles = 10,
  disabled = false,
  imgDisabled,
  textDisabled,
}: Props) {
  const { setToastErrorText } = useError();

  const getExtension = (file: File) =>
    file.name.slice(file.name.lastIndexOf(".") + 1).toLowerCase();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      let isLimit = false;
      acceptedFiles.forEach((file) => {
        const ext = getExtension(file);

        if (["png", "jpg", "jpeg"].includes(ext)) {
          if (imgDisabled) {
            isLimit = true;
            setToastErrorText(TEXT.img_files_limit);
            return;
          }
        } else if (["pdf", "csv"].includes(ext)) {
          if (textDisabled) {
            isLimit = true;
            setToastErrorText(TEXT.text_files_limit);
            return;
          }
        } else if (["doc", "docx"].includes(ext)) {
          if (textDisabled) {
            isLimit = true;
            setToastErrorText(TEXT.text_files_limit);
            return;
          }
        }
      });
      if (isLimit) {
        return;
      }

      onFiles?.(acceptedFiles);
    },
    [onFiles, imgDisabled, textDisabled, setToastErrorText]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    disabled,
    noClick: true,
    noKeyboard: true,
  });

  return (
    <div className="w-full">
      <p className="text-sm font-medium text-gray-700 mb-1">Files</p>

      <div
        {...getRootProps()}
        onClick={open}
        className={[
          "flex flex-col items-center justify-center text-center",
          "rounded-xl border-2 border-dashed px-4 py-8",
          "transition-colors duration-150 cursor-pointer",
          disabled
            ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
            : isDragActive
            ? "border-violet-400 bg-violet-50/40"
            : "border-gray-300 bg-white",
        ].join(" ")}
      >
        <input {...getInputProps()} />

        <img src={FolderPNG} alt="folder" />

        <p className="text-subtitle text-gray-600">
          {isDragActive ? TEXT.drop_here : TEXT.drag_and_drop}
        </p>

        <p className="mt-1 text-subtitle text-violet-600 hover:underline disabled:text-gray-400">
          {TEXT.choose_files}
        </p>
      </div>
    </div>
  );
}
