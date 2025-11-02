import { X, FileText } from "lucide-react";
import { Input } from "../input/Input.component";
import { TEXT } from "@/shared/constants/text";
import type { FileEntry } from "@/types/types";

type Props = {
  items: FileEntry[];
  onChangeDescription: (id: string, description: string) => void;
  onRemove: (id: string) => void;
};

export function FilesList({ items, onChangeDescription, onRemove }: Props) {
  if (items.length === 0) return null;

  return (
    <div className="w-full">
      <p className="text-sm font-medium text-gray-700 mb-2">Files</p>

      <ul className="space-y-2">
        {items.map((it) => (
          <li key={`${it.id}`} className="flex items-center gap-3">
            <div
              className="
                flex items-center gap-2 min-w-0
                rounded-xl border border-gray-300 bg-white
                px-3 py-2 text-sm text-gray-900
              "
            >
              <FileText size={16} className="shrink-0 text-gray-500" />
              <span className="truncate max-w-[180px]">{it.file.name}</span>
            </div>

            <Input
              value={it.description}
              onChange={(value) => onChangeDescription(it.id, value)}
              placeholder={TEXT.enter_file_desc}
            />

            <button className="cursor-pointer" onClick={() => onRemove(it.id)}>
              <X size={16} color="#6C6D71" />
            </button>
          </li>
        ))}
        {/* <button className="flex items-center gap-1 cursor-pointer">
          <Plus size={16} color="#9A55BF" />
          <p className="text-subtitle text-[#9A55BF]">{TEXT.add_new_files}</p>
        </button> */}
      </ul>
    </div>
  );
}
