const express = require("express");
const path = require("path");
const cors = require("cors");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, "books.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3005, () => {
      console.log("Server Running at http://localhost:3005/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/books/", async (request, response) => {
  const getBooksQuery = `
      SELECT
        *
      FROM
        books;`;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});

app.get("/books/:Id/", async (request, response) => {
  const { Id } = request.params;
  const getBookQuery = `
    SELECT
      *
    FROM
      books
    WHERE
      id = ${Id};`;
  const book = await db.get(getBookQuery);
  response.send(book);
});

app.post("/books/", async (request, response) => {
  console.log(request.body);
  const bookDetails = request.body;
  //   console.log(bookDetails);
  //   response.send(JSON.stringify(bookDetails));
  const { book, author } = bookDetails;
  //   console.log(book, author);
  const addBookQuery = `
      INSERT INTO
        books (book,author)
      VALUES
        (
          '${book}',
           '${author}'
        );`;

  const dbResponse = await db.run(addBookQuery);
  //   console.log(dbResponse);
  //   response.send(dbResponse);
  //   console.log(addBookQuery);
  const bookId = dbResponse.lastID;
  response.send({ bookId: bookId });
});
