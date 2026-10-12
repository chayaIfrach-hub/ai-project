import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true },
);

ConversationSchema.index({ userId: 1 });

export default mongoose.models.Conversation ||
  mongoose.model("Conversation", ConversationSchema);
