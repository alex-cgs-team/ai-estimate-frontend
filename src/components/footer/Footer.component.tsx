import { TEXT } from "@/shared/constants/text";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="flex justify-center items-center gap-6 py-3">
      <p className="text-footer">
        {TEXT.ai_estimate} {currentYear}
      </p>
      <a className="text-footer cursor-pointer">{TEXT.privacy_police}</a>
      <a className="text-footer cursor-pointer">{TEXT.terms_of_use}</a>
    </footer>
  );
}
