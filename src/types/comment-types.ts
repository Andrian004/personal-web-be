export type AddCommentBody = {
  projectId: string;
  uuid: string;
  message: string;
};

export type ReplyCommentBody = {
  projectId: string;
  uuid: string;
  message: string;
  groupId: string;
};
