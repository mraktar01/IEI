(function(){
  function initScrollReveal(){
    const els=document.querySelectorAll('.reveal,.reveal-left,.reveal-right,.reveal-scale');
    if(!els.length)return;
    const obs=new IntersectionObserver((entries)=>{
      entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('revealed');obs.unobserve(e.target);}});
    },{threshold:0.12,rootMargin:'0px 0px -40px 0px'});
    els.forEach(el=>obs.observe(el));
  }
  function initNavScroll(){
    const nav=document.querySelector('.navbar');
    if(!nav)return;
    function check(){nav.classList.toggle('scrolled',window.scrollY>60);}
    window.addEventListener('scroll',check,{passive:true});
    check();
  }
  function initHamburger(){
    const btn=document.querySelector('.hamburger');
    const mobileNav=document.querySelector('.mobile-nav');
    if(!btn||!mobileNav)return;
    btn.addEventListener('click',function(){
      const open=mobileNav.classList.toggle('open');
      btn.classList.toggle('active',open);
      document.body.style.overflow=open?'hidden':'';
    });
    mobileNav.querySelectorAll('.mobile-nav-link').forEach(link=>{
      link.addEventListener('click',()=>{mobileNav.classList.remove('open');btn.classList.remove('active');document.body.style.overflow='';});
    });
  }
  function initCounters(){
    const counters=document.querySelectorAll('[data-count]');
    if(!counters.length)return;
    const obs=new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          const el=e.target;
          const target=parseInt(el.dataset.count);
          const duration=2000;
          const step=target/duration*16;
          let current=0;
          const timer=setInterval(()=>{
            current+=step;
            if(current>=target){current=target;clearInterval(timer);}
            el.textContent=Math.floor(current).toLocaleString();
          },16);
          obs.unobserve(el);
        }
      });
    },{threshold:0.5});
    counters.forEach(c=>obs.observe(c));
  }
  function initActiveNav(){
    const path=window.location.pathname.split('/').pop()||'index.html';
    document.querySelectorAll('.nav-link,.mobile-nav-link').forEach(link=>{
      const href=link.getAttribute('href')||'';
      if(href===path||(path===''&&href==='index.html')||(path==='index.html'&&href==='index.html')){
        link.classList.add('active');
      }
    });
  }
  document.addEventListener('DOMContentLoaded',function(){
    initScrollReveal();
    initNavScroll();
    initHamburger();
    initCounters();
    initActiveNav();
  });
})();
