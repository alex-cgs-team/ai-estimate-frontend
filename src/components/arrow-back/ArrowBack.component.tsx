import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const ArrowBack = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div
      onClick={handleBack}
      className="w-10 h-10 rounded-xl border border-gray-200 flex justify-center items-center cursor-pointer hover:bg-gray-100 transition absolute left-8 top-16"
    >
      <ArrowLeft size={16} color="#0F0F0F" />
    </div>
  );
};
