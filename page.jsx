import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import connectDB from "@/lib/db";
import Book from "@/models/Book";
import User from "@/models/User"; // הוספנו ייבוא של מודל המשתמש
import Link from "next/link";
import Library from "@/components/Library"; // ייבוא קומפוננטת הספרייה החדשה

export default async function HomePage() {
  const sessionUser = await getSessionUser();
  
  if (!sessionUser) {
    redirect("/login");
  }

  await connectDB();
  
  // 1. שליפת המשתמש ממסד הנתונים כדי לקבל את קוד המשפחה שלו
  const dbUser = await User.findById(sessionUser.id).lean();
  const familyCode = dbUser?.familyCode || sessionUser.id; // אם עדיין אין קוד, משתמשים ב-ID כברירת מחדל

  // 2. שליפת כל הספרים השייכים למשפחה
  const booksData = await Book.find({ familyCode }).sort({ createdAt: -1 }).lean();

  // 3. המרת ה-ObjectIds של מונגו למחרוזות רגילות (חובה כדי להעביר נתונים ל-Client Component)
  const books = booksData.map((book) => ({
    ...book,
    _id: book._id.toString(),
    addedBy: book.addedBy ? book.addedBy.toString() : "",
    readers: book.readers ? book.readers.map((r) => ({
      ...r,
      userId: r.userId.toString()
    })) : []
  }));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary">הספרייה שלנו</h2>
        
        <Link href="/add" className="bg-primary text-white px-4 py-2 rounded shadow hover:bg-primary-hover transition">
          + הוסף ספר חדש
        </Link>
      </div>

      {books.length === 0 ? (
        <p className="text-gray-500">הספרייה שלכם ריקה. הוסף ספר כדי להתחיל.</p>
      ) : (
        /* 4. קריאה לקומפוננטה המרכזית עם מערכת הסינון והעריכה */
        <Library books={books} currentUser={{ id: sessionUser.id }} />
      )}
    </div>
  );
}