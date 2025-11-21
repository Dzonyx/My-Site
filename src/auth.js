// src/auth.js
// Simple auth UI logic
const authModal = document.getElementById('auth-modal');
const authTitle = document.getElementById('auth-title');
const authForm = document.getElementById('auth-form');
const authEmail = document.getElementById('auth-email');
const authPassword = document.getElementById('auth-password');
const authClose = document.getElementById('auth-close');
const switchToSignup = document.getElementById('switch-to-signup');

function openAuth(mode='login') {
  authTitle.textContent = (mode === 'login') ? 'Log in' : 'Sign up';
  authForm.dataset.mode = mode;
  authModal.classList.remove('hidden');
  authEmail.focus();
}

function closeAuth() {
  authModal.classList.add('hidden');
  authForm.reset();
}

authClose.addEventListener('click', closeAuth);
document.getElementById('btn-login').addEventListener('click', ()=> openAuth('login'));
document.getElementById('btn-signup').addEventListener('click', ()=> openAuth('signup'));
document.getElementById('cta-start').addEventListener('click', ()=> openAuth('signup'));

switchToSignup.addEventListener('click', ()=> {
  const mode = authForm.dataset.mode === 'signup' ? 'login' : 'signup';
  openAuth(mode);
});

authForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const mode = authForm.dataset.mode || 'login';
  const email = authEmail.value.trim().toLowerCase();
  const password = authPassword.value;
  if(!email || !password) return alert('Please enter email and password.');

  const state = loadState();
  if(mode === 'login') {
    const user = state.users.find(u => u.email === email && u.password === password);
    if(!user) return alert('Invalid credentials.');
    currentUser = user;
    closeAuth();
    afterLogin();
  } else {
    if(state.users.find(u => u.email === email)) return alert('Email already registered. Please log in.');
    const newUser = { email, password, name: email.split('@')[0], role: 'user', id: genId('u') };
    state.users.push(newUser);
    saveState(state);
    currentUser = newUser;
    closeAuth();
    afterLogin();
  }
});
