// auth.js — Authentication & Session Management (Secured for Netlify)
(function(){
  const SESSION_KEY = 'iei_admin_session';
  const SESSION_DURATION = 3600000; // 1 hour session

  function createSession(username){
    const session = {username, loginTime: Date.now(), expiresAt: Date.now() + SESSION_DURATION};
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  }

  function getSession(){
    try{
      const s = JSON.parse(sessionStorage.getItem(SESSION_KEY));
      if(!s) return null;
      if(Date.now() > s.expiresAt){ clearSession(); return null; }
      return s;
    }catch{ return null; }
  }

  function clearSession(){ sessionStorage.removeItem(SESSION_KEY); }

  function refreshSession(){
    const s = getSession();
    if(s){
      s.expiresAt = Date.now() + SESSION_DURATION;
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
    }
  }

  // SECURED: Now an async function that asks Netlify if the password is correct
  async function login(username, password){
    try {
      const response = await fetch('/.netlify/functions/login', {
        method: 'POST',
        body: JSON.stringify({ username: username, password: password })
      });

      if (response.ok) {
        createSession(username);
        return true;
      }
      return false; // Password was wrong
    } catch (error) {
      console.error("Server connection failed:", error);
      return false; // Server error
    }
  }

  function logout(){ clearSession(); window.location.href = 'login.html'; }

  function requireAuth(){
    if(!getSession()){ window.location.href = 'login.html'; return false; }
    return true;
  }

  // Activity-based session refresh
  ['click','keydown','mousemove','scroll'].forEach(evt => {
    document.addEventListener(evt, refreshSession, {passive:true});
  });

  // Auto-logout check on tab focus
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible' && window.location.pathname.includes('admin.html')) {
      if (!getSession()) logout();
    }
  });

  window.IEI_Auth = {login, logout, getSession, requireAuth, clearSession};
})();
