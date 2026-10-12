import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getUserMemorySession } from "@/lib/agents";
import AssistantForm from "@/components/AssistantForm";

export default async function AssistantPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const memorySession = getUserMemorySession(user.id);
  const initialMessages = await memorySession.getItems();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-primary mb-2">
          סוכן הספרייה שלך
        </h2>
        <p className="text-gray-600">
          מתלבט מה לקרוא עכשיו? הסוכן שלנו ימליץ לך על הספר הבא מהספרייה שלך או
          יציע לך ספר חדש לרכישה, בדיוק לטעם שלך.
        </p>
      </div>

      <div className="bg-card-bg border border-border rounded-xl shadow-lg p-6">
        <AssistantForm initialMessages={initialMessages} />
      </div>
    </div>
  );
}
