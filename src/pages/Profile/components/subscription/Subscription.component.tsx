import { TEXT } from "@/shared/constants/text";

type Props = {
  autoRenew: boolean;
  toggleSubscription: () => void;
  renewSubscription: () => void;
};

export const SubscriptionSettings = ({
  autoRenew,
  renewSubscription,
  toggleSubscription,
}: Props) => {
  return (
    <>
      {autoRenew ? (
        <div className="flex justify-between items-center">
          <p className="text-subtitle text-xl text-black">
            {TEXT.subscription}
          </p>
          <button
            className="
                            w-[177px]
                            rounded-xl
                            bg-white
                            px-[20px] py-[12px]
                            text-sm font-medium 
                            flex items-center justify-center gap-2
                            border border-[#ECE5EF]
                            hover:bg-[#F3DFFF]
                            transition
                            cursor-pointer
                        "
            onClick={toggleSubscription}
          >
            <span className="text-[#594C5D]">{TEXT.cancel_subscription}</span>
          </button>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <p className="text-subtitle text-xl text-black">
            {TEXT.subscription}
          </p>
          <button
            className="
                            w-[177px]
                            rounded-xl
                            bg-white
                            px-[20px] py-[12px]
                            text-sm font-medium 
                            flex items-center justify-center gap-2
                            border border-[#ECE5EF]
                            hover:bg-[#F3DFFF]
                            transition
                            cursor-pointer
                        "
            onClick={renewSubscription}
          >
            <span className="text-[#594C5D]">{TEXT.cancel_subscription}</span>
          </button>
        </div>
      )}
    </>
  );
};
