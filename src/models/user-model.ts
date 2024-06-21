import { Schema, InferSchemaType, model } from "mongoose";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    avatar: {
      public_id: { type: String, default: "" },
      imgUrl: { type: String, default: "" },
    },
    password: { type: String, required: true },
    role: { type: String, default: "user" },
  },
  { timestamps: true }
);

type UserSchema = InferSchemaType<typeof userSchema>;
const User = model("User", userSchema);

export { User, UserSchema }; // model: User, type: UserSchema
