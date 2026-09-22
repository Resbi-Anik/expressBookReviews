const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password) {
      return res.status(400).json({message: "Username and password are required"});
    }
    if (!isValid(username)) {
      return res.status(409).json({message: "Username already exists"});
    }
    users.push({username: username, password: password});
    return res.status(200).json({message: "User successfully registered. Now you can login"});
  });

  // Simulates fetching the book list asynchronously (e.g. from a database or API)
const getBooks = () => {
    return new Promise((resolve, reject) => {
      resolve(books);
    });
  };
  
  // Get the book list available in the shop using async-await
  public_users.get('/', async function (req, res) {
    try {
      const bookList = await getBooks();
      return res.status(200).send(JSON.stringify(bookList, null, 4));
    } catch (error) {
      return res.status(500).json({message: "Error fetching book list"});
    }
  });


// Simulates fetching a book by ISBN asynchronously
const getBookByIsbn = (isbn) => {
    return new Promise((resolve, reject) => {
      const book = books[isbn];
      if (book) {
        resolve(book);
      } else {
        reject(new Error("Book not found"));
      }
    });
  };
  
  // Get book details based on ISBN using async-await
  public_users.get('/isbn/:isbn', async function (req, res) {
    try {
      const book = await getBookByIsbn(req.params.isbn);
      return res.status(200).json(book);
    } catch (error) {
      return res.status(404).json({message: "Book not found"});
    }
  });

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({message: "Book not found"});
  }
 });

 // Simulates fetching books by author asynchronously
const getBooksByAuthor = (author) => {
    return new Promise((resolve, reject) => {
      const matchingBooks = [];
      Object.keys(books).forEach((isbn) => {
        if (books[isbn].author === author) {
          matchingBooks.push({isbn: isbn, ...books[isbn]});
        }
      });
      if (matchingBooks.length > 0) {
        resolve(matchingBooks);
      } else {
        reject(new Error("No books found for this author"));
      }
    });
  };
  
  // Get book details based on author using async-await
  public_users.get('/author/:author', async function (req, res) {
    try {
      const matchingBooks = await getBooksByAuthor(req.params.author);
      return res.status(200).json({booksbyauthor: matchingBooks});
    } catch (error) {
      return res.status(404).json({message: "No books found for this author"});
    }
  });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    const matchingBooks = [];
    Object.keys(books).forEach((isbn) => {
      if (books[isbn].author === author) {
        matchingBooks.push({isbn: isbn, ...books[isbn]});
      }
    });
    if (matchingBooks.length > 0) {
      return res.status(200).json({booksbyauthor: matchingBooks});
    } else {
      return res.status(404).json({message: "No books found for this author"});
    }
  });

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    const matchingBooks = [];
    Object.keys(books).forEach((isbn) => {
      if (books[isbn].title === title) {
        matchingBooks.push({isbn: isbn, ...books[isbn]});
      }
    });
    if (matchingBooks.length > 0) {
      return res.status(200).json({booksbytitle: matchingBooks});
    } else {
      return res.status(404).json({message: "No books found for this title"});
    }
  });

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book) {
      return res.status(200).json(book.reviews);
    } else {
      return res.status(404).json({message: "Book not found"});
    }
  });

module.exports.general = public_users;
