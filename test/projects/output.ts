export const projectQueryResult = {
  _id: "16hoiqwu12jo1nejo1",
  title: "Test Project",
  description: "This is a test project description",
  image: {
    public_id: "",
    imgUrl: "",
  },
  url: "https://testproject.com",
  github: "https://github.com/test/project",
  likes: [],
  comments: [],
};

export const successOutput = {
  message: "OK",
  body: [
    {
      id: "16hoiqwu12jo1nejo1",
      title: "Test Project",
      url: "https://testproject.com",
      github: "https://github.com/test/project",
      image: {
        public_id: "",
        imgUrl: "",
      },
      description: "This is a test project description".slice(0, 60),
      totalLikes: 0,
      totalComments: 0,
      liked: false,
    },
  ],
  pagination: {
    totalPage: 1,
    currentPage: 1,
    hasNextPage: false,
    hasPrevPage: false,
  },
};
