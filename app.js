'use strict'


// Import the stuff for the express framework
const express = require('express');
const sanitizeHtml = require("sanitize-html");
const fs = require('fs');
const { passwordStrength } = require('check-password-strength');


// Needed to parse the request body
const bodyParser = require("body-parser");
const app     = express();

// Needed to parse the request body
//Note that in version 4 of express, express.bodyParser() was
//deprecated in favor of a separate 'body-parser' module.
app.use(bodyParser.urlencoded({ extended: true })); 

function isUserNameValid(username) {
	/* 
	  Usernames can only have: 
	  - Lowercase Letters (a-z)
	  - Upercase
	  - Numbers (0-9)
	  - Dots (.)
	  - Underscores (_)
	*/
	if (/^[a-zA-Z0-9._]+$/.test(username)) return 1;
	else return 0;
  }

  function isPasswordValid(password){
	const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

	if (passwordRegex.test(password)) return 1;
	else return 0;
}


function checkPasswordStrength(password) 
{
	const { value } = passwordStrength(password);
	if (value === 'Too Short') {
	  return 0; // password is too weak
	} else if (value === 'Weak') {
	  return 1; // password is weak
	} else if (value === 'Medium') {
	  return 2; // password is medium strength
	} else if (value === 'Strong') {
	  return 3; // password is strong
	} else {
	  return 0; // password is too weak (default case)
	}
}


// Parses a database of usernames and passwords
// @param dbFile - the database file
// @return - the list of user name and passwords
function parseDB(dbFile)
{
	// Read the file
	fs.readFile(dbFile, "utf8", function(error, data){
		
		console.log(data);
		data.split(";");
		
	});
}

// The handler for the home page
// @param req - the request
// @param res - the response
app.get("/", function(req, res){
	
	// Read the file
	fs.readFile("db.txt", "utf8", function(error, data){
		
		console.log(data);
		
		// Split the data
		let tokenizedData = data.split("\n");
		console.log(tokenizedData);
		let page = "<html>"
		page +="<title> Welcome to Online Notes </title>"
		page += "<body bgcolor='white'>"
		page += "<h1> Welcome to Online Notes. You can write your note here and save it!!"
		page += "They will be kept absolutely mostly private."
		page += "</h1>"
		page += "<h2> If you have an account, please login here: </h1>"
		page += "<form action='http://localhost:3000/login' method='POST'>"
		page += "<label for='username'>Username:</label>"
		page +="<input type='text' id='username' name='username'>"
		page += "<label for='pass'>Password (8 characters minimum):</label>"
		page += "<input type='password' id='password' name='password'; minlength='8' required>"
		page +="	<input type='submit' value='Sign in'>"
		page += "</form>"
		page += "<h2> No account? Create one here! </h1>"
		page += "<h3> Username Allowed: a-z, A-Z, 0-9, dot(.) and underscores (_) </h3>"
		page += "<h3> Password Allowed: a-z, A-Z, 0-9 and special character ~!@#$%^&*()_+=\[]{}| </h3>"
		page += "<h3> Password at least: 1 lower case, 1 uppercase, 1 number, 1 special character </h3>"
		page += "<form action='http://localhost:3000/create' method='POST'>"
		page +="<label for='username'>Username:</label>"
		page += "<input type='text' id='username' name='username'>"
		page += "<label for='password'>Password (8 characters minimum):</label>"
		page += "<input type='password' id='password' name='password' minlength='8' required>"
		page += "<input type='submit' value='Create'></form> </div><hr>"
		page += "<br><br><br><br><br>"
		page += "<h4> The code base is from CPSC455 folder (xss_code or basicjavascript) by Mr.Gofman  </h4>"	
		page += "</body></html>"
			
		res.set('Content-Security-Policy', "default-src 'self'");
		res.send(page);
		
	});
});


// The handler for the request of the login page
// @param req - the request
// @param res - the response 
app.post("/login", function(req, res){
	
	console.log("Here!");
		
	// Read the file
	fs.readFile("db.txt", "utf8", function(error, data){
		
		// The page HTML
		let pageHtml = "<HTML><BODY bgcolor='white'><h1> Go ahead! Write your Note!</h1><br>";
		// View all notes
		pageHtml += "<form action='http://localhost:3000/allnotes' method='POST'>"
		pageHtml += "<label for='viewallnotes'>View All notes</label>"
		pageHtml += "<input type='submit' value='View All notes: '></form> </div><hr>"
		pageHtml += "</form>"
		// Types a new note and save
		pageHtml += "<form action='http://localhost:3000/newnote' method='GET'>"
		pageHtml += "<label for='newnote'>Write a new note and save</label>"
		pageHtml += "<input type='submit' value='New note: '></form> </div><hr>"
		pageHtml += "</form>"

		console.log(data);
		
		// Split the data
		let tokenizedData = data.split("\n");
		console.log(tokenizedData);
		
		// Match the credentials 
		let credMath = false;
		
		// Add the HTML; match the password while you are at it
		for(let i = 0; i < tokenizedData.length; i++)
		{ 
			// Get the user name and password 
			let userName = tokenizedData[i].split(";")[0];
			let password = tokenizedData[i].split(";")[1];
				
			// Check the user name and password 
			if(req.body.username == userName && req.body.password == password)
			{
				// We have a match!
				credMath = true;
			}	
			console.log(tokenizedData[i]);
		}
		
		pageHtml += "</body></html>"
		
		// Credentials did not match? Do not display the page	
		if(credMath ==  false)
		{
			pageHtml = "<html><body bgcolor='white'><h1> Wrong password!</h1></body></html>";
		}			
		
		res.set('Content-Security-Policy', "default-src 'self'");
		res.send(pageHtml);
		
	});


});

