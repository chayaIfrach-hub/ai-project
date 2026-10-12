import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";

export default async function Navbar() {
  // העברנו את שליפת המשתמש לכאן כדי שהניווט ינהל את עצמו
  const user = await getSessionUser();

  return (
    <nav className="bg-primary text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex gap-6 items-center">
          <Link href="/">
            <h1 className="text-xl font-bold">📚 הספרייה שלי</h1>
          </Link>
          {user && (
            <>
              <Link href="/" className="hover:text-secondary transition">
                הספרים שלי
              </Link>
              <Link
                href="/assistant"
                className="hover:text-secondary transition"
              >
                סוכן חכם
              </Link>
            </>
          )}
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm opacity-80">שלום, {user.name}</span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-sm bg-primary-hover px-3 py-1 rounded hover:bg-opacity-80 transition"
              >
                התנתק
              </button>
            </form>
          </div>
        )}
      </div>
    </nav>
  );
}
