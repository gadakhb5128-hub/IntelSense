import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import { PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { jsPDF } from 'jspdf';

const COLORS = ['#22c55e', '#ef4444', '#3b82f6'];
const AI_SERVICE_URL = 'http://localhost:8000/predict';
const AI_INSIGHTS_URL = 'http://localhost:8000/insights';

function getToken() {
  return localStorage.getItem('token');
}

function setAuth(token) {
  localStorage.setItem('token', token);
}

function removeAuth() {
  localStorage.removeItem('token');
}

async function getPrediction(reviewText) {
  try {
    const response = await axios.post(AI_SERVICE_URL, { review: reviewText });
    return response.data;
  } catch {
    return { sentiment: 'Neutral', confidence: 0.6 };
  }
}

async function getInsights(reviews) {
  try {
    const response = await axios.post(AI_INSIGHTS_URL, { reviews });
    return response.data;
  } catch {
    return {
      summary: 'Customer sentiment remains stable.',
      recommendation: 'Continue improving the most frequent pain points.',
      alert: 'No critical alert triggered.',
      aspects: [],
    };
  }
}

function Login({ onLogin, onSwitch }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8080/api/auth/login', form);
      setAuth(res.data.token);
      onLogin();
    } catch {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="container">
      <div className="card auth-card">
        <h2>Login to IntelSense</h2>
        <form className="form" onSubmit={handleSubmit}>
          <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {error && <p className="error">{error}</p>}
          <button type="submit">Login</button>
        </form>
        <p className="muted">No account yet? <button type="button" className="link-btn" onClick={onSwitch}>Register here</button></p>
      </div>
    </div>
  );
}

function Register({ onLogin, onSwitch }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8080/api/auth/register', form);
      setAuth(res.data.token);
      onLogin();
    } catch {
      setError('Registration failed');
    }
  };

  return (
    <div className="container">
      <div className="card auth-card">
        <h2>Create Account</h2>
        <form className="form" onSubmit={handleSubmit}>
          <input placeholder="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          <input placeholder="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {error && <p className="error">{error}</p>}
          <button type="submit">Register</button>
        </form>
        <p className="muted">Already have an account? <button type="button" className="link-btn" onClick={onSwitch}>Login here</button></p>
      </div>
    </div>
  );
}

