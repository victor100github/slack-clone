import React from "react";
import { useState } from "react";
import { supabase } from "@/lib/Store";
import { AUTH_STATUS } from "@/lib/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormData,
  FormField,
  UserSignInSchema,
  UserSignUpSchema,
} from "@/components/UserForm";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { IconLoader2 } from "@tabler/icons-react";

const Home = () => {
  const [signType, setSignType] = useState<string>(AUTH_STATUS.SIGNIN);
  const isSignIn = signType === AUTH_STATUS.SIGNIN;
  const [loading, setLoading] = useState(false);
  const {
    handleSubmit,
    formState: { errors },
    register,
    setError,
    setValue
  } = useForm<FormData>({
    resolver: zodResolver(!isSignIn ? UserSignUpSchema : UserSignInSchema),
  });

  const handleSign = () => {
    setValue("email", "")
    setValue("password", "")
    setValue("confirmPassword", "")
    setSignType((s) =>
      s === AUTH_STATUS.SIGNIN ? AUTH_STATUS.SIGNUP : AUTH_STATUS.SIGNIN,
    );
  };

  const handleLogin = async (data: FormData) => {
    const { email, password } = data;
    setLoading(true);
    try {
      const { error } =
        signType === AUTH_STATUS.SIGNIN
          ? await supabase.auth.signIn({ email, password })
          : await supabase.auth.signUp({ email, password });

      const formError = {
        type: "server",
        message: error?.message,
      };

      const invalidGrand = () => {
        setTimeout(() => {
          setLoading(false);
          setError("email", formError);
          setError("password", formError);
        }, 300);
      };

      const alreadyExits = () => {
        setTimeout(() => {
          setLoading(false);
          setError("email", formError);
        }, 300);
      };

      switch (error?.status) {
        case AUTH_STATUS.INVALID_GRANT:
          invalidGrand();
          break;
        case AUTH_STATUS.USER_ALREADY_EXISTS:
          alreadyExits();
          break;
        default:
          null;
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-container__form-container">
        <form
          onSubmit={handleSubmit(handleLogin)}
          className="login-container__form"
        >
          <div className="login-container__logo">
            <div className="relative aspect-[10/2.6] w-28">
              <Image src={"/slack-clone-logo.png"} alt="app_logo" fill />
            </div>
          </div>
          {loading ? (
            <div className="login-container__loading">
              <IconLoader2 />
              <p>Authenticating...</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label className="login-container__form-label">Email</label>
                <FormField
                  type="email"
                  placeholder="Email"
                  name="email"
                  register={register}
                  error={errors.email}
                />
              </div>
              <div className="mb-4">
                <label className="login-container__form-label">Password</label>
                <FormField
                  type="password"
                  placeholder="Password"
                  name="password"
                  register={register}
                  error={errors.password}
                />
              </div>
              {!isSignIn && (
                <div className="mb-4">
                  <label className="login-container__form-label">
                    Confirm Password
                  </label>
                  <FormField
                    type="password"
                    placeholder="Confirm Password"
                    name="confirmPassword"
                    register={register}
                    error={errors.confirmPassword}
                  />
                </div>
              )}
              <div className="flex flex-col gap-5 py-8">
                <button type="submit" className="login-container__form-btn">
                  {!isSignIn ? "Sign up" : "Sign in"}
                </button>
                <button
                  type="button"
                  className="login-container__btn-link"
                  onClick={handleSign}
                >
                  {!isSignIn ? (
                    <>
                      Already have one?
                      <span>Sign in</span>.
                    </>
                  ) : (
                    <>
                      New user?
                      <span>Create account</span>.
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default Home;
