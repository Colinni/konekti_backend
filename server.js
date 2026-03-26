const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let posts = [];

// Get all posts
app.get('/api/posts', (req, res) => {
    res.json(posts);
});

// Create new post
app.post('/api/posts', (req, res) => {
    const post = req.body;
    post.id = 'p_' + Date.now();
    post.ts = new Date().toISOString();
    post.likes = post.likes || 0;
    posts.unshift(post);
    res.status(201).json(post);
});

// Like a post
app.post('/api/posts/:id/like', (req, res) => {
    const post = posts.find(p => p.id === req.params.id);
    if (post) {
        post.likes = (post.likes || 0) + 1;
        res.json(post);
    } else {
        res.status(404).json({ error: 'Not found' });
    }
});

// Unlike a post
app.post('/api/posts/:id/unlike', (req, res) => {
    const post = posts.find(p => p.id === req.params.id);
    if (post && post.likes > 0) {
        post.likes = post.likes - 1;
        res.json(post);
    } else {
        res.status(404).json({ error: 'Not found' });
    }
});

app.get('/', (req, res) => {
    res.json({ message: 'Konekti API running', postsCount: posts.length });
});

app.listen(PORT, () => {
    console.log(`Konekti backend running on port ${PORT}`);
});