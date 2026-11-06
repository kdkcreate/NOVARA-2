document.documentElement.classList.add('js');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('.reveal').forEach((item) => {
  if (reduceMotion) {
    item.classList.add('on');
    return;
  }
  new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('on');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 }).observe(item);
});

(() => {
  const canvas = document.getElementById('fluid-bg');
  if (!canvas || reduceMotion) return;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;

  const blobs = [
    {x:.15,y:.24,vx:.00020,vy:.00013,r:.29,h:155,p:.2},
    {x:.82,y:.18,vx:-.00016,vy:.00018,r:.25,h:185,p:2.1},
    {x:.77,y:.78,vx:-.00018,vy:-.00012,r:.31,h:265,p:4.2},
    {x:.23,y:.82,vx:.00014,vy:-.00016,r:.25,h:320,p:5.4}
  ];
  let w=0,h=0,dpr=1,last=performance.now();

  function resize(){
    dpr=Math.min(devicePixelRatio||1,1.75);
    w=innerWidth; h=innerHeight;
    canvas.width=Math.floor(w*dpr);
    canvas.height=Math.floor(h*dpr);
    canvas.style.width=w+'px';
    canvas.style.height=h+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }

  function frame(now){
    const dt=Math.min(now-last,40); last=now;
    ctx.fillStyle='#050607';
    ctx.fillRect(0,0,w,h);
    ctx.globalCompositeOperation='screen';

    blobs.forEach((b,i)=>{
      const t=now*.00025+b.p;
      b.x+=b.vx*dt; b.y+=b.vy*dt;
      if(b.x<-.18||b.x>1.18)b.vx*=-1;
      if(b.y<-.18||b.y>1.18)b.vy*=-1;

      const x=(b.x+Math.sin(t*1.7)*.045)*w;
      const y=(b.y+Math.cos(t*1.35)*.055)*h;
      const r=Math.max(180,b.r*Math.min(w,h));
      const g=ctx.createRadialGradient(x,y,0,x,y,r);
      g.addColorStop(0,`hsla(${b.h},88%,62%,.22)`);
      g.addColorStop(.38,`hsla(${b.h},82%,52%,.11)`);
      g.addColorStop(1,`hsla(${b.h},80%,45%,0)`);
      ctx.fillStyle=g;
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
    });

    const q=(Math.sin(now*.00017)+1)/2;
    const sx=w*(-.25+q*1.5), sy=h*(.18+Math.cos(now*.00011)*.18);
    const flow=ctx.createRadialGradient(sx,sy,0,sx,sy,Math.max(w,h)*.45);
    flow.addColorStop(0,'rgba(110,255,220,.055)');
    flow.addColorStop(1,'rgba(110,255,220,0)');
    ctx.fillStyle=flow; ctx.fillRect(0,0,w,h);

    ctx.globalCompositeOperation='source-over';
    requestAnimationFrame(frame);
  }
  resize();
  addEventListener('resize',resize,{passive:true});
  requestAnimationFrame(frame);
})();


/* Homepage intro: show once per browser session, then cleanly reveal the site. */
(() => {
  const intro = document.getElementById('novara-intro');
  if (!intro) return;

  const shown = sessionStorage.getItem('novara-intro-seen');
  if (shown) {
    intro.remove();
    return;
  }

  sessionStorage.setItem('novara-intro-seen', '1');

  const leave = () => {
    intro.classList.add('is-leaving');
    setTimeout(() => intro.remove(), 800);
  };

  if (reduceMotion) {
    setTimeout(leave, 300);
  } else {
    setTimeout(leave, 1850);
  }
})();

/* Mobile navigation */
(() => {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('primary-navigation');
  if (!toggle || !menu) return;
  const closeMenu = () => {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
    menu.classList.remove('is-open');
  };
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    menu.classList.toggle('is-open', open);
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 900) closeMenu(); });
})();

