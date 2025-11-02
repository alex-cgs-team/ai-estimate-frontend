import { Logo } from "@/assets/icons";
import { CreditIconPNG, UserProfilePNG } from "@/assets/images";
import { useAuth } from "@/hooks";
import { FREE_LIMIT } from "@/shared/config/config";
import { TEXT } from "@/shared/constants/text";

export default function Header() {
  const { profile, user } = useAuth();

  console.log(profile);
  return (
    <header className="px-5 shadow-sm h-12 flex items-center justify-between">
      <Logo />
      {user && profile && (
        <div className="flex gap-3">
          <div className="border border-[#E5EBEF] px-3 py-2 flex items-center justify-center rounded-xl gap-2 cursor-pointer">
            <img src={CreditIconPNG} alt="credit icon" />
            <p className="text-body">
              {profile.usage?.paid && profile.usage.status === "active"
                ? TEXT.unlimited
                : `${FREE_LIMIT - (profile.usage ? profile.usage?.count : 0)}`}
            </p>
          </div>

          <div className="border border-[#E5EBEF] px-3 py-2 flex items-center justify-center rounded-xl gap-2 cursor-pointer">
            <img src={UserProfilePNG} alt="User profile" />
            <p className="text-body">{profile.name}</p>
          </div>
        </div>
      )}
    </header>
  );
}
