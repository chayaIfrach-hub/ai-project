"use server";

import bcrypt from "bcrypt";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { AFTER_AUTH_REDIRECT, createUserWithPassword } from "@/lib/auth";
import { createSession, destroySession } from "@/lib/session";
import { validationRegisteration } from "@/lib/validation";
import { redirect } from "next/navigation";


export async function registerAction(prevState, formData) {
  const name = String(formData.get("name").trim());
  const email = String(formData.get("email").trim()).toLowerCase();
  const password = String(formData.get("password"));
  const confirmPassword = String(formData.get("confirmPassword"));

  const values = { name, email };
  const errors = validationRegisteration({
    name,
    email,
    password,
    confirmPassword,
  });

  if (Object.keys(errors).length > 0) {
    return { errors, values };
  }

  try {
    const user = await createUserWithPassword({ name, email, password });
    await createSession(user._id.toString());
  } catch (error) {
    console.error("registration failed:", error);
    return {
      errors: { form: "ההרשמה נכשלה, אנא נסה שוב" },
      values,
    };
  }
  redirect(AFTER_AUTH_REDIRECT);
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

export async function loginAction(formData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  console.log("1. מנסה להתחבר עם האימייל:", email);

  if (!email || !password) {
    console.log("2. שגיאה: חסר אימייל או סיסמה.");
    return { error: "נא להזין אימייל וסיסמה." };
  }

  try {
    await connectDB();
    const user = await User.findOne({ email });

    if (!user || !user.passwordHash) {
      console.log("3. שגיאה: המשתמש לא נמצא או שאין לו סיסמה.");
      return { error: "אימייל או סיסמה שגויים." };
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      console.log("4. שגיאה: הסיסמה לא תואמת למה שיש במסד הנתונים!");
      return { error: "אימייל או סיסמה שגויים." };
    }

    console.log("5. סיסמה תקינה! יוצר סשן...");
    await createSession(user._id.toString());
    console.log("6. סשן נוצר בהצלחה.");

  } catch (error) {
    console.error("שגיאת מערכת בהתחברות:", error);
    return { error: "ההתחברות נכשלה, אנא נסה שוב." };
  }

  // פקודת ה-redirect חייבת להיות מחוץ ל-try-catch!
  console.log("7. מבצע הפניה לדף הבית...");
  redirect("/");
}