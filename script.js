document.documentElement.classList.add('js');
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Shared accessible slide-out navigation for every independent page.
(() => {
  const header=document.querySelector('header');
  const nav=header?.querySelector('nav');
  if(!nav)return;
  const links=[['index.html','Home'],['calculator.html','Calculator'],['facts.html','Facts'],['health.html','Health'],['india-kerala.html','India & Kerala'],['team.html','Team'],['game.html','E-Waste Impact Challenge']];
  const current=location.pathname.split('/').pop()||'index.html';
  const toggle=document.createElement('button');
  toggle.className='menu-toggle';toggle.type='button';toggle.setAttribute('aria-label','Open navigation');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-controls','site-navigation');toggle.innerHTML='<span></span><span></span><span></span>';
  const panel=document.createElement('aside');panel.className='nav-panel';panel.id='site-navigation';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','nav-title');panel.setAttribute('aria-hidden','true');
  panel.innerHTML='<p class="nav-caption">NOVARA · Explore</p><h2 id="nav-title">Navigate to...?</h2><ul>'+links.map(([href,label])=>`<li><a href="${href}"${current===href?' aria-current="page"':''}>${label}</a></li>`).join('')+'</ul>';
  const backdrop=document.createElement('div');backdrop.className='nav-backdrop';backdrop.setAttribute('aria-hidden','true');
  nav.append(toggle);document.body.append(backdrop,panel);
  let previousFocus=null;
  function setOpen(open){
    toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');
    panel.setAttribute('aria-hidden',String(!open));document.body.classList.toggle('nav-open',open);
    if(open){previousFocus=document.activeElement;panel.querySelector('a')?.focus();}
    else{toggle.focus();}
  }
  toggle.addEventListener('click',()=>setOpen(toggle.getAttribute('aria-expanded')!=='true'));
  backdrop.addEventListener('click',()=>setOpen(false));
  panel.addEventListener('click',event=>{if(event.target.closest('a'))setOpen(false)});
  document.addEventListener('keydown',event=>{
    if(toggle.getAttribute('aria-expanded')!=='true')return;
    if(event.key==='Escape'){event.preventDefault();setOpen(false);return;}
    if(event.key==='Tab'){
      const focusable=[...panel.querySelectorAll('a[href]')];const first=focusable[0],last=focusable.at(-1);
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
  });
})();

// Subtle reveal as content enters view.
document.querySelectorAll('.reveal').forEach(item=>{
  if(reduceMotion||!('IntersectionObserver'in window)){item.classList.add('on');return;}
  new IntersectionObserver((entries,observer)=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('on');observer.unobserve(entry.target)}}),{threshold:.12}).observe(item);
});

// Keep the familiar homepage welcome moment brief and dismissible by reduced-motion settings.
(()=>{const intro=document.getElementById('novara-intro');if(!intro)return;try{if(sessionStorage.getItem('novara-intro-seen')){intro.remove();return;}sessionStorage.setItem('novara-intro-seen','1');}catch{}const leave=()=>{intro.classList.add('is-leaving');setTimeout(()=>intro.remove(),650)};setTimeout(leave,reduceMotion?100:1500)})();