/* NOVARA E-waste visual classification game */
(() => {
  const root = document.getElementById('ewaste-quiz');
  if (!root) return;
  const $ = id => document.getElementById(id);
  const rounds = [
    {name:'Retired smartphone',image:'quiz-assets/smartphone.svg',alt:'Illustration of an old smartphone',category:'Mobile devices',options:['Mobile devices','Lighting equipment','Large appliances','Batteries'],why:'A smartphone is a mobile electronic device. It should go to an authorised e-waste collection or take-back point.'},
    {name:'Out-of-use laptop',image:'quiz-assets/laptop.svg',alt:'Illustration of an old laptop computer',category:'Computing equipment',options:['Cables and accessories','Computing equipment','Lighting equipment','Large appliances'],why:'Laptops are information-technology and computing equipment. Protect your data before handing one over.'},
    {name:'Damaged rechargeable battery',image:'quiz-assets/battery.svg',alt:'Illustration of a rechargeable battery',category:'Batteries',options:['Lighting equipment','Mobile devices','Batteries','Cables and accessories'],why:'Rechargeable batteries need a dedicated battery collection route. Do not put them in household rubbish.'},
    {name:'Used fluorescent lamp',image:'quiz-assets/bulb.svg',alt:'Illustration of a fluorescent lamp',category:'Lighting equipment',options:['Computing equipment','Lighting equipment','Batteries','Large appliances'],why:'Fluorescent lamps are lighting waste and may contain mercury. Keep them intact and use an appropriate collection service.'},
    {name:'Loose charging cable',image:'quiz-assets/cable.svg',alt:'Illustration of a coiled charging cable',category:'Cables and accessories',options:['Batteries','Large appliances','Cables and accessories','Lighting equipment'],why:'Charging and data cables are electronic accessories. Collect them for an authorised e-waste recycler.'},
    {name:'Printed circuit board',image:'quiz-assets/circuit.svg',alt:'Illustration of a green printed circuit board',category:'Electronic components',options:['Lighting equipment','Electronic components','Mobile devices','Batteries'],why:'Circuit boards are electronic components containing recoverable materials. They belong in specialist e-waste processing.'}
  ];
  let index = 0;
  let score = 0;
  let answers = [];
  const start = $('quiz-start');
  const play = $('quiz-play');
  const results = $('quiz-results');
  const options = $('quiz-options');
  const next = $('quiz-next');
  const feedback = $('quiz-feedback');

  function showRound() {
    const item = rounds[index];
    $('quiz-counter').textContent = `${String(index + 1).padStart(2, '0')} / ${String(rounds.length).padStart(2, '0')}`;
    $('quiz-progress-fill').style.width = `${(index / rounds.length) * 100}%`;
    $('quiz-progress').setAttribute('aria-valuenow', String(index));
    $('quiz-image').src = item.image;
    $('quiz-image').alt = item.alt;
    $('quiz-image-caption').textContent = `ITEM ${String(index + 1).padStart(2, '0')} / FIELD SPECIMEN`;
    $('quiz-question').textContent = `Classify this: ${item.name}`;
    $('quiz-description').textContent = 'Select the category that best describes this item.';
    feedback.textContent = '';
    feedback.className = 'quiz-feedback';
    next.disabled = true;
    next.innerHTML = index === rounds.length - 1 ? 'View field report <span aria-hidden="true">→</span>' : 'Next specimen <span aria-hidden="true">→</span>';
    options.replaceChildren();
    item.options.forEach((label, optionIndex) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'quiz-option';
      button.textContent = label;
      button.addEventListener('click', () => choose(label, button));
      options.append(button);
    });
  }

  function choose(answer, selectedButton) {
    if (next.disabled === false) return;
    const item = rounds[index];
    const correct = answer === item.category;
    if (correct) score++;
    answers.push({name:item.name,answer,correct,category:item.category});
    options.querySelectorAll('button').forEach(button => {
      button.disabled = true;
      if (button.textContent === item.category) button.classList.add('is-correct');
    });
    if (!correct) selectedButton.classList.add('is-wrong');
    feedback.textContent = `${correct ? '✓ Good classification. ' : 'Not quite. '}${item.why}`;
    feedback.classList.add(correct ? 'is-correct' : 'is-wrong');
    next.disabled = false;
    $('quiz-progress').setAttribute('aria-valuenow', String(index + 1));
    $('quiz-progress-fill').style.width = `${((index + 1) / rounds.length) * 100}%`;
  }

  function begin() {
    index = 0; score = 0; answers = [];
    start.hidden = true; results.hidden = true; play.hidden = false;
    showRound();
  }

  function finish() {
    play.hidden = true; results.hidden = false;
    $('quiz-score').textContent = `${score}/${rounds.length}`;
    $('quiz-result-title').textContent = score === rounds.length ? 'EXPERT SORTER' : score >= 4 ? 'SOLID FIELD WORK' : 'TRAINING COMPLETE';
    $('quiz-result-message').textContent = score === rounds.length ? 'Perfect run. You identified every specimen. Keep that responsible-recycling instinct switched on.' : score >= 4 ? 'Good work. A few categories need another look, but your e-waste radar is switched on.' : 'Every round is a chance to learn. Review the classifications below and give it another try.';
    const review = $('quiz-review');
    review.replaceChildren();
    answers.forEach(item => {
      const row = document.createElement('div');
      row.className = `review-item${item.correct ? '' : ' missed'}`;
      const name = document.createElement('span'); name.textContent = item.name;
      const status = document.createElement('strong'); status.textContent = item.correct ? 'CORRECT' : `ANSWER: ${item.category.toUpperCase()}`;
      row.append(name, status); review.append(row);
    });
  }

  $('quiz-begin').addEventListener('click', begin);
  $('quiz-restart').addEventListener('click', begin);
  next.addEventListener('click', () => { if (next.disabled) return; index++; if (index < rounds.length) showRound(); else finish(); });
})();
