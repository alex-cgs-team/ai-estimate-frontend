import { MagicTrickPNG } from "@/assets/images";
import { Button, Input } from "@/components";
import { useAuth, useError } from "@/hooks";
import {
  forgotPasswordEmailSchema,
  type ForgotPasswordEmailFormType,
} from "@/schemas/profile.schema";
import { ROUTES } from "@/shared/constants/routes";
import { ERRORS_TEXT, TEXT } from "@/shared/constants/text";
import { ResentEmailType } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

export const ForgotPassword = () => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid, isDirty },
  } = useForm<ForgotPasswordEmailFormType>({
    mode: "onChange",
    resolver: zodResolver(forgotPasswordEmailSchema),
    defaultValues: { email: "" },
  });

  const { sendForgotPassword } = useAuth();
  const { setToastErrorText } = useError();

  const navigate = useNavigate();

  const onSubmit = async (data: ForgotPasswordEmailFormType) => {
    try {
      await sendForgotPassword(data.email);
      navigate(ROUTES.sentEmail, {
        state: {
          email: data.email,
          type: ResentEmailType.forgotPassword,
        },
      });
    } catch {
      setToastErrorText(ERRORS_TEXT.something_went_wrong);
    }
  };

  return (
    <div className="flex items-center justify-center mt-20 flex-col gap-6 max-w-sm mx-auto">
      <img src={MagicTrickPNG} alt="Magic trick" />
      <div className="flex-col text-center gap-1">
        <p className="text-title">{TEXT.recover_password}</p>
      </div>
      <div className="w-full">
        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange } }) => (
            <>
              <Input
                value={value}
                onChange={onChange}
                label={TEXT.email}
                placeholder={TEXT.enter_email}
                error={errors.email?.message}
                type="email"
              />
            </>
          )}
        />
        <Button
          title={TEXT.continue}
          rightIcon={<ArrowRight size={16} color="#5A4886" />}
          onClick={handleSubmit(onSubmit)}
          disabled={!(isDirty && isValid)}
          className="mt-4"
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
};
