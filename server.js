const express = require('express');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const { sendEmail } = require('./email');

const app = express();
const PORT = process.env.PORT || 3006;
const ROOT = __dirname;
const USERS_FILE = path.join(ROOT, 'users.json');

// ------------- helpers -------------
function readUsers() {
  try { return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8') || '[]'); }
  catch { return []; }
}
function writeUsers(list) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(list, null, 2));
}
function isAuthed(req) {
  return !!(req.session && req.session.user) || (req.isAuthenticated && req.isAuthenticated());
}

// ------------- middleware -------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { sameSite: 'lax', secure: false } // secure=false for http (localhost)
}));

app.use(passport.initialize());
app.use(passport.session());

// ------------- Google OAuth (conditional) -------------
const hasGoogleOAuth = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
if (hasGoogleOAuth) {
  passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3006/auth/google/callback'
    },
    (accessToken, refreshToken, profile, done) => done(null, profile)
  ));
  passport.serializeUser((u, done) => done(null, u));
  passport.deserializeUser((u, done) => done(null, u));

  app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/index.html' }),
    (req, res) => res.redirect('/dashboard.html')
  );
} else {
  console.log('🔕 Google OAuth disabled (missing GOOGLE_CLIENT_ID/SECRET)');
}

// ------------- static files -------------
app.use(express.static(ROOT));

// ------------- auth guard -------------
app.use((req, res, next) => {
  const needAuth = ['/dashboard.html', '/setting.html'];
  if (needAuth.includes(req.path) && !isAuthed(req)) {
    return res.redirect('/index.html');
  }
  next();
});

// ------------- auth routes -------------
app.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.json({ success: false, message: 'Missing fields' });
  const users = readUsers();
  const ok = users.some(u => u.username === username && u.password === password);
  if (!ok) return res.json({ success: false, message: 'Invalid username or password' });
  req.session.user = { username };
  res.json({ success: true, message: 'success' });
});

app.post('/signup', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.json({ success: false, message: 'Missing fields' });
  const users = readUsers();
  if (users.some(u => u.username === username)) {
    return res.json({ success: false, message: 'User exists' });
  }
  users.push({ username, password }); writeUsers(users);
  res.json({ success: true, message: 'success' });
});

app.post('/logout', (req, res) => {
  req.logout && req.logout(() => {});
  if (req.session) req.session.destroy(() => res.json({ success: true }));
  else res.json({ success: true });
});

// ------------- email routes -------------
app.get('/api/email/health', (req, res) => {
  const required = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'];
  const missing = required.filter(k => !process.env[k]);
  res.json({ ok: missing.length === 0, missing });
});

app.post('/api/test-email', async (req, res) => {
  try {
    const to = process.env.ALERT_TO || process.env.SMTP_USER;
    const info = await sendEmail({
      to,
      subject: '✅ PlantGarden Test',
      html: `<h3>PlantGarden test</h3><p>Sent at ${new Date().toLocaleString()}</p>`
    });
    res.json({ success: true, messageId: info.messageId, response: info.response });
  } catch (e) {
    res.status(500).json({ success: false, error: String(e && e.message || e) });
  }
});

app.post('/api/test-email/custom', async (req, res) => {
  try {
    const { to, subject, html, text } = req.body || {};
    if (!to || !subject || !(html || text)) return res.status(400).json({ success: false, error: 'Missing fields' });
    const info = await sendEmail({ to, subject, html, text });
    res.json({ success: true, messageId: info.messageId, response: info.response });
  } catch (e) {
    res.status(500).json({ success: false, error: String(e && e.message || e) });
  }
});

// ------------- SPA fallback -------------
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api/') && !req.path.startsWith('/auth/')) {
    return res.sendFile(path.join(ROOT, 'index.html'));
  }
  next();
});

app.listen(PORT, () => console.log(`✅ Server at http://localhost:${PORT}`));