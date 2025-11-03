import { ROUTES } from "@/shared/constants/routes";
import { TEXT } from "@/shared/constants/text";
import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="flex justify-center items-center gap-6 py-3">
      <p className="text-footer">
        {TEXT.ai_estimate} {currentYear}
      </p>
      <Link to={ROUTES.privacyPolice} className="text-footer cursor-pointer">
        {TEXT.privacy_police}
      </Link>

      <Link to={ROUTES.termsOfUse} className="text-footer cursor-pointer">
        {TEXT.terms_of_use}
      </Link>
    </footer>
  );
}
