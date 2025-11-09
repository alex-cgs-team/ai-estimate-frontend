import { GlassPNG } from "@/assets/images";
import { ERRORS_TEXT, TEXT } from "@/shared/constants/text";
import { Button } from "../button/Button.component";
import { RefreshCcw } from "lucide-react";

type Props = {
  onClick: () => void;
  showDeductMsg?: boolean;
};

export const ErrorWarning = ({ onClick, showDeductMsg }: Props) => {
  return (
    <div className="flex items-center justify-center mt-20 flex-col gap-6 max-w-sm mx-auto px-4">
      <img src={GlassPNG} alt="Glass" />
      <div className="flex flex-col text-center gap-1">
        <p className="text-title">{ERRORS_TEXT.something_went_wrong}</p>
        <p className="text-subtitle">{ERRORS_TEXT.working_on_it}</p>
      </div>
      <div className="w-full border-t border-[#F4D8FF]" />

      <div className="w-full text-center flex flex-col gap-2">
        <Button
          title={TEXT.try_again}
          leftIcon={<RefreshCcw size={16} color="#5A4886" />}
          onClick={onClick}
        />
        {showDeductMsg && (
          <p className="text-subtitle">{TEXT.we_wont_deduct}</p>
        )}
      </div>
    </div>
  );
};
