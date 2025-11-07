import { useState, useEffect } from "react";
import { ref as dbRef, onValue, query, limitToLast } from "firebase/database";
import { rtdb } from "@/firebase";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth, useError } from "@/hooks";
import { LoadingPNG } from "@/assets/images";
import { ERRORS_TEXT, TEXT } from "@/shared/constants/text";
import { toast } from "react-toastify";
import { ArrowBack, Button } from "@/components";
import { ArrowRight } from "lucide-react";
import { ROUTES } from "@/shared/constants/routes";

type Step = { step: string; status?: string; progress?: number };

export const Progress = () => {
  const location = useLocation();
  const executionId = location.state?.executionId as string | undefined;

  const [current, setCurrent] = useState<Step | null>(null);
  const [error, setError] = useState(false);
  const [showMsgAboutCount, setShowMsgAboutCount] = useState(false);

  const { user, profile, decreaseUsage } = useAuth();
  const { setIsN8NError } = useError();

  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !executionId) return;
    setError(false);

    const opsQuery = query(
      dbRef(rtdb, `profiles/${user.uid}/estimates/${executionId}/operations`),
      limitToLast(1)
    );
    const unsubOps = onValue(opsQuery, (snap) => {
      let last: Step | null = null;
      snap.forEach((child) => {
        const v = child.val();
        last =
          v && typeof v === "object"
            ? { step: String(v.step), status: v.status, progress: v.progress }
            : { step: String(v) };
      });
      // @ts-expect-error TODO - rewrite all statuses and steps
      if (last && last.status === "failed") {
        setError(true);
        setIsN8NError(true);
        decreaseUsage();
        if (!profile?.usage?.paid) {
          setShowMsgAboutCount(true);
        }
      }
      setCurrent(last);
    });

    return () => {
      unsubOps();
    };
  }, [user, executionId]);

  const progressPct = current?.progress ?? 5;

  const title = current?.status || TEXT.analyze_files;

  const isReady = progressPct === 100;

  const link = isReady ? title : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success(TEXT.link_was_copied);
    } catch {
      toast.error(ERRORS_TEXT.copy_error);
    }
  };

  const openLink = () => {
    if (!link) return;
    window.open(link, "_blank", "noopener");
  };

  return (
    <div className="flex items-center justify-center mt-20 flex-col gap-2">
      {isReady && <ArrowBack />}
      <img src={LoadingPNG} alt="Loading" />
      {error ? (
        <div className="flex flex-col gap-2">
          <div className="text-subtitle text-center text-red-500 p-4">
            <p>{ERRORS_TEXT.something_went_wrong}</p>
            <p>{ERRORS_TEXT.working_on_it}</p>
          </div>
          <div>
            {showMsgAboutCount && (
              <p className="text-subtitle text-center">{TEXT.we_wont_deduct}</p>
            )}
          </div>
          <Button
            onClick={() => navigate(ROUTES.main)}
            title={TEXT.try_again}
          />
        </div>
      ) : (
        <div className="flex flex-col text-center gap-4">
          <p className="text-title">
            {isReady ? TEXT.link_is_ready : TEXT.estimating_process}
          </p>

          {isReady ? (
            <div className="flex flex-col gap-3">
              <div className="rounded-xl border border-[#F1F3F8] p-3 flex justify-between w-[360px]">
                <a href={link} target="_blank">
                  <p className="text-subtitle text-gray-600 w-[250px] truncate text-ellipsis overflow-hidden whitespace-nowrap cursor-pointer">
                    {title}
                  </p>
                </a>
                <p
                  onClick={handleCopy}
                  className="text-subtitle text-purple-400 font-medium cursor-pointer"
                >
                  {TEXT.copy}
                </p>
              </div>
              <Button
                title={TEXT.go_to_your_file}
                rightIcon={<ArrowRight size={16} color="white" />}
                onClick={openLink}
              />
            </div>
          ) : (
            <div className="relative w-[360px] rounded-2xl p-4 bg-white flex justify-between items-center">
              <div className="flex items-center justify-start w-[200px]">
                <span className="text-subtitle text-gray-600 truncate text-ellipsis overflow-hidden whitespace-nowrap ">
                  {title}
                </span>
              </div>
              <span className="text-gray-600 text-subtitle ">
                {progressPct}%
              </span>

              <svg
                className="absolute inset-0 pointer-events-none"
                viewBox="0 0 100 20"
                preserveAspectRatio="none"
              >
                <rect
                  x="1"
                  y="1"
                  width="98"
                  height="13"
                  rx="4"
                  ry="4"
                  fill="none"
                  stroke="#E8EAF2"
                  strokeWidth="1"
                />
                <rect
                  x="1"
                  y="1"
                  width="98"
                  height="13"
                  rx="4"
                  ry="4"
                  fill="none"
                  stroke="#C084F7"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeDasharray="60 340"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="0"
                    to="-400"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </rect>
              </svg>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
