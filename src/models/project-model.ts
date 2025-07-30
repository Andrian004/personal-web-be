import { Schema, InferSchemaType, model } from "mongoose";

const projectSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: {
      public_id: { type: String, required: true },
      imgUrl: { type: String, required: true },
    },
    videoId: { type: String, required: false, default: "" },
    url: { type: String, required: true },
    github: { type: String, required: false, default: "" },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

type ProjectSchema = InferSchemaType<typeof projectSchema>;
const Project = model("Project", projectSchema);

export { Project, ProjectSchema };
