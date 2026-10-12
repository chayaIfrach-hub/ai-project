"use server";

import connectDB from "@/lib/db";
import Book from "@/models/Book";
import User from "@/models/User"; // הוספנו ייבוא של המשתמש כדי לשלוף את קוד המשפחה
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// הוספת ספר חדש
export async function addBookAction(prevState, formData) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return { error: "יש להתחבר כדי להוסיף ספר." };

  const title = String(formData.get("title") || "").trim();
  const author = String(formData.get("author") || "").trim();
  const genre = String(formData.get("genre") || "").trim();
  const series = String(formData.get("series") || "").trim();
  const seriesNumber = String(formData.get("seriesNumber") || "").trim();
  const note = String(formData.get("note") || "").trim();
  const barcode = String(formData.get("barcode") || "").trim();
  const language = String(formData.get("language") || "").trim();
  const shelfLocation = String(formData.get("shelfLocation") || "").trim();
  const owner = String(formData.get("owner") || "כללי").trim();

  if (!title || !author) {
    return { error: "שם הספר ושם הסופר הם שדות חובה." };
  }

  try {
    await connectDB();
    
    // שולפים את המשתמש כדי לקבל את קוד המשפחה שלו
    const dbUser = await User.findById(sessionUser.id);
    if (!dbUser) return { error: "משתמש לא נמצא." };

    await Book.create({
      addedBy: sessionUser.id,
      familyCode: dbUser.familyCode || dbUser._id.toString(), // אם אין עדיין קוד משפחה, נשתמש ב-ID כברירת מחדל
      title,
      author,
      genre,
      series,
      seriesNumber,
      note,
      barcode,
      language,
      shelfLocation,
      owner,
      readers: [], // מתחיל ללא היסטוריית קריאה
    });
  } catch (error) {
    console.error("שגיאה בהוספת ספר:", error);
    return { error: "שגיאה בשמירת הספר במסד הנתונים." };
  }

  redirect("/");
}

// עדכון סטטוס קריאה אישי
export async function updateReadStatusAction(formData) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return;

  const bookId = formData.get("bookId");
  const newStatus = formData.get("newStatus"); // קבלת הסטטוס החדש מהטופס

  try {
    await connectDB();
    const book = await Book.findById(bookId);
    if (!book) return;

    const readerIndex = book.readers.findIndex(
      (r) => r.userId.toString() === sessionUser.id
    );

    if (readerIndex > -1) {
      book.readers[readerIndex].readStatus = newStatus;
    } else {
      book.readers.push({
        userId: sessionUser.id,
        readStatus: newStatus
      });
    }

    await book.save();
    revalidatePath("/");
  } catch (error) {
    console.error("שגיאה בעדכון הסטטוס:", error);
  }
}

// עדכון פרטי ספר קיים (עריכה)
export async function updateBookAction(formData) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return { success: false, error: "יש להתחבר." };

  try {
    await connectDB();
    const bookId = formData.get("bookId");
    
    const updatedData = {
      title: String(formData.get("title") || "").trim(),
      author: String(formData.get("author") || "").trim(),
      owner: String(formData.get("owner") || "כללי").trim(),
      synopsis: String(formData.get("synopsis") || "").trim(), // שמירת התקציר
    };

    await Book.findByIdAndUpdate(bookId, updatedData);
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("שגיאה בעדכון הספר:", error);
    return { success: false, error: "לא הצלחנו לעדכן את הספר." };
  }
}

// עדכון דירוג אישי של ספר (1-5 כוכבים)
export async function updateRatingAction(formData) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return;

  const bookId = formData.get("bookId");
  const rating = parseInt(formData.get("rating"), 10); // הופך את הערך למספר

  try {
    await connectDB();
    const book = await Book.findById(bookId);
    if (!book) return;

    // מחפשים את המשתמש במערך הקוראים של הספר
    const readerIndex = book.readers.findIndex(
      (r) => r.userId.toString() === sessionUser.id
    );

    if (readerIndex > -1) {
      // אם הוא קיים, נעדכן לו רק את הדירוג
      book.readers[readerIndex].rating = rating;
    } else {
      // אם הוא לא מופיע בכלל, נוסיף אותו עם הדירוג ועם סטטוס ברירת מחדל
      book.readers.push({
        userId: sessionUser.id,
        readStatus: "לא קראתי",
        rating: rating
      });
    }

    await book.save();
    revalidatePath("/");
  } catch (error) {
    console.error("שגיאה בעדכון הדירוג:", error);
  }
}