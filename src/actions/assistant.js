"use server";

import { libraryAssistantAgent } from "@/lib/agents";
import { getSessionUser } from "@/lib/auth";
import { run, MemorySession } from "@openai/agents"; 
import connectDB from "@/lib/db";
import Book from "@/models/Book";
import User from "@/models/User"; // הוספנו את מודל היוזר כדי למשוך את קוד המשפחה
import Conversation from "@/models/Conversation"; 

const MAX_MESSAGE_LENGTH = 1000;

export async function askAssistantAction(prevState, formData) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return { answer: "", error: "כדי להשתמש בסוכן צריך קודם להתחבר." };
  }
  
  const message = String(formData.get("message") || "").trim();
  if (!message) {
    return { answer: "", error: "נא לכתוב הודעה." };
  }
  
  if (message.length > MAX_MESSAGE_LENGTH) {
    return { answer: "", error: `ההודעה ארוכה מידי עד ${MAX_MESSAGE_LENGTH} תווים` };
  }

  try {
    await connectDB();
    
    // --- 1. שילוב נתוני הספרייה המשפחתית והדירוגים האישיים ---
    // שולפים את קוד המשפחה של המשתמש
    const dbUser = await User.findById(sessionUser.id).lean();
    const familyCode = dbUser?.familyCode || sessionUser.id;

    // שולפים את כל הספרים של המשפחה
    const familyBooks = await Book.find({ familyCode }).lean();
    
    // מרכיבים לסוכן רשימה חכמה שכוללת את הדירוג והסטטוס האישי של המשתמש המחובר
    const booksList = familyBooks.length > 0 
      ? familyBooks.map(b => {
          // חיפוש המשתמש בתוך מערך הקוראים של הספר
          const myData = b.readers?.find(r => r.userId.toString() === sessionUser.id);
          const status = myData ? myData.readStatus : "לא קראתי";
          const rating = myData?.rating ? `${myData.rating}/5 כוכבים` : "ללא דירוג";
          
          return `- ${b.title} מאת ${b.author} (ז'אנר: ${b.genre || "כללי"}). סטטוס אישי שלי: ${status}. דירוג שלי: ${rating}`;
        }).join("\n")
      : "אין לי ספרים בספרייה כרגע.";

    const enrichedMessage = `
הנה הרשימה המעודכנת של הספרים בספרייה שלי, כולל הסטטוס והדירוגים האישיים שלי:
${booksList}

הודעת המשתמש אליך:
${message}
`;

    // --- 2. ניהול ההיסטוריה מול מונגו ---
    let dbConv = await Conversation.findOne({ userId: sessionUser.id });
    if (!dbConv) {
      dbConv = await Conversation.create({ userId: sessionUser.id, items: [] });
    }

    const memorySession = new MemorySession();
    if (dbConv.items && dbConv.items.length > 0) {
      await memorySession.addItems(dbConv.items);
    }
    
    // הרצת הסוכן
    const result = await run(libraryAssistantAgent, enrichedMessage, { session: memorySession });

    // --- 3. שמירת ההודעות למסד הנתונים ---
    // שומרים רק את ההודעה הנקייה כדי לא להעמיס על מסד הנתונים את רשימת הספרים בכל תור
    const userMessage = {
      role: "user",
      content: [{ type: "input_text", text: message }],
    };
    const assistantMessage = {
      role: "assistant",
      content: [{ type: "output_text", text: result.finalOutput }],
    };

    dbConv.items.push(userMessage, assistantMessage);
    await dbConv.save();

    return {
      answer: result.finalOutput,
      error: "",
    };
  } catch (error) {
    console.error("שגיאת סוכן:", error);
    return { answer: "", error: "הסוכן לא הצליח לענות כרגע, נסה שוב בעוד רגע." };
  }
}

export async function clearAssistantChatAction() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return { success: false, error: "כדי לנקות את השיחה צריך קודם להתחבר." };
  }

  try {
    await connectDB();
    await Conversation.findOneAndDelete({ userId: sessionUser.id });
    return { success: true, error: "" };
  } catch (error) {
    console.error(error);
    return { success: false, error: "לא הצלחנו לנקות את השיחה, נסה שוב." };
  }
}