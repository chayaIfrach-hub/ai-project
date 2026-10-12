import mongoose from "mongoose";

// תת-מודל למעקב קריאה אישי: כל בן משפחה מקבל סטטוס ודירוג משלו
const readerInteractionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  readStatus: { type: String, enum: ["קראתי", "לא קראתי", "קוראת עכשיו"], default: "לא קראתי" },
  rating: { type: Number, min: 1, max: 5 }
}, { _id: false });

const bookSchema = new mongoose.Schema({
  // מידע על הספרייה המשותפת
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // מי הקליד את הספר
  familyCode: { type: String, required: true, index: true }, // שיוך הספר לספרייה הביתית המשותפת
  
  // פרטי הספר 
  title: { type: String, required: true },
  author: { type: String },
  genre: { type: String },
  series: { type: String },
  seriesNumber: { type: String }, 
  note: { type: String }, 
  synopsis: { type: String }, // התקציר שכתוב מאחורי הספר
  barcode: { type: String }, 
  language: { type: String },
  shelfLocation: { type: String },
  owner: { type: String, enum: ["אפרת", "עמית", "כללי", "ילדים", "משפחה"], default: "כללי" },
  
  // החלפנו את הסטטוס הבודד במערך קוראים אישי
  readers: [readerInteractionSchema]
}, { timestamps: true });

export default mongoose.models.Book || mongoose.model("Book", bookSchema);