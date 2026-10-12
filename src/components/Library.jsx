"use client";

import { useState } from "react";
// שימי לב שהוספנו את updateRatingAction לייבוא:
import { updateBookAction, updateReadStatusAction, updateRatingAction } from "@/actions/book";

export default function Library({ books = [], currentUser }) {
  const [filter, setFilter] = useState("הכל");
  const [searchQuery, setSearchQuery] = useState(""); 
  const [genreFilter, setGenreFilter] = useState("הכל"); 
  const [statusFilter, setStatusFilter] = useState("הכל"); 
  
  const [editingBook, setEditingBook] = useState(null);
  const [viewingBook, setViewingBook] = useState(null);

  const uniqueGenres = Array.from(
    new Set(books.map((b) => b.genre).filter((g) => g && g.trim() !== ""))
  ).sort();

  const filteredBooks = books.filter((book) => {
    if (filter !== "הכל" && book.owner !== filter) return false;
    if (genreFilter !== "הכל" && book.genre !== genreFilter) return false;

    const myReadingData = book.readers?.find(
      (r) => String(r.userId) === String(currentUser.id)
    );
    const myStatus = myReadingData ? myReadingData.readStatus : "לא קראתי";
    if (statusFilter !== "הכל" && myStatus !== statusFilter) return false;

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const matchTitle = book.title?.toLowerCase().includes(query);
      const matchAuthor = book.author?.toLowerCase().includes(query);
      const matchSeries = book.series?.toLowerCase().includes(query);
      
      if (!matchTitle && !matchAuthor && !matchSeries) return false;
    }

    return true;
  });

  const groupedBooks = filteredBooks.reduce((groups, book) => {
    const seriesName = book.series && book.series.trim() !== "" ? book.series.trim() : "ספרים בודדים";
    if (!groups[seriesName]) {
      groups[seriesName] = [];
    }
    groups[seriesName].push(book);
    return groups;
  }, {});

  const sortedSeriesNames = Object.keys(groupedBooks).sort((a, b) => {
    if (a === "ספרים בודדים") return 1;
    if (b === "ספרים בודדים") return -1;
    return a.localeCompare(b, "he");
  });

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-wrap gap-2">
        {["הכל", "אפרת", "עמית", "ילדים", "כללי", "משפחה"].map((ownerFilter) => (
          <button
            key={ownerFilter}
            onClick={() => setFilter(ownerFilter)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
              filter === ownerFilter
                ? "bg-primary text-white shadow-md transform scale-105"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {ownerFilter === "הכל" ? "כל הספרייה" : ownerFilter}
          </button>
        ))}
      </div>

      <div className="mb-8 flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex-1 relative">
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="חיפוש לפי שם ספר, סופר או סדרה..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value !== "") setFilter("הכל");
            }}
            className="w-full rounded-lg border border-slate-300 pr-10 pl-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        
        <div className="w-full md:w-48">
          <select
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm bg-white cursor-pointer focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="הכל">כל הז&apos;אנרים</option>
            {uniqueGenres.map((genre) => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm bg-white cursor-pointer focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="הכל">כל הסטטוסים</option>
            <option value="לא קראתי">לא קראתי</option>
            <option value="קוראת עכשיו">קוראת עכשיו</option>
            <option value="קראתי">קראתי</option>
          </select>
        </div>
      </div>

      <div className="space-y-12">
        {sortedSeriesNames.map((seriesName) => {
          const booksInSeries = groupedBooks[seriesName].sort((a, b) => {
            const numA = parseInt(a.seriesNumber) || 9999;
            const numB = parseInt(b.seriesNumber) || 9999;
            return numA - numB;
          });

          return (
            <div key={seriesName} className="animate-[fadeIn_0.5s_ease-out]">
              <h3 className="mb-4 border-b-2 border-slate-100 pb-2 text-xl font-bold text-slate-800">
                {seriesName === "ספרים בודדים" ? "📚 ספרים בודדים (ללא סדרה)" : `📖 סדרה: ${seriesName}`}
              </h3>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {booksInSeries.map((book) => {
                  const myReadingData = book.readers?.find(
                    (r) => String(r.userId) === String(currentUser.id)
                  );
                  const myStatus = myReadingData ? myReadingData.readStatus : "לא קראתי";
                  const myRating = myReadingData?.rating || 0; // חילוץ הדירוג האישי

                  return (
                    <div
                      key={book._id}
                      className="group relative flex flex-col justify-between rounded-l-2xl rounded-r-md border-r-12 border-r-primary/90 bg-white p-5 shadow-sm min-h-55 transition-all hover:-translate-y-1 hover:shadow-md"
                    >
                      <div className="mb-4">
                        <h3 className="line-clamp-2 text-lg font-bold text-slate-800 leading-tight">
                          {book.title}
                        </h3>
                        <p className="mt-1 text-sm font-medium text-slate-500">{book.author}</p>
                        
                        {book.series && (
                          <p className="mt-2 inline-block rounded bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-500">
                            סדרה: {book.series} {book.seriesNumber && `(#${book.seriesNumber})`}
                          </p>
                        )}
                      </div>
                      
                      <div className="mt-auto space-y-3">
                        {/* --- שורת דירוג כוכבים חדשה --- */}
                        <div className="flex items-center justify-between bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                          <span className="text-[11px] font-bold text-slate-400">הדירוג שלי:</span>
                          <form action={updateRatingAction} className="flex gap-0.5" dir="ltr">
                            <input type="hidden" name="bookId" value={book._id} />
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="submit"
                                name="rating"
                                value={star}
                                className={`text-lg transition-transform hover:scale-125 ${
                                  myRating >= star ? "text-amber-400 drop-shadow-sm" : "text-slate-200"
                                } hover:text-amber-400`}
                                title={`דרג ${star} כוכבים`}
                              >
                                ★
                              </button>
                            ))}
                          </form>
                        </div>

                        {/* --- שינוי סטטוס קריאה --- */}
                        <form action={updateReadStatusAction} className="w-full">
                          <input type="hidden" name="bookId" value={book._id} />
                          <select
                            name="newStatus"
                            defaultValue={myStatus}
                            onChange={(e) => e.target.form.requestSubmit()}
                            className={`w-full cursor-pointer rounded-lg border-0 px-3 py-2 text-sm font-bold shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset ${
                              myStatus === "קראתי" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" :
                              myStatus === "קוראת עכשיו" ? "bg-amber-50 text-amber-700 ring-amber-200" :
                              "bg-slate-50 text-slate-600 ring-slate-200"
                            }`}
                          >
                            <option value="לא קראתי">לא קראתי</option>
                            <option value="קוראת עכשיו">📖 קוראת עכשיו</option>
                            <option value="קראתי">✅ קראתי</option>
                          </select>
                        </form>

                        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                          <button
                            onClick={() => setViewingBook(book)}
                            className="text-xs font-bold text-primary hover:underline"
                          >
                            פרטים ותקציר
                          </button>
                          <button
                            onClick={() => setEditingBook(book)}
                            className="text-xs text-slate-400 hover:text-slate-600"
                          >
                            ✎ עריכה
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {filteredBooks.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-xl text-slate-400 font-medium">לא נמצאו ספרים תואמים לחיפוש ולסינון שלך.</p>
          </div>
        )}
      </div>

      {viewingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl">
            <button 
              onClick={() => setViewingBook(null)}
              className="absolute top-4 left-4 text-slate-400 hover:text-slate-700"
            >✕</button>
            
            <h2 className="text-2xl font-black text-slate-800">{viewingBook.title}</h2>
            <p className="mb-6 text-lg text-slate-500">{viewingBook.author}</p>
            
            <div className="space-y-4 text-sm text-slate-700">
              {viewingBook.synopsis ? (
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 leading-relaxed italic max-h-40 overflow-y-auto">
                  &ldquo;{viewingBook.synopsis}&rdquo;
                </div>
              ) : (
                <div className="rounded-xl bg-slate-50 p-4 text-center italic text-slate-400">
                  אין תקציר זמין לספר זה. (תוכלי להוסיף בעריכה)
                </div>
              )}

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div><span className="font-bold">ז&apos;אנר:</span> {viewingBook.genre || "-"}</div>
                <div><span className="font-bold">שיוך:</span> {viewingBook.owner}</div>
                <div><span className="font-bold">שפה:</span> {viewingBook.language || "-"}</div>
                <div><span className="font-bold">מיקום מדף:</span> {viewingBook.shelfLocation || "-"}</div>
                <div><span className="font-bold">ברקוד:</span> {viewingBook.barcode || "-"}</div>
                <div><span className="font-bold">הערות:</span> {viewingBook.note || "-"}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="mb-4 text-xl font-bold text-slate-800">עריכת ספר</h2>
            
            <form action={async (formData) => { await updateBookAction(formData); setEditingBook(null); }} className="space-y-4">
              <input type="hidden" name="bookId" value={editingBook._id} />
              <div><label className="mb-1 block text-sm font-medium text-slate-700">שם הספר</label><input type="text" name="title" defaultValue={editingBook.title} required className="w-full rounded-lg border border-slate-300 p-2 text-sm" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">מאת</label><input type="text" name="author" defaultValue={editingBook.author} className="w-full rounded-lg border border-slate-300 p-2 text-sm" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">תקציר אחורי</label><textarea name="synopsis" rows="3" defaultValue={editingBook.synopsis} className="w-full resize-none rounded-lg border border-slate-300 p-2 text-sm"></textarea></div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">שיוך לספרייה</label>
                <select name="owner" defaultValue={editingBook.owner} className="w-full rounded-lg border border-slate-300 p-2 text-sm">
                  <option value="אפרת">אפרת</option><option value="עמית">עמית</option><option value="ילדים">ילדים</option><option value="כללי">כללי</option><option value="משפחה">משפחה</option>
                </select>
              </div>
              <div className="mt-6 flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setEditingBook(null)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">ביטול</button>
                <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover">שמור שינויים</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}