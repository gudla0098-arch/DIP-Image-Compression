'use strict';
async function submitAuthForm(form, endpoint, payload) {
  const button=form.querySelector('button[type="submit"]'), message=document.getElementById('auth-message');
  button.disabled=true;const original=button.textContent;button.textContent='PLEASE WAIT…';message.textContent='';message.className='auth-message';
  try {
    const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify(payload)});
    const data=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(data.detail||'Something went wrong. Please try again.');
    message.textContent=endpoint.endsWith('/signup')?'Account created successfully. Opening your workspace…':'Login successful. Welcome back!';
    message.classList.add('success');
    const next=new URLSearchParams(location.search).get('next');
    const safeNext=next&&next.startsWith('/')&&!next.startsWith('//')?next:'/';
    setTimeout(()=>location.assign(safeNext),650);
  } catch(error){message.textContent=error.message;}
  finally{button.disabled=false;button.textContent=original;}
}
const loginForm=document.getElementById('login-form');
if(loginForm)loginForm.addEventListener('submit',event=>{event.preventDefault();submitAuthForm(loginForm,'/api/auth/login',{email:loginForm.email.value.trim(),password:loginForm.password.value});});
const signupForm=document.getElementById('signup-form');
if(signupForm)signupForm.addEventListener('submit',event=>{
  event.preventDefault();
  if(signupForm.password.value!==signupForm['confirm-password'].value){document.getElementById('auth-message').textContent='Passwords do not match.';return;}
  submitAuthForm(signupForm,'/api/auth/signup',{name:signupForm.name.value.trim(),email:signupForm.email.value.trim(),password:signupForm.password.value});
});
const forgotLink=document.getElementById('forgot-link');
if(forgotLink)forgotLink.addEventListener('click',event=>{event.preventDefault();document.getElementById('auth-message').textContent='Password reset email is not configured yet. Please contact the website administrator.';});
