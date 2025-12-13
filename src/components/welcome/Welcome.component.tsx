import { auth, rtdb } from "@/firebase";
import { useError } from "@/hooks";
import { useAuth } from "@/hooks/useAuth.hook";
import { signInSchema, type SignInFormType } from "@/schemas/onboarding.schema";
import { ROUTES } from "@/shared/constants/routes";
import { ERRORS_TEXT, TEXT } from "@/shared/constants/text";
import { zodResolver } from "@hookform/resolvers/zod";
import { get, ref } from "firebase/database";
import { ArrowRight } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../button/Button.component";
import { GoogleButton } from "../google-button/GoogleButton.component";
import { Input } from "../input/Input.component";

export const Welcome = () => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid, isDirty },
  } = useForm<SignInFormType>({
    mode: "onChange",
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const { signInWithEmailPassword, resendVerifyEmail } = useAuth();
  const { setToastErrorText } = useError();
  const navigate = useNavigate();

  const onSubmit = async (data: SignInFormType) => {
    try {
      const user = await signInWithEmailPassword({
        email: data.email,
        password: data.password,
      });

      if (user.emailVerified) {
        const snap = await get(ref(rtdb, `profiles/${user.uid}`));
        if (snap.val()) {
          navigate(ROUTES.main);
        } else {
          navigate(ROUTES.onboarding);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Email didn't verified") {
          if (auth.currentUser) {
            try {
              await resendVerifyEmail(auth.currentUser);
            } catch {
              setToastErrorText(ERRORS_TEXT.something_went_wrong);
            }
          }
          setToastErrorText(ERRORS_TEXT.email_not_verified);
        } else {
          setToastErrorText(ERRORS_TEXT.invalid_credentials);
        }
      } else {
        setToastErrorText(ERRORS_TEXT.invalid_credentials);
      }
    }
  };

  return (
    <>
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

              <Link
                className="text-subtitle text-[#9A55BF] cursor-pointer"
                to={ROUTES.forgorPassword}
              >
                {TEXT.forgot_password}
              </Link>
            </>
          )}
        />
      </div>
      <Button
        title={TEXT.log_in}
        rightIcon={<ArrowRight size={16} color="#5A4886" />}
        onClick={handleSubmit(onSubmit)}
        disabled={!(isDirty && isValid)}
        isLoading={isSubmitting}
      />

      <div className="flex justify-center gap-1">
        <p className="text-subtitle">{TEXT.new_to_ai}</p>
        <Link
          className="text-subtitle text-[#A36FD1] font-medium"
          to={ROUTES.signUp}
        >
          {TEXT.sign_up}
        </Link>
      </div>
      <div className="flex items-center w-full gap-3">
        <div className="w-full h-px bg-[#F4D8FF]" />
        <p className="text-subtitle">{TEXT.or}</p>
        <div className="w-full h-px bg-[#F4D8FF]" />
      </div>
      <GoogleButton />
    </>
  );
};
