const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  let userswithsamename = users.filter((user) => {
    return user.username === username;
});
// Return true if any user with the same username
if (userswithsamename.length > 0) {
    return true;
} else {
    return false;
}
}

const authenticatedUser = (username, password) => {
  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password);
});
return validusers.length > 0;
};
// Register a new user
regd_users.post('/register', (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Check if the username already exists
  if (isValid(username)) {
    return res.status(409).json({ message: "Username already exists. Please choose a different username." });
  }
// Add the new user to the users array
users.push({ username, password });

return res.status(201).json({ message: "User registered successfully!" });
});
//only registered users can login
regd_users.post('/login', (req, res) => {
  const { username, password } = req.body;
// Validate input
if (!username || !password) {
  return res.status(400).json({ message: "Username and password are required." });
}

// Check if the user exists and password matches
if (!authenticatedUser(username, password)) {
  return res.status(401).json({ message: "Invalid username or password." });
}

// Generate a JWT token
const accessToken = jwt.sign({ username }, "your_secret_key", { expiresIn: '1h' });

// Save the token in the session
req.session.token = accessToken;

return res.status(200).json({ message: "Login successful!", token: accessToken });
});

// Add a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
  // Code for adding reviews
  const isbn = req.params.isbn;
	const userReview = req.query.review;
	const username = req.session.authorization.username;

	if (!username) {
		res
			.status(401)
			.send('You must login to submit a review');
	}

	if (!books[isbn]) {
		res
			.status(404)
			.send(
				'Book not found'
			);
	}

	books[isbn].reviews[username] = userReview;

	res.send(
		`Your review for the book ISBN ${isbn} has been added`
	);
});

regd_users.delete('/auth/review/:isbn', (req, res) => {
	const isbn = req.params.isbn;
	const username = req.session.authorization.username;

	if (!username) {
		res
			.status(401)
			.send('login to delete review');
	}

	if (!books[isbn]) {
		res
			.status(404)
			.send(
				'Book not found'
			);
	}

	if (books[isbn].reviews[username]) {
		delete books[isbn].reviews[username];
		res.send(
			`Your review for book ${isbn} has been deleted.`
		);
	} else {
		res.status(404).send('no review added');
	}
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
