import { MagicTrickPNG } from "@/assets/images";
import { Button, GoogleButton, Input } from "@/components";
import { useError } from "@/hooks";
import { useAuth } from "@/hooks/useAuth.hook";
import { signUpSchema, type SignUpFormType } from "@/schemas/onboarding.schema";
import { ROUTES } from "@/shared/constants/routes";
import { ERRORS_TEXT, TEXT } from "@/shared/constants/text";
import { ResentEmailType } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

export const SignUp = () => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid, isDirty },
  } = useForm<SignUpFormType>({
    mode: "onChange",
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const { createUserWithEmailPassword } = useAuth();
  const { setToastErrorText } = useError();
  const navigate = useNavigate();

  const onSubmit = async (data: SignUpFormType) => {
    if (data.password !== data.confirmPassword) {
      setToastErrorText(ERRORS_TEXT.passwords_do_not_match);
      return;
    }
    try {
      await createUserWithEmailPassword({
        email: data.email,
        password: data.password,
      });
      navigate(ROUTES.sentEmail, {
        state: {
          email: data.email,
          type: ResentEmailType.verifyEmail,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("auth/email-already-in-use")) {
          setToastErrorText(ERRORS_TEXT.email_already_in_use);
          return;
        }
      }
      setToastErrorText(ERRORS_TEXT.something_went_wrong);
    }
  };

  return (
    <div className="flex items-center justify-center mt-20 flex-col gap-4 max-w-sm mx-auto px-4">
      <img src={MagicTrickPNG} alt="Magic trick" />
      <div className="flex-col text-center gap-1">
        <p className="text-title">{TEXT.create}</p>
      </div>
      <div className="w-full flex flex-col gap-2">
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
        <Controller
          control={control}
          name="password"
          render={({ field: { value, onChange } }) => (
            <>
              <Input
                value={value}
                onChange={onChange}
                label={TEXT.password}
                placeholder={TEXT.enter_password}
                error={errors.password?.message}
                type="password"
              />
            </>
          )}
        />
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { value, onChange } }) => (
            <>
              <Input
                value={value}
                onChange={onChange}
                label={TEXT.confirm_password}
                placeholder={TEXT.confirm_password}
                error={errors.confirmPassword?.message}
                type="password"
              />
            </>
          )}
        />
      </div>
      <div className="w-full">
        <Button
          title={TEXT.log_in}
          rightIcon={<ArrowRight size={16} color="#5A4886" />}
          onClick={handleSubmit(onSubmit)}
          disabled={!(isDirty && isValid)}
          isLoading={isSubmitting}
        />
        <div className="flex justify-center gap-1 mt-3">
          <p className="text-subtitle">{TEXT.already_have}</p>
          <Link
            className="text-subtitle text-[#A36FD1] font-medium"
            to={ROUTES.welcome}
          >
            {TEXT.log_in_text}
          </Link>
        </div>
        <div className="w-full mt-3 flex flex-col gap-3">
          <div className="flex items-center w-full gap-3">
            <div className="w-full h-px bg-[#F4D8FF]" />
            <p className="text-subtitle">{TEXT.or}</p>
            <div className="w-full h-px bg-[#F4D8FF]" />
          </div>
          <GoogleButton />
        </div>
      </div>
    </div>
  );
};
