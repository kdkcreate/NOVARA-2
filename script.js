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
