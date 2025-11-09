import { ERRORS_TEXT, TEXT } from "@/shared/constants/text";
import { PhoneField } from "../phone-input/PhoneInput.component";
import { Button } from "../button/Button.component";
import { ArrowRight } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth.hook";
import { useError } from "@/hooks";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes";
import { isValidPhoneNumber } from "libphonenumber-js";

type FormValues = {
  phone: string;
};

export const Welcome = () => {
  const [countryCode, setCountryCode] = useState("");
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
    defaultValues: { phone: "" },
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
    <>
      <Controller
        control={control}
        name="phone"
        rules={{
          required: TEXT.phone_required,
          validate: (val: string) => {
            if (!val && !countryCode) return true;

            return isValidPhoneNumber(val, { defaultCallingCode: countryCode });
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
              onCountry={setCountryCode}
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
