import { MobilePNG } from "@/assets/images";
import { TEXT } from "@/shared/constants/text";
import { useLocation } from "react-router-dom";

export const SentEmail = () => {
  const location = useLocation();
  const emailToCheck = location.state?.email;

  return (
    <div className="flex items-center justify-center mt-20 flex-col gap-3 max-w-sm mx-auto">
      <img src={MobilePNG} alt="Magic trick" />
      <div className="flex-col text-center gap-1 flex">
        <p className="text-title">{TEXT.check_out_email}</p>
        <p className="text-subtitle">{TEXT.we_have_sent_link}</p>
        <div className="flex justify-center items-center gap-1.5">
          <p className="bg-[#F4E0FF] text-subtitle text-[#594C5D] p-1 font-medium mt-1 inline-flex">
            {emailToCheck}
          </p>
        </div>
      </div>
    </div>
  );
};
