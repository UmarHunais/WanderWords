import express from "express";
import bodyParser from "body-parser";
import fs from 'fs';                           // File system for JSON read/write
import path from 'path'; 
import multer from "multer";
import methodOverride from "method-override"
import { fileURLToPath } from 'url';  
import session from "express-session"
import { get } from "http";



// Tell Express to use EJS
// Optional: Set the views folder (if not in root/views)


const app = express();
const port = 3000;
app.use(express.urlencoded({ extended: true }));


app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: true,
}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static("public"));
app.use(methodOverride('_method')); 
app.use(bodyParser.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'public/uploads')),  // Upload path
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)        // Rename uploaded files
});
const upload = multer({ storage });

const postsPath = path.join(__dirname, 'data/posts.json');



// ✅ Helper: read all posts from the JSON file
const getPosts = () => {
  const data = fs.readFileSync(postsPath, 'utf-8');
  return JSON.parse(data);
};

// ✅ Helper: save all posts to the JSON file
const savePosts = (posts) => {
  fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2));  // Pretty print JSON
};


app.get("/", (req, res) => {
  res.render("index.ejs",{ 
    user: req.session.user,
    recentPosts: [
        { title: 'Rome Adventure', description: 'Exploring the Colosseum and local food.' },
        { title: 'Tokyo Lights', description: 'Neon streets and sushi dreams.' }
      ],
      destinations: ['Paris', 'New York', 'Kyoto', 'Cape Town'],
      tips: ['Pack light', 'Bring a power bank', 'Download offline maps']
    });
    
  });




// ✅ Route: form POST submission
app.post('/submit.ejs', upload.single('image'), (req, res) => {
  const { title, description } = req.body;                // Get text inputs
  const imageUrl = '/uploads/' + req.file.filename;       // Uploaded image path

  const posts = getPosts();                               // Read current posts
  posts.push({
    id: Date.now(), title, description, imageUrl          // Add new post
  });
  savePosts(posts);                                       // Save all posts back to file

  res.redirect('/posts.ejs');                                 // Redirect to view all posts
});

 
// ✅ Route: view all submitted posts
app.get('/posts.ejs', (req, res) => {
  const posts = getPosts();               // Load posts from file
  res.render('posts.ejs', { posts });         // Render them on posts.ejs
});

// ✅ Route: delete a post by ID
app.delete('/posts/:id', (req, res) => {
  let posts = getPosts();                                   // Load all posts
  posts = posts.filter(p => p.id != req.params.id);         // Remove selected post
  savePosts(posts);                                         // Save the rest
  res.redirect('/posts.ejs');                                   // Go back to posts page
});


app.get("/signup.ejs", (req, res) => {
  res.render("signup.ejs");
});

app.post("/signup.ejs", (req, res) => {
  const { username, email, password } = req.body;
  
  // Log or save the user
  console.log("User Registered:", req.body);

  // Simulate logging in immediately
  req.session.user = { username, email };
  res.redirect("/");
});


app.get("/submit.ejs", (req, res) => {
  res.render("submit.ejs");
})

 


app.get("/tips.ejs", (req, res) => {
  res.render("tips.ejs");
});




app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});