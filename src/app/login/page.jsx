import { loginAction } from "@/actions/auth";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-card-bg border border-border rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-primary mb-6 text-center">התחברות לספרייה</h2>
      
      <form action={loginAction} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">אימייל:</label>
          <input 
            type="email" 
            name="email" 
            required 
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-primary" 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">סיסמה:</label>
          <input 
            type="password" 
            name="password" 
            required 
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-primary" 
          />
        </div>
        
        <button 
          type="submit" 
          className="bg-primary text-white py-2 rounded hover:bg-primary-hover transition mt-2 font-medium"
        >
          התחבר
        </button>
        
        <div className="mt-6 text-center text-sm text-slate-600">
        אין לך חשבון עדיין? <Link href="/register" className="text-primary hover:underline font-medium">הרשם כאן</Link>
      </div>
      </form>
    </div>
  );
}