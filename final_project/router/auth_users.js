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
    return false;
  } else {
    return true;
  }
}

const authenticatedUser = (username, password) => {
  let validusers = users.filter((user) => {
    return (user.username === username & user.password === password);
})
return validusers.length > 0;
};
/*Register a new user
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
});*/
//only registered users can login
regd_users.post('/login', (req, res) => {
	let username = req.body.username;
	let password = req.body.password;
  
// Validate input
if (!username || !password) {
  return res.status(400).json({ message: "Username and password are required." });
}

// Check if the user exists and password matches
if (authenticatedUser(username, password)) {
	let accessToken = jwt.sign(
		{data : password},
		'access',
		//expires in a day. 60 secs x 60 times = 1hr
		{expiresIn : 60 * 60});
	  
	  req.session.authorization = {
		accessToken, username
	  }
  
	console.log("Access Token:", accessToken);
  
	console.log("this is req.session.authorization \n", req.session.authorization)
	  return res.status(200).send(`User ${username} successfully logged in`)
	}
	else{
	  return res.status(500).json({message: "Invalid Login. Username and Password not recognized."});
	}
  });

// Add a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
  // Code for adding reviews
  const isbn = req.params.isbn;
	const userReview = req.query.review;
	const username = req.session.authorization?.username;

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
//The code for deleting a book review
regd_users.delete('/auth/review/:isbn', (req, res) => {
	const isbn = req.params.isbn;
	const username = req.session.authorization.username;

	const bookreview = books[isbn].reviews[username]
  //check the book review exists
  if (bookreview) {
    console.log(`the current user is ${username} `)
    console.log(`here we can see the book review ${bookreview}`)

    Object.keys(books[isbn].reviews).forEach(key => {
      if (key === username) {
        delete books[isbn].reviews[key];
        return res.status(200).send(`Book review by ${username}, isbn ${isbn} was deleted successfully`)
      }
    })
  }
  else{
    return res.status(400).send('The book review was not found')
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
