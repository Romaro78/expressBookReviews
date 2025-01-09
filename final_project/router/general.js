const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const app = express();

app.use(express.json());

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
  if (username && password) {
      // Check if the user does not already exist
      if (isValid(username)) {
          // Add the new user to the users array
          users.push({"username": username, "password": password });
          return res.status(200).json({message : `User ${username} , has successfully been added.`})
    }
    else{
      return res.status(400).json({message: `Username: ${username} already exists! Choose another name`}); 
    }
  }
  else{
    return res.status(400).json({message: "No Username or Password provided. Please try again."}); 
  }
});
 
// Get the book list available in the shop
public_users.get('/', function (req, res) {
  // Use JSON.stringify to return the books object neatly
  return res.status(200).send(JSON.stringify(books, null, 2));
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn; // Retrieve ISBN from request parameters
  const book = books[isbn];    // Access the book data using the ISBN key

  if (book) {
    return res.status(200).json(book); // Return the book details if found
  } else {
    return res.status(404).json({ message: "Book not found" }); // Return an error if ISBN does not exist
  }
});
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author; // Retrieve the author from request parameters
  const matchingBooks = [];

  // Iterate through the books object
  for (const key in books) {
    if (books[key].author.toLowerCase() === author.toLowerCase()) {
      matchingBooks.push({ isbn: key, ...books[key] }); // Add book details to result
    }
  }

  // Check if any books matched the author
  if (matchingBooks.length > 0) {
    return res.status(200).json(matchingBooks); // Return the list of books
  } else {
    return res.status(404).json({ message: "No books found for the given author" });
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title; // Retrieve the title from request parameters
  const matchingBooks = [];

  // Iterate through the books object
  for (const key in books) {
    if (books[key].title.toLowerCase() === title.toLowerCase()) {
      matchingBooks.push({ isbn: key, ...books[key] }); // Add book details to result
    }
  }

  // Check if any books matched the title
  if (matchingBooks.length > 0) {
    return res.status(200).json(matchingBooks); // Return the list of books
  } else {
    return res.status(404).json({ message: "No books found for the given title" });
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn; // Retrieve ISBN from request parameters
  return res.send(JSON.stringify(books[isbn].reviews , null, 2));
});

module.exports.general = public_users;
