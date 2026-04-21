// main.js — Core utilities and shared functionality
window.IEI = window.IEI || {};

IEI.showToast = function(message, type='info', duration=3500){
  let toast=document.querySelector('.toast');
  if(!toast){toast=document.createElement('div');toast.className='toast';document.body.appendChild(toast);}
  const icons={success:'✅',error:'❌',info:'ℹ️'};
  toast.className=`toast toast-${type}`;
  toast.innerHTML=`<span>${icons[type]||'ℹ️'}</span><span>${message}</span>`;
  requestAnimationFrame(()=>{toast.classList.add('show');});
  clearTimeout(toast._timer);
  toast._timer=setTimeout(()=>{toast.classList.remove('show');},duration);
};

IEI.formatDate = function(dateStr){
  const d=new Date(dateStr);
  return d.toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'});
};

IEI.truncate = function(str,n){return str.length>n?str.slice(0,n)+'…':str;};

// Data store (localStorage)
IEI.store = {
  get(key){try{return JSON.parse(localStorage.getItem('iei_'+key))||null;}catch{return null;}},
  set(key,val){localStorage.setItem('iei_'+key,JSON.stringify(val));},
  remove(key){localStorage.removeItem('iei_'+key);}
};

// Seed default data if not present
IEI.seedData = function(){
  if(!IEI.store.get('news')){
    IEI.store.set('news',[
      {id:1,title:'IEI Awards 50 Merit Scholarships for 2025',category:'Scholarship',date:'2025-03-15',image:'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80',excerpt:'Institute of Education & Innovation proudly announces 50 merit-based scholarships for underprivileged students pursuing STEM education.',status:'published'},
      {id:2,title:'Annual Innovation Summit — Register Now',category:'Event',date:'2025-04-10',image:'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',excerpt:'Join us for our flagship Annual Innovation Summit featuring keynotes, workshops, and student project showcases.',status:'published'},
      {id:3,title:'New Digital Literacy Program Launched',category:'Programs',date:'2025-02-28',image:'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=600&q=80',excerpt:'IEI launches comprehensive digital literacy program covering coding, AI literacy, and digital citizenship for rural students.',status:'published'},
      {id:4,title:'Partnership with State Government for Rural Education',category:'Partnership',date:'2025-01-20',image:'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&q=80',excerpt:'IEI signs MoU with West Bengal State Government to expand educational support to 200 additional villages.',status:'published'},
      {id:5,title:'Student Success Story: Priya Achieves Medical Seat',category:'Success',date:'2024-12-10',image:'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&q=80',excerpt:'IEI scholarship recipient Priya Sharma secures a seat in MBBS at a prestigious medical college after years of financial hardship.',status:'published'},
      {id:6,title:'Upcoming Workshop: Career Guidance for Class 12',category:'Event',date:'2025-05-05',image:'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80',excerpt:'Free career guidance workshop for Class 12 students covering college admissions, scholarships, and career paths.',status:'draft'}
    ]);
  }
  if(!IEI.store.get('gallery')){
    IEI.store.set('gallery',[
      {id:1,title:'Scholarship Award Ceremony 2024',category:'Events',image:'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&q=80',date:'2024-12-20'},
      {id:2,title:'Annual Innovation Fair',category:'Events',image:'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',date:'2024-11-15'},
      {id:3,title:'Students at Learning Center',category:'Campus',image:'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80',date:'2024-10-08'},
      {id:4,title:'Rural Outreach Program',category:'Outreach',image:'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80',date:'2024-09-22'},
      {id:5,title:'Graduation Day Celebrations',category:'Events',image:'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80',date:'2024-07-30'},
      {id:6,title:'Science Workshop for Girls',category:'Programs',image:'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&q=80',date:'2024-06-14'},
      {id:7,title:'Community Awareness Drive',category:'Outreach',image:'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&q=80',date:'2024-05-03'},
      {id:8,title:'Library Inauguration',category:'Campus',image:'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80',date:'2024-03-18'},
      {id:9,title:'Mentor Meet — Professionals with Students',category:'Mentorship',image:'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80',date:'2024-02-10'}
    ]);
  }
  if(!IEI.store.get('events')){
    IEI.store.set('events',[
      {id:1,title:'Annual Innovation Summit 2025',date:'2025-07-15',time:'10:00 AM',location:'IEI Campus, Malda',description:'Our flagship annual event showcasing student innovations and achievements.',status:'upcoming'},
      {id:2,title:'Scholarship Application Drive',date:'2025-05-01',time:'9:00 AM',location:'All District Centers',description:'Open application drive for the 2025-26 scholarship program.',status:'upcoming'},
      {id:3,title:'Career Guidance Workshop',date:'2025-05-20',time:'11:00 AM',location:'IEI Auditorium',description:'Professional career guidance for Class 12 students.',status:'upcoming'}
    ]);
  }
};

document.addEventListener('DOMContentLoaded',function(){IEI.seedData();});

// ── GOOGLE DRIVE IMAGE URL RESOLVER ──────────────────────────────
// Auto-converts Drive share links to embeddable thumbnail URLs
IEI.resolveImageUrl = function(url) {
  if (!url) return '';
  var driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) return 'https://drive.google.com/thumbnail?id=' + driveMatch[1] + '&sz=w800';
  var openMatch = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  if (openMatch) return 'https://drive.google.com/thumbnail?id=' + openMatch[1] + '&sz=w800';
  var docsMatch = url.match(/docs\.google\.com\/uc\?.*id=([a-zA-Z0-9_-]+)/);
  if (docsMatch) return 'https://drive.google.com/thumbnail?id=' + docsMatch[1] + '&sz=w800';
  return url;
};
