import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    googleId: {
      type: String,
      index: true,
    },
    // --- שדות למערכת המשפחתית ---
    familyCode: {
      type: String,
      index: true, // אינדקס לחיפוש מהיר של כל בני המשפחה
    },
    role: {
      type: String,
      enum: ["admin", "member"], // מנהל (ראש משפחה) או חבר רגיל
      default: "member",
    }
  },
  { timestamps: true },
);

export default mongoose.models.User || mongoose.model("User", userSchema);