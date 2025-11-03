import { ThumbUpPNG } from "@/assets/images";
import { Button } from "@/components";
import { ROUTES } from "@/shared/constants/routes";
import { TEXT } from "@/shared/constants/text";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const AllSet = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center mt-20 flex-col gap-6 max-w-sm mx-auto">
      <img src={ThumbUpPNG} alt="Notebook" />
      <div className="flex-col text-center gap-1">
        <p className="text-title">{TEXT.you_are_all_set}</p>
        <p className="text-subtitle">{TEXT.glad_to_see_you}</p>
      </div>
      <Button
        title={TEXT.start_journey}
        rightIcon={<ArrowRight size={16} color="white" />}
        onClick={() => navigate(ROUTES.main)}
      />
    </div>
  );
};
