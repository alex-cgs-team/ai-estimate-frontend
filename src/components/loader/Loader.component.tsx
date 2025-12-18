import { LoaderIcon } from "@/assets/icons";

export const Loader = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="animate-pulse">
        <LoaderIcon />
      </div>
    </div>
  );
};
