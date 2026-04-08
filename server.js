const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize Firebase
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const postsCollection = db.collection('posts');

// Get all posts (everyone sees all posts)
app.get('/api/posts', async (req, res) => {
    try {
        const snapshot = await postsCollection.orderBy('ts', 'desc').get();
        const posts = [];
        snapshot.forEach(doc => posts.push(doc.data()));
        res.json(posts);
    } catch (err) {
        console.error('Error fetching posts:', err);
        res.status(500).json({ error: err.message });
    }
});

// Create new post
app.post('/api/posts', async (req, res) => {
    try {
        const post = req.body;
        post.id = 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        post.ts = new Date().toISOString();
        post.likes = post.likes || 0;
        post.likedBy = post.likedBy || [];
        
        await postsCollection.doc(post.id).set(post);
        console.log('✅ Post saved:', post.id);
        res.status(201).json(post);
    } catch (err) {
        console.error('Error saving post:', err);
        res.status(500).json({ error: err.message });
    }
});

// Like a post
app.post('/api/posts/:id/like', async (req, res) => {
    try {
        const postId = req.params.id;
        const { userId } = req.body;
        
        const doc = await postsCollection.doc(postId).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        const post = doc.data();
        const likedBy = post.likedBy || [];
        
        if (!likedBy.includes(userId)) {
            likedBy.push(userId);
            await postsCollection.doc(postId).update({
                likes: admin.firestore.FieldValue.increment(1),
                likedBy: likedBy
            });
        }
        
        const updated = (await postsCollection.doc(postId).get()).data();
        res.json(updated);
    } catch (err) {
        console.error('Error liking post:', err);
        res.status(500).json({ error: err.message });
    }
});

// Unlike a post
app.post('/api/posts/:id/unlike', async (req, res) => {
    try {
        const postId = req.params.id;
        const { userId } = req.body;
        
        const doc = await postsCollection.doc(postId).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        const post = doc.data();
        const likedBy = post.likedBy || [];
        const index = likedBy.indexOf(userId);
        
        if (index !== -1) {
            likedBy.splice(index, 1);
            await postsCollection.doc(postId).update({
                likes: admin.firestore.FieldValue.increment(-1),
                likedBy: likedBy
            });
        }
        
        const updated = (await postsCollection.doc(postId).get()).data();
        res.json(updated);
    } catch (err) {
        console.error('Error unliking post:', err);
        res.status(500).json({ error: err.message });
    }
});

// Health check
app.get('/', (req, res) => {
    res.json({ message: 'Konekti API with Firebase', status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`🚀 Konekti backend running on port ${PORT}`);
});
