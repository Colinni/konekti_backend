const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Your Firebase Service Account
const serviceAccount = {
  "type": "service_account",
  "project_id": "konekti-ef732",
  "private_key_id": "30b1bc3ffae1e621c61ba3f5c5720d7e3f9b6ff8",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDJ1Z8Sc+VFuQHm\nJudC1uuJChmbETyC1uvf7mqBFkV0jUgPTCKfYxA/Dfm2e4GqfmUIOOQux3Bo3Le/\nQLbP+CtevZHkg++U/A07coq6Agcgg1RZTx34pHo7saVqlVqnPelt03PIpOuxYdPy\nuLIUFCS+xC4V6dxxPpLvq/KsxdqTIZiM+5/hV9uW0W98PuhS7dBQa6XN3tUw1Oht\nWc3wNQoxeyidgr7lecmSRpBdqrfuEOOmeNh6S88yZd6PtPR2gTVdxLufYhAI5NG4\n4Jf1l+/kwHfyrM+lNV4qMUZmPYQuT9UiaAC3uth4b+ypsv9zW2e/F6vsp/HudOol\ncelNv6nhAgMBAAECggEAQfvyNNSp3Gj2+3i1e08LErK4G09/wmCkHYHy1L/ktg1o\nRQQFf6khyxN1E1j+U7BdtFnxE3AFSmr6MW7lNUlzWFZOZ3BQt5rNcqVoQBZgoRr+\nTPJGIJ8ZDQHvS9CHIgzmDw8ll69/FG8gnQYPxeut9aXqUSSy+lzUKcHDpQNMCXRK\nFVzfW1u/WNJAAXao4EFNgcv+ChSaeFjQf0gxb+Q0U4xuMK2BmYXo86GImB+TdXbq\nu033Mh7JjxeM42p+T6EBDxrrUlmxbNQtGYUdr8p7lkrZbpjJz1taFk5w1AhL0BsI\nq40pJIl+Bv1IPxAaJHIKkw4JX0SNvVU9PUA3HlfYZwKBgQDrTeOwHWHgb8ZHReci\nuRoJ0RLJiPpxx16uK+A08kEJ43MtKwSIZdnWHM8c96HAbY4PMenUwCryHIh3neNR\nrDS2SAmD6i0llLt0wvqnoYsKEf2HOxRQ0E3QmNubFWx2w12vM5KbNd2S/pLfxy/Y\nTVxfbHnFXblEjVtIy9dM1WWrfwKBgQDbliBDERq1OtKt3UJ+ZUIahGtREEst/EGX\nQTvW/br7Hb6lbHBWZn3EWhTCrJgZ93Pi2DAXNTb9aD9kGe5W07LL0/lCrFjIFX/U\nE9suyiJaPrjJl8S/U8hL9Q+71atNqM3ygAhFOGwJLDstRdK1cOwcrPaQfxoDkf4+\nZMa22HDanwKBgG3qpo+gShZjYEXu+3eW6/jl91a5a/Q2Y54M1OEmwQbzftv8mlN0\n8Hs6Xe10J9UR2Ch08nv1gJo0hfMKiCOgw8bag8dhXtGNVrvGUPx5U8/Sc5H2IRlX\nFOJ6ZSteqJoZzOuItdVXJjgCP23VSB5MlPfmXkO58k95kMjCn8I+dQ3VAoGBAMCc\naOQrRrAdTtuvLzpLe7Zi3PeYQTmvAaG5WNH2cmL+7lGQUuGWuU7YbUltt2Vfh0k9\ntMFGrluNa71UeZmzzCu6XfQ71Qx8v0m5uRLLv2JFjjVWaQAib5kg9pIelEpkfXHv\nGFIPccSCBc5qZq88w/9LQGPy+VCUaN017JBKPoOlAoGBALu2O/iRLab43fMmY+Kb\nPE2RwK5qp3E0b+RevprP8+K+RngjvCkGa9OOW5aYPu8+4KazbiCg4SpuWMQwL1CI\n2alwAR6fwk3B4iVk149Y8ZwYeao7vaHqx/0L7P4fZ6ooU5SL8Xsy3Cnbnq++nYqW\nL043x61FmRULxTtGdjgY+ni7\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@konekti-ef732.iam.gserviceaccount.com",
  "client_id": "109834527072726758144",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40konekti-ef732.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

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