// The end-point for creating an account
app.post("/create", function(req, res) {
	const passwordStrength = checkPasswordStrength(req.body.password);
	const  passwordValid = isPasswordValid(req.body.password);
  
	console.log(req.body);
  
	
	// If username valid && password weak && password valid
	if (passwordStrength === 0 && isUserNameValid(req.body.username) === 1 && passwordValid === 1 || 
		passwordStrength === 1 && isUserNameValid(req.body.username) === 1 && passwordValid === 1)
	{
	  // Password is too weak, return error
	  res.set('Content-Security-Policy', "default-src 'self'");
	  res.send("Password is too weak.");
	  return { error: "Password is too weak." };
	} 
	// If username invalid && password weak && password valid
	else if (passwordStrength === 0 && isUserNameValid(req.body.username) === 0 && passwordValid === 1 || 
		passwordStrength === 0 && isUserNameValid(req.body.username) === 1  && passwordValid === 1)
	{
		res.set('Content-Security-Policy', "default-src 'self'");
		res.send("Invalid Username and Password is too weak!");
	  return { error: "Invalid Username and Password is too weak!" };
	} 
	// If username invalid && password strong && password valid
	else if (passwordStrength === 2 && isUserNameValid(req.body.username) === 0 && passwordValid === 1 || 
		passwordStrength === 3 && isUserNameValid(req.body.username) === 1 && passwordValid === 1)
	{
		res.set('Content-Security-Policy', "default-src 'self'");
		res.send("Invalid Username and Password is strong!");
	  return { error: "Invalid Username and Password is strong!" };
	} 
	// If username valid && password strong 
	else if (passwordStrength === 2 && isUserNameValid(req.body.username) === 1 && passwordValid === 1 || passwordStrength === 3 && isUserNameValid(req.body.username) === 1 && passwordValid === 1) {
	  // Append the entry to the text database
	  fs.appendFile(
		"db.txt",
		req.body.username + ";" + req.body.password + "\n",
		function(err) {
		  if (err) {
			res.set('Content-Security-Policy', "default-src 'self'");
			res.send("Error occurred while saving the user data!");
		  } else {
			res.set('Content-Security-Policy', "default-src 'self'");
			res.send("Thank you for registering!");
		  }
		}
	  );
	  parseDB("db.txt");
	}
	else 
	{
		res.set('Content-Security-Policy', "default-src 'self'");
		res.send("Invalid Password!");
	  return { error: "Invalid Password!" };
	}
  });
  

app.post("/allnotes", function(req, res){
	fs.readFile("notes_db.txt", "utf8", function(error, data){
	  let count = 0;
	  let notes = data.split("\n").filter(note => note.trim() !== "");
	  let finalNotes = notes.map(note => `<p>Note number ${++count}: ${note}</p>`).join("<br><br>\n");
	  let pageHtml = "<HTML><BODY bgcolor='white'><h1>Here are all your notes!</h1><br>";
	  
	  pageHtml += finalNotes ;
	  
	  if (error) {
		res.set('Content-Security-Policy', "default-src 'self'");
		res.send("Could not read notes file");
		return;
	  }
	  res.send(pageHtml);
	});
});
  

app.get("/newnote", function(req, res){
	let pageHtml = "<HTML><BODY bgcolor='white'><h1> Go ahead! Write your Note!</h1><br>";
	pageHtml += "<h1>Enter a new note:</h1>";
	pageHtml += "<form action='http://localhost:3000/savenote' method='POST'>"
	pageHtml += "<textarea name='note' rows='4' cols='50'></textarea><br><br>";
	pageHtml += "<h2>When you click save it will redirect to login page</h2>";
	pageHtml += "<input type='submit' value='Submit'>";
	pageHtml += "</form></body></html>";
	res.set('Content-Security-Policy', "default-src 'self'");
	res.send(pageHtml);
});
  
app.post("/savenote", function(req, res) {
	let note = sanitizeHtml(req.body.note);
	
	// Append the note to the file
	fs.appendFile("notes_db.txt", note + "\n", function(err) {
	  if (err) {
		console.log(err);
		res.set('Content-Security-Policy', "default-src 'self'");
		res.send("Could not save note to file");
	  } else {
		res.set('Content-Security-Policy', "default-src 'self'");
		res.redirect("/");
	  }
	});
});
  
app.listen(3000);
