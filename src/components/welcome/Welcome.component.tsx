import { ERRORS_TEXT, TEXT } from "@/shared/constants/text";
import { PhoneField } from "../phone-input/PhoneInput.component";
import { Button } from "../button/Button.component";
import { ArrowRight } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth.hook";
import { getNationalDigits } from "@/utils";
import { useError } from "@/hooks";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes";

type FormValues = {
  phone: string;
};

export const Welcome = () => {
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

  useEffect(() => {
    trigger("phone");
  }, [trigger]);

  const { signInWithPhone } = useAuth();
  const { setToastErrorText } = useError();
  const navigate = useNavigate();

  const onSubmit = async (data: FormValues) => {
    try {
      await signInWithPhone(data.phone);
      navigate(ROUTES.codeVerification, { state: { phone: data.phone } });
    } catch (err) {
      setToastErrorText(ERRORS_TEXT.send_code_error);
      setError("phone", {
        type: "manual",
        message: ERRORS_TEXT.send_code_error,
      });
      resetField("phone", { defaultValue: "" });
      setFocus("phone");
      console.log(err);
    }
  };

  return (
    <>
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
              label={TEXT.phone_number}
              isError={!!error && (isTouched || submitCount > 0)}
            />
          );
        }}
      />
      <Button
        title={TEXT.start}
        rightIcon={<ArrowRight size={16} color="white" />}
        onClick={handleSubmit(onSubmit)}
        disabled={!(isDirty && isValid)}
        isLoading={isSubmitting}
      />
    </>
  );
};
