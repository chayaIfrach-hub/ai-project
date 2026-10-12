"use client";

import { useActionState } from "react";
import { registerAction } from "@/actions/auth";
import Link from "next/link";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, {
    errors: {},
    values: { name: "", email: "" },
  });

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-card-bg border border-border rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-primary mb-6 text-center">יצירת חשבון חדש</h2>
      
      <form action={formAction} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">שם מלא:</label>
          <input 
            type="text" 
            name="name" 
            defaultValue={state?.values?.name || ""}
            required 
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-primary" 
          />
          {state?.errors?.name && <span className="text-red-500 text-xs mt-1">{state.errors.name}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">אימייל:</label>
          <input 
            type="email" 
            name="email" 
            defaultValue={state?.values?.email || ""}
            required 
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-primary" 
          />
          {state?.errors?.email && <span className="text-red-500 text-xs mt-1">{state.errors.email}</span>}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">סיסמה:</label>
          <input 
            type="password" 
            name="password" 
            required 
            minLength={6}
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-primary" 
          />
          {state?.errors?.password && <span className="text-red-500 text-xs mt-1">{state.errors.password}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">אימות סיסמה:</label>
          <input 
            type="password" 
            name="confirmPassword" 
            required 
            minLength={6}
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-primary" 
          />
          {state?.errors?.confirmPassword && <span className="text-red-500 text-xs mt-1">{state.errors.confirmPassword}</span>}
        </div>
        
        {state?.errors?.form && (
          <div className="bg-red-50 text-red-600 p-2 rounded text-sm border border-red-200 text-center">
            {state.errors.form}
          </div>
        )}

        <button 
          type="submit" 
          disabled={isPending}
          className="bg-primary text-white py-2 rounded hover:bg-primary-hover transition mt-2 font-medium disabled:opacity-70"
        >
          {isPending ? "מבצע הרשמה..." : "הרשם והיכנס"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-600">
        יש לך כבר חשבון? <Link href="/login" className="text-primary hover:underline font-medium">התחבר כאן</Link>
      </div>
    </div>
  );
}