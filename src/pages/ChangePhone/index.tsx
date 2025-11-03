import { ChangePhonePNG } from "@/assets/images";
import { ArrowBack, Button, PhoneField } from "@/components";
import { useAuth, useError } from "@/hooks";
import { ROUTES } from "@/shared/constants/routes";
import { ERRORS_TEXT, TEXT } from "@/shared/constants/text";
import { getNationalDigits } from "@/utils";
import { ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

type FormValues = {
  phone: string;
};
export const ChangeProfile = () => {
  const {
    control,
    handleSubmit,
    formState: { isValid, isDirty, isSubmitting, submitCount },
    trigger,
    setError,
    resetField,
    setFocus,
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: { phone: "380730651017" },
  });

  const { signInWithPhone } = useAuth();
  const { setToastErrorText } = useError();
  const navigate = useNavigate();

  useEffect(() => {
    trigger("phone");
  }, [trigger]);

  const onSubmit = async (data: FormValues) => {
    try {
      await signInWithPhone(data.phone);
      navigate(ROUTES.codeVerification, {
        state: { phone: data.phone, changePhone: true },
      });
    } catch {
      setToastErrorText(ERRORS_TEXT.send_code_error);
      setError("phone", {
        type: "manual",
        message: ERRORS_TEXT.send_code_error,
      });
      resetField("phone", { defaultValue: "" });
      setFocus("phone");
    }
  };

  return (
    <div className="flex items-center justify-center mt-20 flex-col gap-6 max-w-sm mx-auto">
      <ArrowBack />
      <img src={ChangePhonePNG} alt="Change phone" />
      <div className="flex-col text-center gap-1">
        <p className="text-title">{TEXT.change_phone}</p>
      </div>
      <div className="w-full border-t border-gray-200" />
      <Controller
        control={control}
        name="phone"
        rules={{
          required: TEXT.phone_required,
          validate: (val: string) => {
            if (!val) return true;

            const len = getNationalDigits(val || "").length;
            return len === 10 || len === 9 || TEXT.invalid_phone;
          },
        }}
        render={({
          field: { value, onChange },
          fieldState: { error, isTouched },
        }) => {
          return (
            <PhoneField
              value={value}
              onChange={onChange}
              label={TEXT.new_phone}
              isError={!!error && (isTouched || submitCount > 0)}
            />
          );
        }}
      />
      <Button
        title={TEXT.get_code}
        rightIcon={<ArrowRight size={16} color="white" />}
        onClick={handleSubmit(onSubmit)}
        disabled={!(isDirty && isValid)}
        isLoading={isSubmitting}
      />
    </div>
  );
};
