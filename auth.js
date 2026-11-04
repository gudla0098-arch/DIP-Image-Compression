'use strict';

async function submitAuthForm(form, action, payload) {
  const button = form.querySelector('button[type="submit"]');
  const message = document.getElementById('auth-message');
  const original = button.textContent;

  button.disabled = true;
  button.textContent = 'PLEASE WAIT…';
  message.textContent = '';
  message.className = 'auth-message';

  try {
    const data = action === 'signup'
      ? await window.DIPDatabase.signup(payload)
      : await window.DIPDatabase.login(payload);

    message.textContent = action === 'signup'
      ? 'Account created successfully. Opening your workspace…'
      : 'Login successful. Welcome back!';
    message.classList.add('success');

    const requestedNext = new URLSearchParams(location.search).get('next');
    const safeNext = requestedNext && requestedNext.startsWith('/')
      && !requestedNext.startsWith('//')
      && requestedNext !== '/'
      ? requestedNext
      : '/home';
    setTimeout(() => location.assign(safeNext), 650);
    return data;
  } catch (error) {
    message.textContent = error.message;
    return null;
  } finally {
    button.disabled = false;
    button.textContent = original;
  }
}

const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', event => {
    event.preventDefault();
    submitAuthForm(loginForm, 'login', {
      email: loginForm.elements.email.value.trim(),
      password: loginForm.elements.password.value
    });
  });
}

const signupForm = document.getElementById('signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', event => {
    event.preventDefault();
    const message = document.getElementById('auth-message');
    if (signupForm.elements.password.value !== signupForm.elements['confirm-password'].value) {
      message.textContent = 'Passwords do not match.';
      message.className = 'auth-message';
      return;
    }
    submitAuthForm(signupForm, 'signup', {
      name: signupForm.elements.name.value.trim(),
      email: signupForm.elements.email.value.trim(),
      password: signupForm.elements.password.value
    });
  });
}

const forgotLink = document.getElementById('forgot-link');
if (forgotLink) {
  forgotLink.addEventListener('click', event => {
    event.preventDefault();
    document.getElementById('auth-message').textContent =
      'Password reset email is not configured yet. Please contact the website administrator.';
  });
}
