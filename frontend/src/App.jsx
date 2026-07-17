import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import { PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { jsPDF } from 'jspdf';

const COLORS = ['#10b981', '#ef4444', '#2563eb'];
const AI_SERVICE_URL = 'http://localhost:8000/predict';
const AI_INSIGHTS_URL = 'http://localhost:8000/insights';
const BACKEND_URL = 'http://localhost:8080';
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
      aspects: [
        { aspect: 'Delivery', sentiment: 'Needs attention', score: 0.74 },
        { aspect: 'Battery', sentiment: 'Positive', score: 0.86 },
      ],
    };
  }
}

function AuthModal({ mode, onClose, onSuccess, onSwitch, notify }) {
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordStrength = useMemo(() => {
    if (!form.password) return 'Weak';
    const checks = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((regex) => regex.test(form.password)).length;
    if (checks >= 3) return 'Strong';
    if (checks >= 2) return 'Medium';
    return 'Weak';
  }, [form.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const endpoint = mode === 'login' ? `${BACKEND_URL}/api/auth/login` : `${BACKEND_URL}/api/auth/register`;
      const payload = mode === 'login' ? { email: form.email, password: form.password } : {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      };

      const response = await axios.post(endpoint, payload);
      setAuth(response.data.token);
      onSuccess();
      notify(mode === 'login' ? 'Login successful.' : 'Account created successfully.', 'success');
    } catch {
      setError(mode === 'login' ? 'Invalid email or password.' : 'Registration failed. Please try again.');
      notify(mode === 'login' ? 'Invalid email or password.' : 'Registration failed.', 'error');
    } finally {
      setIsSubmitting(false);
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
    <div className="modal-backdrop" onClick={onClose}>
      <div className="auth-modal" onClick={(event) => event.stopPropagation()}>
        <div className="auth-illustration">
          <div className="orb orb-one" />
          <div className="orb orb-two" />
          <div className="auth-illustration-card">
            <p className="eyebrow">AI Business Intelligence</p>
            <h2>IntelSense</h2>
            <p>Turn customer feedback into clear decisions with realtime AI insights.</p>
          </div>
        </div>
        <div className="auth-form-panel">
          <div className="auth-form-head">
            <div>
              <p className="eyebrow">Welcome</p>
              <h3>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h3>
            </div>
            <button type="button" className="icon-btn" onClick={onClose}>✕</button>
          </div>

          <form className="form" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className="split-inputs">
                <input placeholder="First Name" value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} />
                <input placeholder="Last Name" value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} />
              </div>
            )}
            <input placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            <input type="password" placeholder="Password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
            {mode === 'register' && (
              <>
                <input type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} />
                <div className="strength-row">
                  <span className={`strength-pill ${passwordStrength.toLowerCase()}`}>{passwordStrength}</span>
                  <span className="muted">Use 8+ characters with a number and symbol.</span>
                </div>
              </>
            )}
            {error && <p className="error">{error}</p>}
            <button type="submit" className="primary-btn full" disabled={isSubmitting}>
              {isSubmitting ? 'Working...' : mode === 'login' ? 'Login' : 'Create account'}
            </button>
          </form>

          <div className="auth-footer">
            <button type="button" className="ghost-btn full">Continue with Google</button>
            <button type="button" className="ghost-btn full">Continue with GitHub</button>
            <p className="muted text-center">
              {mode === 'login' ? 'No account yet?' : 'Already have an account?'}
              <button type="button" className="link-btn" onClick={onSwitch}>{mode === 'login' ? 'Register' : 'Login'}</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmationModal({ title, message, confirmLabel, onCancel, onConfirm, tone = 'default' }) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className={`modal-card confirmation-card ${tone}`} onClick={(event) => event.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button type="button" className="ghost-btn" onClick={onCancel}>Cancel</button>
          <button type="button" className={`primary-btn ${tone === 'danger' ? 'danger' : ''}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
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

function SessionExpiredModal({ onClose, onLoginAgain }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card session-card" onClick={(event) => event.stopPropagation()}>
        <h3>Session expired</h3>
        <p>Your session has expired for security reasons. Please sign in again to continue using IntelSense.</p>
        <div className="modal-actions">
          <button type="button" className="ghost-btn" onClick={onClose}>Close</button>
          <button type="button" className="primary-btn" onClick={onLoginAgain}>Login again</button>
        </div>
      </div>
    </div>
  );
}

function AdminPage() {
  const healthCards = [
    { label: 'Server Status', value: 'Healthy', tone: 'good' },
    { label: 'Database Status', value: 'Connected', tone: 'good' },
    { label: 'AI Service Status', value: 'Online', tone: 'good' },
    { label: 'API Requests', value: '12.4k / hr', tone: 'neutral' },
    { label: 'Active Sessions', value: '48', tone: 'neutral' },
  ];

  return (
    <div className="admin-shell">
      <section className="panel admin-hero">
        <div>
          <p className="eyebrow">Admin Command Center</p>
          <h2>Mission control for AI operations</h2>
          <p>Monitor product health, platform reliability, and live AI performance from one premium workspace.</p>
        </div>
        <div className="hero-badges">
          <span className="chip chip-green">● Core services healthy</span>
          <span className="chip">97.2% availability</span>
        </div>
      </section>

      <section className="admin-grid">
        {healthCards.map((item) => (
          <article key={item.label} className="service-card">
            <p>{item.label}</p>
            <h3>{item.value}</h3>
            <span className={`status-pill ${item.tone}`}>{item.tone === 'good' ? 'Operational' : 'Live'}</span>
          </article>
        ))}
      </section>

      <section className="grid two-col">
        <div className="panel">
          <div className="panel-head">
            <h3>Infrastructure Overview</h3>
            <span className="chip">Realtime</span>
          </div>
          <div className="command-list">
            <div><strong>CPU Load</strong><span>38%</span></div>
            <div><strong>Memory</strong><span>61%</span></div>
            <div><strong>Disk</strong><span>72%</span></div>
            <div><strong>Latency</strong><span>132 ms</span></div>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <h3>AI Operations</h3>
            <span className="chip">Automated</span>
          </div>
          <div className="command-list">
            <div><strong>Model</strong><span>BERT Base Uncased</span></div>
            <div><strong>Accuracy</strong><span>96.8%</span></div>
            <div><strong>Failed Requests</strong><span>0</span></div>
            <div><strong>Open Alerts</strong><span>2</span></div>
          </div>
        </div>
      </section>
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

function Dashboard({ onNotify, onRequestLogout, onSessionExpired }) {
function Dashboard({ onNotify }) {
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ productName: '', reviewText: '', rating: 5 });
  const [selectedReview, setSelectedReview] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [predictionCache, setPredictionCache] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [insights, setInsights] = useState({ summary: '', recommendation: '', alert: '', aspects: [] });
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantPrompt, setAssistantPrompt] = useState('Why did negative reviews increase?');
  const [activeView, setActiveView] = useState('overview');

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: '◉' },
    { id: 'analytics', label: 'Analytics', icon: '◌' },
    { id: 'reviews', label: 'Reviews', icon: '◍' },
    { id: 'insights', label: 'AI Insights', icon: '◎' },
    { id: 'reports', label: 'Reports', icon: '⬢' },
    { id: 'settings', label: 'Settings', icon: '⚙' },
  ];

  useEffect(() => {
    const loadReviews = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${BACKEND_URL}/api/reviews`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const nextReviews = response.data;
        setReviews(nextReviews);
        const nextInsights = await getInsights(nextReviews.map((review) => review.reviewText || ''));
        setInsights(nextInsights);
      } catch (error) {
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          onSessionExpired();
          return;
        }
        setReviews([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadReviews();
  }, [onSessionExpired]);

  const stats = useMemo(() => {
    const positive = reviews.filter((review) => review.rating >= 4).length;
    const negative = reviews.filter((review) => review.rating <= 2).length;
    const neutral = reviews.filter((review) => review.rating === 3).length;
    const avg = reviews.length ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : '0.0';
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.productName.trim() || !form.reviewText.trim()) {
      onNotify('Please complete the review form before submitting.', 'warning');
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.productName.trim() || !form.reviewText.trim()) {
      onNotify('Please complete the review form before submitting.');
      return;
    }

    try {
      const prediction = await getPrediction(form.reviewText);
      await axios.post(`${BACKEND_URL}/api/reviews`, form, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const response = await axios.get(`${BACKEND_URL}/api/reviews`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const nextReviews = response.data;
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
      onNotify(`Review saved. AI sentiment: ${prediction.sentiment}`, 'success');
    } catch (error) {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        onSessionExpired();
        return;
      }
      onNotify('Review could not be saved right now.', 'error');
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
    setPredictionCache((previous) => ({ ...previous, [review.id]: prediction }));
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
    onNotify('Report exported as PDF', 'success');
  };

  const assistantResponses = {
    'Why did negative reviews increase?': 'Negative sentiment is rising around delivery delays and battery performance. The strongest signal is weekend shipping congestion.',
    'Show battery complaints.': 'Battery-related feedback has dropped 8% this month, but it remains the most repeated pain point in premium devices.',
    'Summarize this month\'s feedback.': 'Overall satisfaction increased by 12% this month, with higher confidence in onboarding and product quality.',
    'Which product performs best?': 'The Aurora Pro line is outperforming the rest, with the highest sentiment score and the fewest unresolved complaints.',
  };

  const renderSectionContent = () => {
    switch (activeView) {
      case 'analytics':
        return (
          <section className="grid two-col">
            <div className="panel">
              <div className="panel-head">
                <h3>Sentiment Distribution</h3>
                <span className="chip">Live</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={76} isAnimationActive animationDuration={800}>
                    {chartData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="panel">
              <div className="panel-head">
                <h3>Weekly Trend</h3>
                <span className="chip">Updated</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="reviews" fill="#2563eb" isAnimationActive animationDuration={800} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        );
      case 'reviews':
        return (
          <section className="grid two-col">
            <div className="panel">
              <div className="panel-head">
                <h3>Recent Reviews</h3>
                <div className="filter-row">
                  <input placeholder="Search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
                  <select value={filterBy} onChange={(event) => setFilterBy(event.target.value)}>
                    <option value="all">All</option>
                    <option value="positive">Positive</option>
                    <option value="negative">Negative</option>
                    <option value="neutral">Neutral</option>
                  </select>
                </div>
              </div>
              {isLoading ? (
                <div className="skeleton-stack">
                  <div className="skeleton-line" />
                  <div className="skeleton-line short" />
                  <div className="skeleton-line" />
                </div>
              ) : filteredReviews.length ? (
                <ul className="list">
                  {filteredReviews.map((review) => (
                    <li key={review.id} className="list-item" onClick={() => openReview(review)}>
                      <div className="list-item-top">
                        <strong>{review.productName}</strong>
                        <span>{review.rating}/5</span>
                      </div>
                      <p>{review.reviewText}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-state">
                  <h4>No reviews yet</h4>
                  <p>Submit your first review to begin seeing AI-driven insights.</p>
                </div>
              )}
            </div>
            <div className="panel">
              <div className="panel-head">
                <h3>Submit Review</h3>
                <span className="chip">Instant AI analysis</span>
              </div>
              <form className="form" onSubmit={handleSubmit}>
                <input placeholder="Product Name" value={form.productName} onChange={(event) => setForm({ ...form, productName: event.target.value })} />
                <input placeholder="Review Text" value={form.reviewText} onChange={(event) => setForm({ ...form, reviewText: event.target.value })} />
                <input type="number" min="1" max="5" value={form.rating} onChange={(event) => setForm({ ...form, rating: Number(event.target.value) })} />
                <button type="submit" className="primary-btn">Save Review</button>
              </form>
            </div>
          </section>
        );
      case 'insights':
        return (
          <section className="grid two-col">
            <div className="panel">
              <div className="panel-head">
                <h3>Smart Insight</h3>
                <span className="chip">AI generated</span>
              </div>
              <div className="insight-card">
                <p>{insights.summary || 'Customer sentiment remains healthy and stable.'}</p>
                <p>{insights.recommendation || 'Strengthen weekend logistics and support follow-ups.'}</p>
                <p>{insights.alert || 'No severe anomalies detected.'}</p>
              </div>
            </div>
            <div className="panel">
              <div className="panel-head">
                <h3>Aspect Signals</h3>
                <span className="chip">Realtime</span>
              </div>
              <div className="aspect-list">
                {insights.aspects.length ? insights.aspects.map((aspect) => (
                  <div key={aspect.aspect} className="aspect-pill">
                    <strong>{aspect.aspect}</strong>
                    <span>{aspect.sentiment}</span>
                  </div>
                )) : <p className="muted">No aspect signals yet.</p>}
              </div>
            </div>
          </section>
        );
      case 'reports':
        return (
          <section className="grid two-col">
            <div className="panel">
              <div className="panel-head">
                <h3>Executive Report</h3>
                <button className="ghost-btn" onClick={handleExport}>Export PDF</button>
              </div>
              <div className="insight-card">
                <p>Total reviews analyzed: {stats.total}</p>
                <p>Positive trend is accelerating by 11% week over week.</p>
                <p>Delivery issues are the strongest recurring complaint.</p>
              </div>
            </div>
            <div className="panel">
              <div className="panel-head">
                <h3>Command Center</h3>
                <span className="chip">Model status</span>
              </div>
              <div className="command-list">
                <div><strong>Model</strong><span>BERT Base Uncased</span></div>
                <div><strong>Version</strong><span>v1.0</span></div>
                <div><strong>Accuracy</strong><span>96.8%</span></div>
                <div><strong>Predictions</strong><span>1,248 today</span></div>
              </div>
            </div>
          </section>
        );
      case 'settings':
        return (
          <section className="grid two-col">
            <div className="panel">
              <div className="panel-head">
                <h3>Appearance</h3>
                <span className="chip">Personalized</span>
              </div>
              <div className="setting-list">
                <label className="setting-row"><span>Compact density</span><input type="checkbox" /></label>
                <label className="setting-row"><span>Show AI assistant</span><input type="checkbox" defaultChecked /></label>
              </div>
            </div>
            <div className="panel">
              <div className="panel-head">
                <h3>Notifications</h3>
                <span className="chip">Active</span>
              </div>
              <div className="setting-list">
                <label className="setting-row"><span>Weekly report email</span><input type="checkbox" defaultChecked /></label>
                <label className="setting-row"><span>Critical alerts</span><input type="checkbox" defaultChecked /></label>
              </div>
            </div>
          </section>
        );
      default:
        return (
          <>
            <section className="hero-grid">
              <div className="panel panel-hero">
                <div>
                  <p className="eyebrow">Live intelligence</p>
                  <h3>Turn feedback into a sharper product strategy.</h3>
                  <p>{insights.summary || 'Collecting fresh signals from your product feedback streams.'}</p>
                </div>
                <div className="hero-badges">
                  <span className="chip chip-green">● Online</span>
                  <span className="chip">BERT Base</span>
                  <span className="chip">96.8% accuracy</span>
                </div>
              </div>
              <div className="panel ai-health">
                <div className="panel-head">
                  <h3>AI Health</h3>
                  <span className="chip chip-green">● Online</span>
                </div>
                <div className="health-metrics">
                  <div>
                    <strong>Model</strong>
                    <p>BERT Base</p>
                  </div>
                  <div>
                    <strong>Accuracy</strong>
                    <p>96.8%</p>
                  </div>
                  <div>
                    <strong>Latency</strong>
                    <p>142 ms</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="stats-grid">
              <article className="stat-card">
                <p>Total reviews</p>
                <h3>{stats.total}</h3>
              </article>
              <article className="stat-card success">
                <p>Positive</p>
                <h3>{stats.positive}</h3>
              </article>
              <article className="stat-card danger">
                <p>Negative</p>
                <h3>{stats.negative}</h3>
              </article>
              <article className="stat-card neutral">
                <p>Neutral</p>
                <h3>{stats.neutral}</h3>
              </article>
            </section>

            <section className="grid two-col">
              <div className="panel">
                <div className="panel-head">
                  <h3>Submit Review</h3>
                  <span className="chip">Instant AI analysis</span>
                </div>
                <form className="form" onSubmit={handleSubmit}>
                  <input placeholder="Product Name" value={form.productName} onChange={(event) => setForm({ ...form, productName: event.target.value })} />
                  <input placeholder="Review Text" value={form.reviewText} onChange={(event) => setForm({ ...form, reviewText: event.target.value })} />
                  <input type="number" min="1" max="5" value={form.rating} onChange={(event) => setForm({ ...form, rating: Number(event.target.value) })} />
                  <button type="submit" className="primary-btn">Save Review</button>
                </form>
              </div>
              <div className="panel">
                <div className="panel-head">
                  <h3>Smart Insight</h3>
                  <span className="chip">AI generated</span>
                </div>
                <div className="insight-card">
                  <p>{insights.summary || 'Customer sentiment remains healthy and stable.'}</p>
                  <p>{insights.recommendation || 'Strengthen weekend logistics and support follow-ups.'}</p>
                  <p>{insights.alert || 'No severe anomalies detected.'}</p>
                </div>
              </div>
            </section>
          </>
        );
    }
  };

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div>
          <div className="brand-block">
            <div className="brand-mark">I</div>
            <div>
              <p className="eyebrow">AI Platform</p>
              <h3>IntelSense</h3>
            </div>
          </div>
          <nav className="sidebar-nav">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`sidebar-link ${activeView === item.id ? 'active' : ''}`}
                onClick={() => setActiveView(item.id)}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="sidebar-footer">
          <div className="profile-pill">
            <div className="avatar">JD</div>
            <div>
              <strong>Jane Doe</strong>
              <p>Product Lead</p>
            </div>
          </div>
          <button className="ghost-btn full" onClick={onRequestLogout}>Logout</button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <p className="eyebrow">AI Business Intelligence</p>
            <h2>{sidebarItems.find((item) => item.id === activeView)?.label || 'Overview'}</h2>
          </div>
          <div className="topbar-actions">
            <div className="search-pill">🔍 Search users, reviews, reports</div>
            <button className="ghost-btn" onClick={handleExport}>Export</button>
          </div>
        </header>

        {renderSectionContent()}
      </main>

      <button className="assistant-fab" onClick={() => setAssistantOpen((value) => !value)}>✦</button>
      {assistantOpen && (
        <div className="assistant-panel">
          <div className="panel-head">
            <h3>AI Assistant</h3>
            <button className="icon-btn" onClick={() => setAssistantOpen(false)}>✕</button>
          </div>
          <div className="assistant-prompts">
            {Object.keys(assistantResponses).map((prompt) => (
              <button key={prompt} className="ghost-btn prompt-btn" onClick={() => setAssistantPrompt(prompt)}>{prompt}</button>
            ))}
          </div>
          <div className="assistant-response">
            <p className="eyebrow">Prompt</p>
            <p>{assistantPrompt}</p>
            <p className="eyebrow">Response</p>
            <p>{assistantResponses[assistantPrompt]}</p>
          </div>
        </div>
      )}

      {selectedReview && (
        <div className="modal-backdrop" onClick={() => setSelectedReview(null)}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
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
                <p><strong>Sentiment:</strong> {predictionCache[selectedReview.id]?.sentiment || 'Neutral'}</p>
                <p><strong>Confidence:</strong> {(predictionCache[selectedReview.id]?.confidence || 0.6).toFixed(2)}</p>
                <p><strong>Recommendation:</strong> Improve staffing during peak weekends and fast-track shipping issues.</p>
              </>
            )}
            <button className="primary-btn" onClick={() => setSelectedReview(null)}>Close</button>
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

function LandingPage({ onOpenAuth }) {
  return (
    <div className="landing-shell">
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">AI Business Intelligence Platform</p>
          <h1>Transform customer feedback into business intelligence.</h1>
          <p>IntelSense turns reviews, support signals, and product conversations into elegant, actionable insight for modern teams.</p>
          <div className="hero-actions">
            <button className="primary-btn" onClick={() => onOpenAuth('register')}>Get Started</button>
            <button className="ghost-btn" onClick={() => onOpenAuth('login')}>Watch Demo</button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="visual-card">
            <div className="visual-ring" />
            <div className="visual-bubbles">
              <span>Sentiment</span>
              <span>Insights</span>
              <span>Reports</span>
            </div>
          </div>
        </div>
      </section>

      <section className="feature-grid">
        <article className="feature-card">
          <h3>Realtime analysis</h3>
          <p>Fast sentiment scoring, aspect discovery, and alerting that feels native to modern AI products.</p>
        </article>
        <article className="feature-card">
          <h3>Executive-ready summaries</h3>
          <p>Turn dense review data into crisp recommendations your team can act on immediately.</p>
        </article>
        <article className="feature-card">
          <h3>Premium experience</h3>
          <p>Minimal layout, blur effects, modal flows, and polished feedback keep the product feeling refined.</p>
        </article>
      </section>
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getToken()));
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [toast, setToast] = useState(null);
  const [authModal, setAuthModal] = useState(null);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [sessionExpiredOpen, setSessionExpiredOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications] = useState([
    { id: 1, title: 'Negative reviews rising', message: 'Delivery complaints increased 8% this week.', time: '2m ago', unread: true },
    { id: 2, title: 'AI model retrained', message: 'The insight model completed a fresh training cycle.', time: '18m ago', unread: true },
    { id: 3, title: 'Weekly report ready', message: 'Your executive report is available for export.', time: '1h ago', unread: false },
  ]);
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
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setAuthModal(null);
  };

  const handleLogoutRequest = () => {
    if (isAuthenticated) {
      setLogoutModalOpen(true);
    }
  };

  const handleLogoutConfirm = () => {
    removeAuth();
    setIsAuthenticated(false);
    setLogoutModalOpen(false);
    setToast({ type: 'success', message: 'You have been logged out.' });
  };

  const handleSessionExpired = () => {
    setSessionExpiredOpen(true);
  };

  const handleLoginAgain = () => {
    setSessionExpiredOpen(false);
    setAuthModal('login');
  };

  const unreadCount = notifications.filter((item) => item.unread).length;

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
          <Link to="/" className="brand-link">IntelSense</Link>
          {isAuthenticated ? <Link to="/dashboard">Dashboard</Link> : null}
        </div>
        <div className="nav-actions">
          <button type="button" className="icon-btn" onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          {isAuthenticated ? (
            <>
              <div className="notification-wrapper">
                <button type="button" className="icon-btn notification-btn" onClick={() => setNotificationsOpen((value) => !value)}>
                  🔔
                  {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                </button>
                {notificationsOpen && (
                  <div className="notification-dropdown">
                    <div className="notification-header">
                      <strong>Notifications</strong>
                      <span>{unreadCount} unread</span>
                    </div>
                    {notifications.map((item) => (
                      <div key={item.id} className={`notification-item ${item.unread ? 'unread' : ''}`}>
                        <strong>{item.title}</strong>
                        <p>{item.message}</p>
                        <span>{item.time}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Link to="/admin" className="ghost-btn">Admin</Link>
              <button type="button" className="ghost-btn" onClick={handleLogoutRequest}>Logout</button>
            </>
          ) : (
            <>
              <button type="button" className="ghost-btn" onClick={() => setAuthModal('login')}>Login</button>
              <button type="button" className="primary-btn" onClick={() => setAuthModal('register')}>Register</button>
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

      {toast && (
        <div className={`toast ${toast.type || 'success'}`}>
          <span>{toast.type === 'error' ? '✕' : toast.type === 'warning' ? '⚠' : '✓'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={() => setAuthModal(null)}
          onSuccess={handleAuthSuccess}
          onSwitch={() => setAuthModal(authModal === 'login' ? 'register' : 'login')}
          notify={(message, type) => setToast({ message, type })}
        />
      )}

      {logoutModalOpen && (
        <ConfirmationModal
          title="Logout confirmation"
          message="Are you sure you want to log out of IntelSense?"
          confirmLabel="Logout"
          onCancel={() => setLogoutModalOpen(false)}
          onConfirm={handleLogoutConfirm}
          tone="danger"
        />
      )}

      {sessionExpiredOpen && (
        <SessionExpiredModal onClose={() => setSessionExpiredOpen(false)} onLoginAgain={handleLoginAgain} />
      )}

      <Routes>
        <Route path="/" element={<LandingPage onOpenAuth={(mode) => setAuthModal(mode)} />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard onNotify={(message, type) => setToast({ message, type })} onRequestLogout={handleLogoutRequest} onSessionExpired={handleSessionExpired} /> : <Navigate to="/" />} />
        <Route path="/admin" element={isAuthenticated ? <AdminPage /> : <Navigate to="/" />} />
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
