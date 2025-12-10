import { Button, Input } from "@/components";
import { useError } from "@/hooks";
import {
  changePasswordSchema,
  type ChangePasswordFormType,
} from "@/schemas/profile.schema";
import { ERRORS_TEXT, TEXT } from "@/shared/constants/text";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

export const ChangePassword = () => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid, isDirty },
  } = useForm<ChangePasswordFormType>({
    mode: "onChange",
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const { setToastErrorText } = useError();

  const onSubmit = async (data: ChangePasswordFormType) => {
    try {
      console.log(data);
    } catch {
      setToastErrorText(ERRORS_TEXT.something_went_wrong);
    }
  };

  return (
    <div className="flex items-center justify-center mt-20 flex-col gap-3 max-w-sm mx-auto">
      <Controller
        control={control}
        name="currentPassword"
        render={({ field: { value, onChange } }) => (
          <>
            <Input
              value={value}
              onChange={onChange}
              label={TEXT.current_password}
              placeholder={TEXT.enter_current_password}
              error={errors.currentPassword?.message}
              type="password"
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
      <Button
        title={TEXT.log_in}
        rightIcon={<ArrowRight size={16} color="#5A4886" />}
        onClick={handleSubmit(onSubmit)}
        disabled={!(isDirty && isValid)}
        isLoading={isSubmitting}
      />
    </div>
  );
};
