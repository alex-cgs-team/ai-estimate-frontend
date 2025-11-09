import { NotebookPNG } from "@/assets/images";
import { ArrowBack, Button, DropDown, Input } from "@/components";
import { useAuth } from "@/hooks";
import { ERRORS_TEXT, TEXT } from "@/shared/constants/text";
import { roles } from "@/shared/constants/variables";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingSchema } from "@/schemas/onboarding.schema";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes";
import { toast } from "react-toastify";

type FormValues = {
  name: string;
  role: string;
};

export const Onboarding = () => {
  const { saveProfile } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid, isDirty },
  } = useForm<FormValues>({
    mode: "onChange",
    resolver: zodResolver(onboardingSchema),
    defaultValues: { name: "", role: "" },
  });

  const navigate = useNavigate();

  const onSubmit = async (data: FormValues) => {
    try {
      await saveProfile({ name: data.name, role: data.role });
      navigate(ROUTES.allSet);
    } catch {
      toast.error(ERRORS_TEXT.something_went_wrong);
    }
  };

  return (
    <div className="flex items-center justify-center mt-20 flex-col gap-6 max-w-sm mx-auto">
      <ArrowBack />
      <img src={NotebookPNG} alt="Notebook" />
      <div className="flex-col text-center gap-1">
        <p className="text-title">{TEXT.tell_us}</p>
      </div>

      <Controller
        control={control}
        name="name"
        render={({ field: { value, onChange } }) => (
          <>
            <Input
              value={value}
              onChange={onChange}
              label={TEXT.your_name}
              placeholder={TEXT.enter_your_name}
              error={errors.name?.message}
            />
          </>
        )}
      />

      <Controller
        control={control}
        name="role"
        render={({ field: { value, onChange } }) => (
          <>
            <DropDown
              value={value}
              onChange={onChange}
              options={roles}
              label={TEXT.your_role}
              placeholder={TEXT.choose_role}
              error={errors.role?.message}
            />
            {errors.role && (
              <p className="text-sm text-red-500">{errors.role.message}</p>
            )}
          </>
        )}
      />

      {errors.root?.message && (
        <p className="text-sm text-red-500">{errors.root.message}</p>
      )}

      <Button
        title={TEXT.create_account}
        isLoading={isSubmitting}
        disabled={!(isDirty && isValid) || isSubmitting}
        onClick={handleSubmit(onSubmit)}
        rightIcon={<ArrowRight size={16} color="white" />}
      />
      <div className="flex justify-center">
        <p className="text-center text-subtitle font-medium">
          {TEXT.by_clicking}{" "}
          <span className="text-purple-400 cursor-pointer">
            {TEXT.privacy_police}
          </span>{" "}
          {TEXT.and}{" "}
          <span className="text-purple-400 cursor-pointer">
            {TEXT.terms_of_use}
          </span>
        </p>
      </div>
    </div>
  );
};
