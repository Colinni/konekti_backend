const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// In-memory storage (resets when server restarts)
let posts = [];

// Get all posts
app.get('/api/posts', (req, res) => {
    res.json(posts);
});

// Create new post
app.post('/api/posts', (req, res) => {
    const post = req.body;
    post.id = 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    post.ts = new Date().toISOString();
    post.likes = post.likes || 0;
    post.likedBy = post.likedBy || [];
    
    posts.unshift(post);
    console.log('✅ Post created:', post.id);
    res.status(201).json(post);
});

// Like a post
app.post('/api/posts/:id/like', (req, res) => {
    const postId = req.params.id;
    const { userId } = req.body;
    
    const post = posts.find(p => p.id === postId);
    if (!post) {
        return res.status(404).json({ error: 'Post not found' });
    }
    
    const likedBy = post.likedBy || [];
    if (!likedBy.includes(userId)) {
        likedBy.push(userId);
        post.likes = (post.likes || 0) + 1;
        post.likedBy = likedBy;
    }
    
    res.json(post);
});

// Unlike a post
app.post('/api/posts/:id/unlike', (req, res) => {
    const postId = req.params.id;
    const { userId } = req.body;
    
    const post = posts.find(p => p.id === postId);
    if (!post) {
        return res.status(404).json({ error: 'Post not found' });
    }
    
    const likedBy = post.likedBy || [];
    const index = likedBy.indexOf(userId);
    if (index !== -1) {
        likedBy.splice(index, 1);
        post.likes = Math.max(0, (post.likes || 0) - 1);
        post.likedBy = likedBy;
    }
    
    res.json(post);
});

// Health check
app.get('/', (req, res) => {
    res.json({ 
        message: 'Konekti API running', 
        postsCount: posts.length,
        status: 'ok'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Konekti backend running on port ${PORT}`);
});
