import { GlassPNG } from "@/assets/images";
import { ROUTES } from "@/shared/constants/routes";
import { TEXT } from "@/shared/constants/text";
import { Link } from "react-router-dom";

export const EmptyTable = () => {
  return (
    <div className="w-full flex justify-center flex-col items-center">
      <img src={GlassPNG} alt="Glass" />
      <div className="mt-6 flex flex-col gap-1 items-center">
        <p className="table-raw-text">{TEXT.hey_you_dont}</p>
        <Link
          to={ROUTES.main}
          className="table-raw-text text-[#A36FD1] underline-offset-4 hover:underline whitespace-nowrap"
        >
          {TEXT.estimate_your_product}
        </Link>
      </div>
    </div>
  );
};
