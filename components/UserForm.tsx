import { FieldError, UseFormRegister } from "react-hook-form";
import { z, ZodType } from "zod";

export type FormData = {
  email: string;
  password: string;
  confirmPassword: string;
};

type ValidFieldNames = "email" | "password" | "confirmPassword";

type FormFieldProps = {
  type: string;
  placeholder: string;
  name: ValidFieldNames;
  register: UseFormRegister<FormData>;
  error: FieldError | undefined;
  valueAsNumber?: boolean;
};

export const FormField: React.FC<FormFieldProps> = ({
  type,
  name,
  error,
  placeholder,
  register,
  valueAsNumber,
}) => {
  return (
    <>
      <input
        type={type}
        className="login-container__form-input"
        {...register(name, { valueAsNumber })}
        placeholder={placeholder}
      />
      {error && <span className="text-red-500">{error.message}</span>}
    </>
  );
};

export const UserSignUpSchema: ZodType<FormData> = z
  .object({
    email: z.string().email(),
    password: z.string().min(6, { message: "Password is too short" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const UserSignInSchema: ZodType<Omit<FormData, "confirmPassword">> = z.object({
  email: z.string().email(),
  password: z.string().min(6, { message: "Password is too short" }),
});
