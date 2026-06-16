import { useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { UserPlus, ArrowLeft, CheckCircle } from "lucide-react";
import birLogo from "../img/Bureau_of_Internal_Revenue_BIR.svg";
import bir_building from "../img/bir_building.jpg";

import {
  fieldInputCls,
  Checkbox,
} from "../components/Fields";

export default function SignIn() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const [isRegister, setIsRegister] = useState(false);
  // New States to handle interactive forgot password view
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepMe, setKeepMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // 1. Handle forgot password simulation locally
    if (isForgotPassword) {
    if (emailSent) {
      setIsForgotPassword(false);
      setEmailSent(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Send the email payload to your real backend server
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Something went wrong resetting your password.");
      }

      setEmailSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
    return;
  }

    // 2. Original API implementation for Sign-in / Registration
    try {
      setLoading(true);
      setError("");

      const endpoint = isRegister
        ? "/api/auth/register"
        : "/api/auth/sign-in";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : null;

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Authentication failed. Please make sure the backend server is running."
        );
      }

      queryClient.clear();

      localStorage.setItem("authed", "1");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard");
      return;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="relative min-h-screen"
      style={{
        backgroundImage: `url(${bir_building})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Login Panel */}
      <div className="relative z-10 min-h-screen flex justify-end selection:bg-transparent">
        <div
          className="
            w-full
            md:w-[480px]
            bg-white/65
            backdrop-blur-xl
            border
            border-yellow-200/20
            shadow-[0_8px_32px_rgba(0,0,0,0.35)]
            flex
            items-center
            justify-center
            p-8
          "
        >
          <div className="w-full max-w-[380px]">
            {/* Logo area */}
            <div className="text-center mb-8">
              <img
                src={birLogo}
                alt="BIR Logo"
                className="w-24 h-24 mx-auto object-contain"
              />

              <h1 className="mt-4 text-3xl font-bold text-black-900">
                BIR Registration Portal
              </h1>

              <p className="mt-2 text-black-600">
                {isForgotPassword
                  ? "Reset your account password"
                  : isRegister
                  ? "Create account to start"
                  : "Sign in to start your session"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              
              {/* Conditional Screen View: Show confirmation text instead of input boxes */}
              {isForgotPassword && emailSent ? (
                <div className="text-center py-4 animate-in zoom-in-95 duration-150 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center border border-green-500/20 mb-3">
                    <CheckCircle size={24} />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">Link Transmitted Successfully</p>
                  <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                    We sent password recovery instructions directly to <span className="font-bold text-black">{email || "your email"}</span>.
                  </p>
                </div>
              ) : (
                <>
                  {isRegister && !isForgotPassword && (
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        placeholder="Juan Dela Cruz"
                        onChange={(e) => setName(e.target.value)}
                        className={fieldInputCls}
                        required
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      placeholder="juan@bir.gov.ph"
                      onChange={(e) => setEmail(e.target.value)}
                      className={fieldInputCls}
                      required
                    />
                  </div>

                  {!isForgotPassword && (
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                        Password
                      </label>
                      <input
                        type="password"
                        value={password}
                        placeholder="••••••••"
                        onChange={(e) => setPassword(e.target.value)}
                        className={fieldInputCls}
                        required
                      />
                    </div>
                  )}

                  {!isRegister && !isForgotPassword && (
                    <div className="flex items-center justify-between">
                      <Checkbox
                        checked={keepMe}
                        onChange={setKeepMe}
                        label="Keep me signed in"
                      />

                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(true);
                          setError("");
                        }}
                        className="text-xs text-blue-600 underline cursor-pointer font-medium hover:text-blue-700"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}
                </>
              )}

              {error && <div className="text-sm text-red-500">{error}</div>}

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="
                  h-11
                  rounded-lg
                  bg-blue-600
                  text-white
                  font-semibold
                  hover:bg-blue-700
                  transition
                  disabled:opacity-50
                  cursor-pointer
                "
              >
                {loading
                  ? "Please wait..."
                  : isForgotPassword
                  ? emailSent
                    ? "Return to Sign In"
                    : "Send Reset Link"
                  : isRegister
                  ? "Create Account"
                  : "Sign In"}
              </button>

              {/* Secondary Navigation Button */}
              <button
                type="button"
                onClick={() => {
                  if (isForgotPassword) {
                    setIsForgotPassword(false);
                    setEmailSent(false);
                  } else {
                    setIsRegister(!isRegister);
                  }
                  setError("");
                }}
                className="
                  h-11
                  rounded-lg
                  border
                  border-gray-300
                  bg-white
                  text-gray-700
                  font-medium
                  hover:bg-gray-100
                  flex
                  items-center
                  justify-center
                  gap-2
                  cursor-pointer
                "
              >
                {isForgotPassword || isRegister ? (
                  <>
                    <ArrowLeft size={16} />
                    Back to Sign In
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    Register New Account
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}