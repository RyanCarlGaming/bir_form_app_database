import { useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { UserPlus, ArrowLeft } from "lucide-react";

import {
  fieldInputCls,
  Checkbox,
} from "../components/Fields";

export default function SignIn() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const [isRegister, setIsRegister] =
    useState(false);

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] =
    useState("");

  const [keepMe, setKeepMe] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState("");

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const endpoint = isRegister
        ? "/api/auth/register"
        : "/api/auth/sign-in";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const contentType =
        response.headers.get("content-type") || "";

      const data = contentType.includes(
        "application/json"
      )
        ? await response.json()
        : null;

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Authentication failed. Please make sure the backend server is running."
        );
      }

      if (isRegister) {
        alert("Account created successfully!");

        queryClient.clear();

        localStorage.setItem(
          "authed",
          "1"
        );

        localStorage.setItem(
          "token",
          data.token
        );

        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        navigate("/dashboard");

        return;
      }

      localStorage.setItem(
        "authed",
        "1"
      );

      queryClient.clear();

      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">

      {/* LEFT PANEL */}
      <div className="
        w-full
        lg:w-[46%]
        bg-navy
        flex flex-col
        justify-between
        gap-8
        px-6 py-7
        sm:px-8
        lg:p-10
        shrink-0
        lg:min-h-dvh
      ">
        {/* BRAND */}
        <div className="flex items-center gap-3">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect
              x="4"
              y="3"
              width="16"
              height="18"
              rx="2"
            />

            <line
              x1="8"
              y1="8"
              x2="16"
              y2="8"
            />

            <line
              x1="8"
              y1="12"
              x2="16"
              y2="12"
            />

            <line
              x1="8"
              y1="16"
              x2="13"
              y2="16"
            />
          </svg>

          <div>
            <p className="
              text-white
              font-bold
              text-lg
              leading-none
            ">
              BIR Online Registration
            </p>

            <p
              className="
                text-xs
                leading-none
                mt-0.5
              "
              style={{
                color:
                  "var(--color-navy-muted)",
              }}
            >
              Portal Application
            </p>
          </div>
        </div>

        {/* HERO */}
        <div className="
          flex flex-col gap-5
          lg:gap-6
        ">
          <p className="
            text-slate-400
            text-xs
            uppercase
            tracking-widest
          ">
            BIR Form 1902 · Employee TIN Registration
          </p>

          <h1 className="
            text-3xl
            sm:text-4xl
            lg:text-5xl
            font-extrabold
            text-white
            leading-tight
            tracking-tight
          ">
            {isRegister
              ? "Create your"
              : "A digital home"}
            <br />
            {isRegister
              ? "Account."
              : "for Form 1902."}
          </h1>

          <p className="
            text-slate-400
            text-[15px]
            leading-relaxed
            max-w-xs
          ">
            {isRegister
              ? "Register an account to access the BIR registration portal."
              : "Replace the paper application for employee TIN registration with a structured, searchable, and normalized system."}
          </p>

          <div className="grid grid-cols-3 gap-4 sm:flex sm:gap-10">
            {[
              {
                val: "3NF",
                label: "Normalized schema",
              },
              {
                val: "10 days",
                label: "Filing window",
              },
              {
                val: "9-digit",
                label: "TIN issued",
              },
            ].map(({ val, label }) => (
              <div
                key={val}
                className="
                  flex flex-col gap-1
                "
              >
                <span className="
                  font-mono
                  text-white
                  text-lg
                  font-semibold
                ">
                  {val}
                </span>

                <span className="
                  text-slate-400
                  text-xs
                ">
                  {label}
                </span>
              </div>
            ))}
          </div>

          <p className="
            text-slate-600
            text-xs
            uppercase
            tracking-widest
          ">
            PUP · CCIS · COMP 010 · Group 2
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="
        flex-1
        bg-canvas
        flex items-center
        justify-center
        px-5 py-8
        sm:px-8
      ">
        <div className="
          w-full
          max-w-[400px]
          flex flex-col gap-6
        ">
          {/* TOP */}
          <div className="
            flex items-center gap-2
          ">
            <span className="
              w-2 h-2
              rounded-full
              bg-green
              shrink-0
            " />

            <span className="
              text-xs
              text-muted
              uppercase
              tracking-widest
            ">
              {isRegister
                ? "Register"
                : "Sign in"}
            </span>
          </div>

          {/* TITLE */}
          <div>
            <h2 className="
              text-4xl
              font-bold
              text-text
              tracking-tight
            ">
              {isRegister
                ? "Create account."
                : "Welcome back."}
            </h2>

            <p className="
              mt-2
              text-sm
              text-muted
            ">
              {isRegister
                ? "Create your Account."
                : "Use your office credentials to continue."}
            </p>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="
              flex flex-col gap-4
            "
          >
            {isRegister && (
              <div className="
                flex flex-col gap-1
              ">
                <label className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.04em]
                  text-text-2
                ">
                  Full Name
                </label>

                <input
                  type="text"
                  value={name}
                  placeholder="Juan Dela Cruz"
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  className={fieldInputCls}
                />
              </div>
            )}

            <div className="
              flex flex-col gap-1
            ">
              <label className="
                text-xs
                font-semibold
                uppercase
                tracking-[0.04em]
                text-text-2
              ">
                Email
              </label>

              <input
                type="email"
                value={email}
                placeholder="juan@bir.gov.ph"
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className={fieldInputCls}
              />
            </div>

            <div className="
              flex flex-col gap-1
            ">
              <label className="
                text-xs
                font-semibold
                uppercase
                tracking-[0.04em]
                text-text-2
              ">
                Password
              </label>

              <input
                type="password"
                value={password}
                placeholder="••••••••"
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className={fieldInputCls}
              />
            </div>

            {!isRegister && (
              <div className="
                flex items-center
                justify-between
              ">
                <Checkbox
                  checked={keepMe}
                  onChange={setKeepMe}
                  label="Keep me signed in"
                />

                <button
                  type="button"
                  className="
                    text-xs
                    text-blue
                    underline
                  "
                >
                  Forgot password?
                </button>
              </div>
            )}

            {error && (
              <div className="
                text-sm
                text-red-500
              ">
                {error}
              </div>
            )}

            {/* MAIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="
                h-11
                rounded-xl
                bg-navy
                text-white
                text-sm
                font-semibold
                hover:opacity-90
                transition-opacity
                disabled:opacity-50
              "
            >
              {loading
                ? "Please wait..."
                : isRegister
                ? "Create Account"
                : "Sign in"}
            </button>

            {/* TOGGLE BUTTON */}
            <button
              type="button"
              onClick={() =>
                setIsRegister(!isRegister)
              }
              className="
                h-11
                rounded-xl
                border border-border
                bg-surface
                text-text
                text-sm
                font-medium
                hover:bg-border
                transition-colors
                inline-flex
                items-center
                justify-center
                gap-2
              "
            >
              {isRegister ? (
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
  );
}
