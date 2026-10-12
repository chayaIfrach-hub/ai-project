"use client";

import { useActionState } from "react";
import { addBookAction } from "@/actions/book";
import Link from "next/link";

export default function AddBookPage() {
  const [state, formAction, isPending] = useActionState(addBookAction, null);

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white border border-slate-200 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-primary mb-6 text-center">הוספת ספר חדש</h2>

      <form action={formAction} className="flex flex-col gap-5">
        
        {/* נתוני חובה */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">שם הספר: *</label>
            <input type="text" name="title" required className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">שם הסופר: *</label>
            <input type="text" name="author" required className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
          </div>
        </div>

        {/* קטגוריות ושייכות */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">ז&apos;אנר:</label>
            <input type="text" name="genre" placeholder="למשל: פנטזיה / מתח / ילדים" className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">שייך ל (Owner):</label>
            <select name="owner" defaultValue="כללי" className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white">
              <option value="אפרת">אפרת</option>
              <option value="עמית">עמית</option>
              <option value="ילדים">ילדים</option>
              <option value="משפחה">משפחה</option>
              <option value="כללי">כללי</option>
            </select>
          </div>
        </div>

        {/* נתוני סדרה ושפה */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">סדרה:</label>
            <input type="text" name="series" placeholder="שם הסדרה" className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">מס&apos; בסדרה:</label>
            <input type="text" name="seriesNumber" placeholder="למשל: 3" className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">שפה:</label>
            <input type="text" name="language" placeholder="למשל: עברית" className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
          </div>
        </div>

        {/* מיקום וברקוד */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">מיקום מדף:</label>
            <input type="text" name="shelfLocation" placeholder="למשל: סלון / פנימי" className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">ברקוד:</label>
            <input type="text" name="barcode" className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
          </div>
        </div>

        {/* --- התוספת החדשה: תקציר הספר --- */}
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700">תקציר הספר (מופיע בגב הכריכה):</label>
          <textarea name="synopsis" rows="3" placeholder="העתיקי לכאן את התקציר..." className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700">הערות:</label>
          <textarea name="note" rows="2" className="w-full border border-slate-300 p-2.5 rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"></textarea>
        </div>

        {state?.error && (
          <div className="bg-red-50 text-red-600 p-3 rounded text-sm border border-red-200 text-center">
            {state.error}
          </div>
        )}

        <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
          <Link href="/" className="flex-1 text-center bg-slate-100 text-slate-700 py-2.5 rounded hover:bg-slate-200 transition font-medium">
            ביטול
          </Link>
          <button type="submit" disabled={isPending} className="flex-1 bg-primary text-white py-2.5 rounded hover:bg-primary-hover transition font-medium disabled:opacity-70">
            {isPending ? "שומר..." : "שמור ספר"}
          </button>
        </div>
      </form>
    </div>
  );
}