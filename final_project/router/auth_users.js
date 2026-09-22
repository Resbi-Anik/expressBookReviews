const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  // Username is valid for registration if it is not already taken
  return !users.some((user) => user.username === username);
}


const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
  return users.some((user) => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({message: "Invalid username or password"});
  }
  const accessToken = jwt.sign({data: password}, "access", {expiresIn: 60 * 60});
  req.session.authorization = {accessToken, username};
  return res.status(200).json({message: "User successfully logged in"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({message: "Book not found"});
  }
  if (!review) {
    return res.status(400).json({message: "Review is required as a query parameter"});
  }
  book.reviews[username] = review;
  return res.status(200).json({message: `The review for the book with ISBN ${isbn} has been added/updated`});
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({message: "Book not found"});
  }
  if (!book.reviews[username]) {
    return res.status(404).json({message: "No review by this user for this book"});
  }
  delete book.reviews[username];
  return res.status(200).json({message: `Review for the ISBN ${isbn} posted by the user ${username} deleted`});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
