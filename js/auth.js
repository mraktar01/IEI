// auth.js — Authentication & Session Management
(function(){
  const SESSION_KEY='iei_admin_session';
  const SESSION_DURATION=(window.__ENV__&&window.__ENV__.SESSION_DURATION)||3600000;

  function getCredentials(){
    if(window.__ENV__)return{username:window.__ENV__.ADMIN_USERNAME,password:window.__ENV__.ADMIN_PASSWORD};
    return{username:'iei_admin',password:'IEI@Secure2025'};
  }

  function createSession(username){
    const session={username,loginTime:Date.now(),expiresAt:Date.now()+SESSION_DURATION};
    sessionStorage.setItem(SESSION_KEY,JSON.stringify(session));
    return session;
  }

  function getSession(){
    try{
      const s=JSON.parse(sessionStorage.getItem(SESSION_KEY));
      if(!s)return null;
      if(Date.now()>s.expiresAt){clearSession();return null;}
      return s;
    }catch{return null;}
  }

  function clearSession(){sessionStorage.removeItem(SESSION_KEY);}

  function refreshSession(){
    const s=getSession();
    if(s){s.expiresAt=Date.now()+SESSION_DURATION;sessionStorage.setItem(SESSION_KEY,JSON.stringify(s));}
  }

  function login(username,password){
    const creds=getCredentials();
    if(username===creds.username&&password===creds.password){
      createSession(username);
      return true;
    }
    return false;
  }

  function logout(){clearSession();window.location.href='login.html';}

  function requireAuth(){
    if(!getSession()){window.location.href='login.html';return false;}
    return true;
  }

  // Activity-based session refresh
  ['click','keydown','mousemove','scroll'].forEach(evt=>{
    document.addEventListener(evt,refreshSession,{passive:true});
  });

  // Auto-logout check every minute
  // Check session only on tab focus — avoids browser "loading" spinner from setInterval
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible' && window.location.pathname.includes('admin.html')) {
      if (!getSession()) logout();
    }
  });

  window.IEI_Auth={login,logout,getSession,requireAuth,clearSession};
})();