function Dashboard({ onNotify }) {
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ productName: '', reviewText: '', rating: 5 });
  const [selectedReview, setSelectedReview] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [predictionCache, setPredictionCache] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState({ summary: '', recommendation: '', alert: '', aspects: [] });

  useEffect(() => {
    axios.get('http://localhost:8080/api/reviews', {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(async (res) => {
        const nextReviews = res.data;
        setReviews(nextReviews);
        const nextInsights = await getInsights(nextReviews.map((review) => review.reviewText || ''));
        setInsights(nextInsights);
      })
      .catch(() => setReviews([]));
  }, []);

  const stats = useMemo(() => {
    const positive = reviews.filter((r) => r.rating >= 4).length;
    const negative = reviews.filter((r) => r.rating <= 2).length;
    const neutral = reviews.filter((r) => r.rating === 3).length;
    const avg = reviews.length ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '0.0';
    return { positive, negative, neutral, avg, total: reviews.length };
  }, [reviews]);

  const chartData = [
    { name: 'Positive', value: stats.positive },
    { name: 'Negative', value: stats.negative },
    { name: 'Neutral', value: stats.neutral },
  ];

  const trendData = [
    { month: 'Jan', reviews: 2 },
    { month: 'Feb', reviews: 4 },
    { month: 'Mar', reviews: 3 },
    { month: 'Apr', reviews: 5 },
    { month: 'May', reviews: 6 },
  ];

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const haystack = `${review.productName} ${review.reviewText}`.toLowerCase();
      const matchesSearch = haystack.includes(searchTerm.toLowerCase());
      let matchesFilter = true;

      if (filterBy === 'positive') matchesFilter = review.rating >= 4;
      if (filterBy === 'negative') matchesFilter = review.rating <= 2;
      if (filterBy === 'neutral') matchesFilter = review.rating === 3;

      return matchesSearch && matchesFilter;
    });
  }, [filterBy, reviews, searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.productName.trim() || !form.reviewText.trim()) {
      onNotify('Please complete the review form before submitting.');
      return;
    }

    try {
      const prediction = await getPrediction(form.reviewText);
      await axios.post('http://localhost:8080/api/reviews', form, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const res = await axios.get('http://localhost:8080/api/reviews', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const nextReviews = res.data;
      setReviews(nextReviews);
      const nextInsights = await getInsights(nextReviews.map((review) => review.reviewText || ''));
      setInsights(nextInsights);
      setForm({ productName: '', reviewText: '', rating: 5 });
      onNotify(`Review saved. AI sentiment: ${prediction.sentiment}`);
    } catch {
      onNotify('Review could not be saved right now.');
    }
  };

  const openReview = async (review) => {
    setSelectedReview(review);
    if (predictionCache[review.id]) return;

    setIsAnalyzing(true);
    const prediction = await getPrediction(review.reviewText);
    setPredictionCache((prev) => ({ ...prev, [review.id]: prediction }));
    setIsAnalyzing(false);
  };

  const handleExport = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('IntelSense Report', 14, 16);
    doc.setFontSize(11);
    doc.text(`Total Reviews: ${stats.total}`, 14, 32);
    doc.text(`Positive: ${stats.positive}`, 14, 40);
    doc.text(`Negative: ${stats.negative}`, 14, 48);
    doc.text(`Neutral: ${stats.neutral}`, 14, 56);
    doc.text(`Average Rating: ${stats.avg}`, 14, 64);
    doc.save('intelsense-report.pdf');
    onNotify('Report exported as PDF');
  };

  return (
    <div className="container">
      <div className="hero-panel">
        <div>
          <p className="eyebrow">AI Business Intelligence</p>
          <h1>IntelSense Dashboard</h1>
          <p>Track feedback, sentiment trends, and product performance in one place.</p>
        </div>
        <div className="glass-card">
          <h3>AI Customer Intelligence</h3>
          <p><strong>Executive Summary:</strong> {insights.summary || 'Collecting review signals…'}</p>
          <p><strong>Recommendation:</strong> {insights.recommendation || 'Waiting for fresh feedback.'}</p>
          <p><strong>Alert:</strong> {insights.alert || 'Monitoring sentiment.'}</p>
        </div>
      </div>

      <div className="grid stats-grid">
        <div className="stat-card"><h3>{stats.total}</h3><p>Total Reviews</p></div>
        <div className="stat-card success"><h3>{stats.positive}</h3><p>Positive Reviews</p></div>
        <div className="stat-card danger"><h3>{stats.negative}</h3><p>Negative Reviews</p></div>
        <div className="stat-card"><h3>{stats.neutral}</h3><p>Neutral Reviews</p></div>
        <div className="stat-card"><h3>{stats.avg}</h3><p>Average Rating</p></div>
      </div>

      <div className="grid charts-grid">
        <div className="card">
          <h3>Sentiment Distribution</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={80}>
                {chartData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3>Monthly Trends</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="reviews" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {insights.alert && <div className="alert-banner">{insights.alert}</div>}

      <div className="grid two-col">
        <div className="card">
          <h3>Submit Review</h3>
          <form className="form" onSubmit={handleSubmit}>
            <input placeholder="Product Name" value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} />
            <input placeholder="Review Text" value={form.reviewText} onChange={(e) => setForm({ ...form, reviewText: e.target.value })} />
            <input type="number" min="1" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} />
            <button type="submit">Save Review</button>
          </form>
        </div>
        <div className="card">
          <h3>Aspect-Based Insights</h3>
          <div className="aspect-list">
            {insights.aspects.length ? insights.aspects.map((aspect) => (
              <div key={aspect.aspect} className="aspect-pill">
                <strong>{aspect.aspect}</strong>
                <span>{aspect.sentiment}</span>
                <small>Score {aspect.score}</small>
              </div>
            )) : <p className="muted">No aspect signals yet.</p>}
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Recent Reviews</h3>
        <div className="controls-row">
          <input placeholder="Search reviews" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <select value={filterBy} onChange={(e) => setFilterBy(e.target.value)}>
            <option value="all">All</option>
            <option value="positive">Positive</option>
            <option value="negative">Negative</option>
            <option value="neutral">Neutral</option>
          </select>
        </div>
        <ul className="list">
          {filteredReviews.map((review) => (
            <li key={review.id} className="list-item" onClick={() => openReview(review)}>
              <strong>{review.productName}</strong>
              <span>{review.reviewText}</span>
              <small>{review.rating}/5</small>
            </li>
          ))}
        </ul>
      </div>

      <div className="card report-card">
        <div className="report-header">
          <h3>Reports</h3>
          <button onClick={handleExport}>Export PDF</button>
        </div>
      </div>

      {selectedReview && (
        <div className="modal-backdrop" onClick={() => setSelectedReview(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>AI Prediction</h3>
            <p><strong>Original Review:</strong> {selectedReview.reviewText}</p>
            {isAnalyzing ? (
              <p>Analyzing sentiment…</p>
            ) : (
              <>
                <p><strong>Predicted Sentiment:</strong> {predictionCache[selectedReview.id]?.sentiment || 'Neutral'}</p>
                <p><strong>Confidence:</strong> {(predictionCache[selectedReview.id]?.confidence || 0.6).toFixed(2)}</p>
              </>
            )}
            <button onClick={() => setSelectedReview(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getToken()));
  const [authMode, setAuthMode] = useState('login');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleAuth = () => setIsAuthenticated(true);
  const handleLogout = () => {
    removeAuth();
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <nav className="top-nav">
        <div className="nav-links">
          <Link to="/">IntelSense</Link>
          {isAuthenticated ? <Link to="/dashboard">Dashboard</Link> : null}
        </div>
        <div className="nav-actions">
          <button type="button" className="theme-toggle" onClick={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}>
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
          {isAuthenticated ? (
            <button type="button" className="logout-btn" onClick={handleLogout}>Logout</button>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </nav>
      {toast && <div className="toast toast-inline">{toast}</div>}
      <Routes>
        <Route path="/" element={<div className="container hero-section"><div className="card hero-card"><h2>Welcome to IntelSense</h2><p>Your modern AI platform for customer sentiment analysis, business insights, and analytics.</p><Link to="/dashboard" className="hero-btn">Get Started</Link></div></div>} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : (authMode === 'login' ? <Login onLogin={handleAuth} onSwitch={() => setAuthMode('register')} /> : <Register onLogin={handleAuth} onSwitch={() => setAuthMode('login')} />)} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : (authMode === 'register' ? <Register onLogin={handleAuth} onSwitch={() => setAuthMode('login')} /> : <Login onLogin={handleAuth} onSwitch={() => setAuthMode('register')} />)} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard onNotify={setToast} /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
