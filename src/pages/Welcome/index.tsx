import { MagicTrickPNG } from "@/assets/images";
import { Welcome } from "@/components";
import { TEXT } from "@/shared/constants/text";

export const WelcomePage = () => {
  return (
    <div className="flex items-center justify-center mt-20 flex-col gap-6 max-w-sm mx-auto px-4">
      <img src={MagicTrickPNG} alt="Magic trick" />
      <div className="flex-col text-center gap-1">
        <p className="text-title">{TEXT.welcome}</p>
        <p className="text-subtitle">{TEXT.elevate}</p>
      </div>
      <div className="w-full border-t border-gray-200" />
      <Welcome />
    </div>
  );
};
