import { Schema, InferSchemaType, model } from "mongoose";

const commentSchema = new Schema(
  {
    projectId: { type: String, required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    dislikes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isReply: { type: Boolean, default: false, required: true },
    hasReply: { type: Boolean, default: false, required: true },
    replyGroup: { type: String, required: false },
  },
  { timestamps: true }
);

type CommentSchema = InferSchemaType<typeof commentSchema>;
const Comment = model("Comment", commentSchema);
export { Comment, CommentSchema };
