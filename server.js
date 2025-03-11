// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files from 'public' directory



// ----- CAFFEINE ENTRIES ROUTES -----
// GET all caffeine entries
app.get('/api/caffeine', async (req, res) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/caffeineTimer`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${req.headers.authorization?.split(' ')[1] || SUPABASE_ANON_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Supabase returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('GET request error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET specific caffeine entry
app.get('/api/caffeine/:id', async (req, res) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/caffeineTimer/${req.params.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${req.headers.authorization?.split(' ')[1] || SUPABASE_ANON_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Supabase returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('GET request error:', error);
    res.status(500).json({ error: error.message });
  }
});

// CREATE caffeine entry
app.post('/api/caffeine', async (req, res) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/caffeineTimer`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${req.headers.authorization?.split(' ')[1] || SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });
    
    if (!response.ok) {
      throw new Error(`Supabase returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('POST request error:', error);
    res.status(500).json({ error: error.message });
  }
});

// UPDATE caffeine entry
app.put('/api/caffeine/:id', async (req, res) => {
  try {
    // Add id to the request body
    const body = { ...req.body, id: req.params.id };
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/caffeineTimer`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${req.headers.authorization?.split(' ')[1] || SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      throw new Error(`Supabase returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('PUT request error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE caffeine entry
app.delete('/api/caffeine/:id', async (req, res) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/caffeineTimer`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${req.headers.authorization?.split(' ')[1] || SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: req.params.id })
    });
    
    if (!response.ok) {
      throw new Error(`Supabase returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('DELETE request error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ----- WELLNESS CHECK-IN ROUTES -----
// GET all wellness check-ins
app.get('/api/wellness', async (req, res) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/wellnessCheckin`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${req.headers.authorization?.split(' ')[1] || SUPABASE_ANON_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Supabase returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('GET request error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET specific wellness check-in
app.get('/api/wellness/:id', async (req, res) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/wellnessCheckin/${req.params.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${req.headers.authorization?.split(' ')[1] || SUPABASE_ANON_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Supabase returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('GET request error:', error);
    res.status(500).json({ error: error.message });
  }
});

// CREATE wellness check-in
app.post('/api/wellness', async (req, res) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/wellnessCheckin`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${req.headers.authorization?.split(' ')[1] || SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });
    
    if (!response.ok) {
      throw new Error(`Supabase returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('POST request error:', error);
    res.status(500).json({ error: error.message });
  }
});

// UPDATE wellness check-in
app.put('/api/wellness/:id', async (req, res) => {
  try {
    // Add id to the request body
    const body = { ...req.body, id: req.params.id };
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/wellnessCheckin`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${req.headers.authorization?.split(' ')[1] || SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      throw new Error(`Supabase returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('PUT request error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE wellness check-in
app.delete('/api/wellness/:id', async (req, res) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/wellnessCheckin`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${req.headers.authorization?.split(' ')[1] || SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: req.params.id })
    });
    
    if (!response.ok) {
      throw new Error(`Supabase returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('DELETE request error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
