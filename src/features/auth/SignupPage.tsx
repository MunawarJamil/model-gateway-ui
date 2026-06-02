import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { isAxiosError } from "axios";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "./auth.api";
import { signupSchema, type SignupInput } from "./schemas";
import { useAuthStore } from "@/store";
import { SubmitButton } from "@/components";
import { getApiErrorMessage } from "@/lib";

// ─── Component ────────────────────────────────────────────────────────────────
// Uncontrolled react-hook-form — only re-validates the touched field, so the
// form stays cheap as it grows.
export function SignupPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  // When register succeeds but the follow-up login fails, the account already
  // exists — retrying register would 409. Surface a recovery path to /login
  // instead of a generic root error.
  const [accountCreated, setAccountCreated] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  // Decision: `accountCreated` pins the form to "login-only" so retries don't
  // re-run register against an account that already exists. That's only correct
  // for the SAME email — if the user edits the email to register a DIFFERENT
  // account, reset back to register mode (see the email field's onChange below)
  // so they aren't stuck signing in.
  const emailField = register("email");

  const onSubmit = handleSubmit(async (values) => {
    // ─── Phase 1: register ────────────────────────────────────────────────
    // Register only creates the user — it returns no token. Skip it on a
    // post-register retry (`accountCreated`); the account already exists, so
    // re-running register would 409. Go straight to login instead.
    if (!accountCreated) {
      try {
        await authApi.register(values.name, values.email, values.password);
      } catch (err) {
        const message = getApiErrorMessage(err, "Could not create your account");

        // 409 Conflict == email already registered
        if (isAxiosError(err) && err.response?.status === 409) {
          setError("email", { message });
        } else {
          setError("root", { message });
        }

        toast.error(message);
        return;
      }
    }

    // ─── Phase 2: login ───────────────────────────────────────────────────
    // The account now exists; sign in to establish a session. If this fails,
    // do NOT re-run register on retry — keep the user here and point them at
    // the login page. The inline recovery block (role="alert") is the durable
    // surface here, so we deliberately skip the toast to avoid duplicating it.
    try {
      const { user, accessToken } = await authApi.login(
        values.email,
        values.password,
      );
      setAuth(user, accessToken);
      toast.success("Account created successfully");
      navigate("/dashboard");
    } catch {
      setAccountCreated(true);
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Create account</CardTitle>
          <CardDescription>Enter your details to get started</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            {/* Account-created recovery message (register ok, login failed) */}
            {accountCreated && (
              <div
                role="alert"
                className="rounded-md bg-muted px-3 py-2 text-sm text-foreground"
              >
                Your account was created, but we couldn't sign you in
                automatically.{" "}
                <Link
                  to="/login"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Sign in
                </Link>{" "}
                to continue.
              </div>
            )}

            {/* Root error */}
            {errors.root && (
              <div
                role="alert"
                className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {errors.root.message}
              </div>
            )}

            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                autoComplete="name"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
                {...register("name")}
              />
              {errors.name && (
                <p id="name-error" role="alert" className="text-xs text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                {...emailField}
                onChange={(e) => {
                  // New email == a different account; allow register again.
                  setAccountCreated(false);
                  return emailField.onChange(e);
                }}
              />
              {errors.email && (
                <p id="email-error" role="alert" className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
                {...register("password")}
              />
              {errors.password && (
                <p id="password-error" role="alert" className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <SubmitButton className="w-full" isLoading={isSubmitting}>
              {accountCreated ? "Sign in" : "Create account"}
            </SubmitButton>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
