import app from "./app";
import { dbConnection } from "./libs/db";

dbConnection(); // Database connection
const port = process.env.PORT || 3000;

// Listening port
app.listen(port, () => {
  console.log(`listening on: http://localhost:${port}`);
});
