import { MailPNG } from "@/assets/images";
import { ArrowBack, Button, Input } from "@/components";
import { useAuth, useError } from "@/hooks";
import {
  changeEmailSchema,
  type ChangeEmailFormType,
} from "@/schemas/profile.schema";
import { ROUTES } from "@/shared/constants/routes";
import { ERRORS_TEXT, TEXT } from "@/shared/constants/text";
import { ResentEmailType } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

export const ChangeEmail = () => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid, isDirty },
  } = useForm<ChangeEmailFormType>({
    mode: "onChange",
    resolver: zodResolver(changeEmailSchema),
    defaultValues: { newEmail: "", password: "" },
  });

  const { changeEmail } = useAuth();
  const { setToastErrorText } = useError();
  const navigate = useNavigate();

  const onSubmit = async (data: ChangeEmailFormType) => {
    try {
      await changeEmail({ newEmail: data.newEmail, password: data.password });
      navigate(ROUTES.sentEmail, {
        state: {
          email: data.newEmail,
          type: ResentEmailType.changeEmail,
          password: data.password,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("auth/invalid-credential")) {
          setToastErrorText(ERRORS_TEXT.invalid_credentials);
          return;
        }
      }
      setToastErrorText(ERRORS_TEXT.something_went_wrong);
    }
  };

  return (
    <div className="flex items-center justify-center mt-20 flex-col gap-6 max-w-sm mx-auto">
      <ArrowBack />
      <img className="w-[80px] h-[80px]" src={MailPNG} alt="Change phone" />
      <div className="flex-col text-center gap-1">
        <p className="text-title">{TEXT.change_email}</p>
      </div>
      <div className="w-full border-t border-[#ECE5EF]" />
      <div className="w-full flex flex-col gap-2">
        <Controller
          control={control}
          name="newEmail"
          render={({ field: { value, onChange } }) => (
            <>
              <Input
                value={value}
                onChange={onChange}
                label={TEXT.new_email}
                placeholder={TEXT.enter_new_email}
                error={errors.newEmail?.message}
                type="email"
              />
            </>
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field: { value, onChange } }) => (
            <>
              <Input
                value={value}
                onChange={onChange}
                label={TEXT.current_password}
                placeholder={TEXT.enter_current_password}
                error={errors.password?.message}
                type="password"
              />
            </>
          )}
        />
      </div>

      <Button
        title={TEXT.continue}
        rightIcon={<ArrowRight size={16} color="#5A4886" />}
        onClick={handleSubmit(onSubmit)}
        disabled={!(isDirty && isValid)}
        isLoading={isSubmitting}
      />
    </div>
  );
};
