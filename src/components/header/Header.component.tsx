import { Logo } from "@/assets/icons";
import { CreditIconPNG, UserProfilePNG } from "@/assets/images";
import { useAuth } from "@/hooks";
import { FREE_LIMIT } from "@/shared/config/config";
import { ROUTES } from "@/shared/constants/routes";
import { TEXT } from "@/shared/constants/text";
import { ChevronRight, File, LogOutIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { profile, user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (
        !btnRef.current?.contains(e.target as Node) &&
        !menuRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const creditsLeft = Math.max(0, FREE_LIMIT - (profile?.usage?.count ?? 0));
  const isUnlimited =
    profile?.usage?.paid && profile?.usage?.status === "active";

  if (!user || !profile) {
    return (
      <header className="px-5 shadow-sm h-12 flex items-center justify-between">
        <Logo />
      </header>
    );
  }

  return (
    <header className="px-5 shadow-sm h-12 flex items-center justify-between">
      <Logo />

      <div className="flex gap-3 items-center">
        {/* Credits pill */}
        <div className="border border-[#E5EBEF] px-3 py-2 flex items-center justify-center rounded-xl gap-2">
          <img src={CreditIconPNG} alt="credit icon" />
          <p className="text-body">
            {isUnlimited ? TEXT.unlimited : `${creditsLeft}`}
          </p>
        </div>

        {/* User pill + dropdown */}
        <div className="relative">
          <div
            ref={btnRef}
            role="button"
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="select-none border border-[#E5EBEF] px-3 py-2 flex items-center rounded-xl gap-2 cursor-pointer"
          >
            <img src={UserProfilePNG} alt="User profile" />
            <p className="text-body">{profile.name}</p>
          </div>

          {open && (
            <div
              ref={menuRef}
              role="menu"
              className="absolute right-0 mt-2 w-64 rounded-2xl border border-[#E5EBEF] bg-white shadow-lg p-2 z-50"
            >
              <div className="px-3 py-2">
                <p className="text-sm font-medium">{profile.name}</p>
                {user.phoneNumber && (
                  <p className="text-body text-gray-500">{user.phoneNumber}</p>
                )}
              </div>

              <button
                className="w-full text-sm font-medium mt-1 rounded-xl border border-[#E5EBEF] hover:bg-[#EDF2FF] py-2 cursor-pointer"
                onClick={() => {
                  setOpen(false);
                  navigate(ROUTES.profile);
                }}
              >
                {TEXT.view_profile}
              </button>

              <div className="my-2 h-px bg-[#F1F3F8]" />

              <a
                href="/privacy"
                className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#F6F8FE] text-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="flex items-center gap-2">
                  <File size={16} color="#0F0F0F" />
                  <span className="text-body">{TEXT.privacy_police}</span>
                </div>
                <ChevronRight size={16} color="#0F0F0F" />
              </a>

              <a
                href="/terms"
                className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#F6F8FE] text-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="flex items-center gap-2">
                  <File size={16} color="#0F0F0F" />
                  <span className="text-body">{TEXT.terms_of_use}</span>
                </div>

                <ChevronRight size={16} color="#0F0F0F" />
              </a>

              <div className="my-2 h-px bg-[#F1F3F8]" />

              <button
                className="flex items-center gap-2 px-3 py-2 text-sm w-full rounded-lg hover:bg-[#FFF5F5] cursor-pointer justify-between"
                onClick={signOut}
              >
                <div className="flex items-center gap-2">
                  <LogOutIcon size={16} color="#0F0F0F" />
                  <span className="text-subtitle">{TEXT.log_out}</span>
                </div>
                <ChevronRight size={16} color="#0F0F0F" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
