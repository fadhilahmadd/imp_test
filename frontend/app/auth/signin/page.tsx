"use client";

import { useActionState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, SignInFormValues } from "@/lib/schemas";
import { signInAction } from "@/lib/actions";
import FormSubmitButton from "@/components/FormSubmitButton";
import Link from "next/link";
import { useEffect } from "react";
import { toast } from "react-hot-toast";

const initialState = { success: false, message: "" };

export default function SignInPage() {
  const [formState, formAction, isPending] = useActionState(
    signInAction,
    initialState
  );
  const [isTransitionPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
  });

  useEffect(() => {
    if (formState.message) {
      if (formState.success) {
      } else {
        toast.error(formState.message);
      }
    }
  }, [formState]);

  const onSubmit = (data: SignInFormValues) => {
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <div className="min-h-[calc(100vh-150px)] flex items-center justify-center bg-base-200/30 p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl border border-base-300 rounded-lg">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="card-body p-8 space-y-4"
        >
          <h2 className="text-2xl font-bold text-center mb-1">Sign in</h2>
          <p className="text-center text-base-content text-opacity-70 mb-6 text-sm">
            Enter your credentials to continue
          </p>

          {!formState.success && formState.message && (
            <p className="text-error text-sm text-center -mt-2">
              {formState.message}
            </p>
          )}

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Email address</span>
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="Enter your email"
              className={`input input-bordered w-full ${
                errors.email ? "input-error" : ""
              }`}
            />
            {errors.email && (
              <p className="text-error text-xs mt-1">{errors.email.message}</p>
            )}
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Password</span>
            </label>
            <input
              {...register("password")}
              type="password"
              placeholder="Enter your password"
              className={`input input-bordered w-full ${
                errors.password ? "input-error" : ""
              }`}
            />
            {errors.password && (
              <p className="text-error text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
          <div className="form-control pt-4">
            <FormSubmitButton
              label="Sign In"
              className="btn btn-primary w-full"
              disabled={isSubmitting || isPending || isTransitionPending}
            />
          </div>
          <p className="text-center text-sm mt-4">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="link link-primary font-medium">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
