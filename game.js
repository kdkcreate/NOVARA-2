(() => {
'use strict';
const canvas=document.querySelector('#world'),ctx=canvas.getContext('2d');
const $=s=>document.querySelector(s),tr=s=>window.novaraTranslate?.(s)||s;
const types=['Phone','Laptop','Tablet','Charger','Headphones'],symbols=['▯','▱','▣','⌁','Ω'];
const held=new Set();let scene=0,delivered=0,bag=[],houses=[],platforms=[],tokens=[],player,complete=false,paused=false,last=0,clock=0,camera=0,score=0,checkpoint=40,particles=[],jumpBuffer=0,coyote=0,tip='';
const W=2500,G=420;
const hud=document.createElement('div');hud.className='mission-status';$('.game-hud').after(hud);
const pause=document.createElement('button');pause.className='button alt';pause.textContent='Pause';$('.game-hud').append(pause);
const bar=document.createElement('progress');bar.max=12;bar.value=0;bar.setAttribute('aria-label','Mission progress');$('.game-hud').after(bar);
function tell(s){$('#dialogue').textContent=s}
function load(){
 held.clear();bag=[];complete=false;paused=false;pause.textContent='Pause';$('#next-scene').hidden=true;
 player={x:40,y:380,w:26,h:40,vx:0,vy:0,facing:1};camera=0;checkpoint=40;particles=[];jumpBuffer=0;coyote=0;
 houses=[{x:370,y:320,name:'Mira'},{x:1100,y:270,name:'Arun'},{x:1850,y:300,name:'Leela'},{x:2180,y:350,name:'Mira'}].map((h,i)=>({...h,y:h.y-(scene*10*(i%2)),items:Array.from({length:3},()=>Math.floor(Math.random()*types.length)),taken:0}));
 platforms=[{x:0,y:G,w:W},{x:180,y:365,w:105},{x:310,y:320,w:165},{x:680,y:360,w:110},{x:850,y:310,w:115},{x:1035,y:houses[1].y,w:165},{x:1350,y:350,w:120},{x:1530,y:310,w:110},{x:1780,y:300,w:165},{x:2100,y:houses[3].y,w:170}];
 tokens=[{x:730,y:325},{x:900,y:275},{x:1400,y:315},{x:1580,y:275}].map(t=>({...t,got:false}));
 tell('Visit the doors above the street. Carry six items at a time and deliver at either collection centre.');update();
}
function update(){
 $('#stage').textContent='Neighbourhood '+(scene+1)+' / 3';$('#delivery').textContent='Delivered: '+delivered+' · Bag: '+bag.length+' / 6';
 hud.replaceChildren();for(const [label,value] of [['Score',score],['Houses',houses.filter(h=>h.taken===3).length+' / 4']]){const s=document.createElement('span');s.innerHTML='<b>'+label+'</b> '+value;hud.append(s)}
 bar.value=houses.reduce((a,h)=>a+h.taken,0)-bag.length;
 const hot=$('#hotbar');hot.replaceChildren();types.forEach((t,i)=>{const s=document.createElement('div');s.className='slot'+(bag.includes(i)?' filled':'');s.innerHTML='<b>'+symbols[i]+' × '+bag.filter(v=>v===i).length+'</b>'+t;hot.append(s)});
}
function nearHouse(){return houses.find(h=>Math.abs(player.x+13-h.x)<55&&Math.abs(player.y+40-h.y)<18)}
function nearCentre(){return player.y+40>390&&[80,2390].some(x=>Math.abs(player.x-x)<90)}
function burst(x,y,color){if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;for(let i=0;i<12;i++)particles.push({x,y,vx:(Math.random()-.5)*150,vy:-Math.random()*140,life:.6,color})}
function interact(){
 if(paused||complete||blocked())return;
 if(nearCentre()){
  if(!bag.length){tell('Collection centre: visit the houses first, then bring your items here.');return}
  delivered+=bag.length;score+=bag.length*100;bag=[];checkpoint=player.x;burst(player.x,player.y,'#ffdc7d');tell('Delivery received. Your inventory is empty—visit the remaining houses.');
  if(houses.every(h=>h.taken===3)){complete=true;$('#next-scene').hidden=false;$('#next-scene').textContent=scene===2?'Play a new mission':'Next neighbourhood →';tell(scene===2?'Mission complete! All three neighbourhoods served.':'Neighbourhood complete! All households visited and all items delivered.');try{const best=Math.max(score,Number(localStorage.getItem('novara-game-best'))||0);localStorage.setItem('novara-game-best',best)}catch{}}
  update();return;
 }
 const h=nearHouse();if(!h){tell('Get close to a terrace door to ring, or stand beside the collection centre to deliver.');return}
 if(h.taken===3){tell(h.name+': Thanks for collecting our old electronics!');return}
 if(bag.length===6){tell('Your bag is full. Deliver it at the centre first.');return}
 const items=h.items.slice(h.taken,h.taken+6-bag.length);bag.push(...items);h.taken+=items.length;checkpoint=Math.max(0,h.x-15);score+=25;burst(player.x,player.y,'#84e4b5');
 tell('Collection added to your hotbar. Deliver these devices through the appropriate recycling channel.');update();
}
function blocked(){return document.hidden||document.querySelector('.drawer.open')||document.activeElement?.closest('input,textarea,select,[contenteditable="true"]')}
function jump(){if(!paused&&!complete&&!blocked())jumpBuffer=.14}
function tick(dt){
 clock+=dt;coyote=Math.max(0,coyote-dt);jumpBuffer=Math.max(0,jumpBuffer-dt);
 const direction=(held.has('right')?1:0)-(held.has('left')?1:0);
 player.vx+=(direction*275-player.vx)*Math.min(1,dt*15);if(direction)player.facing=direction;
 if(jumpBuffer>0&&coyote>0){player.vy=-530;coyote=0;jumpBuffer=0}
 player.x=Math.max(0,Math.min(W-26,player.x+player.vx*dt));
 const bottom=player.y+40;player.vy+=1250*dt;player.y+=player.vy*dt;
 // Only land on a platform crossed from above.
 const landing=platforms.filter(p=>player.vy>=0&&bottom<=p.y+1&&player.y+40>=p.y&&player.x+26>p.x&&player.x<p.x+p.w).sort((a,b)=>a.y-b.y)[0];
 if(landing){player.y=landing.y-40;player.vy=0;coyote=.1}
 if(player.y>550){player.x=checkpoint;player.y=200;player.vy=0}
 for(const t of tokens)if(!t.got&&Math.hypot(player.x+13-t.x,player.y+20-t.y)<30){t.got=true;score+=50;burst(t.x,t.y,'#efd67b');tell('Reuse token collected! Repair and reuse can extend a device’s useful life.');update()}
 camera=Math.max(0,Math.min(W-960,player.x-380));
 particles=particles.filter(p=>(p.life-=dt)>0);particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=300*dt});
}
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}
function circle(x,y,r,c){ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}
function text(s,x,y,size=14,c='#fff'){ctx.fillStyle=c;ctx.font='600 '+size+'px sans-serif';ctx.fillText(tr(s),x,y)}
function draw(){
 const palette=[['#b9e3de','#eaf1cc'],['#efd2ac','#f7ebcf'],['#34495d','#b0c8b5']][scene];
 const sky=ctx.createLinearGradient(0,0,0,480);sky.addColorStop(0,palette[0]);sky.addColorStop(1,palette[1]);ctx.fillStyle=sky;ctx.fillRect(0,0,960,480);
 circle(810-camera*.07,70,31,'#ffedac');
 for(let i=0;i<16;i++){const x=i*180-camera*.3;rect(x,205-(i%3)*25,100,220,'#8eafa0');for(let j=0;j<3;j++)rect(x+15+j*25,230-(i%3)*25,12,18,'#c5d4b3')}
 ctx.save();ctx.translate(-camera,0);
 for(let i=0;i<11;i++){let x=250+i*230;rect(x,310,9,110,'#806c51');circle(x+5,291,32,'#629b76');circle(x-15,307,24,'#75ae81')}
 for(const p of platforms){rect(p.x,p.y,p.w,p.y===G?60:16,'#b49a73');rect(p.x,p.y,p.w,6,'#488d68');if(p.y!==G){rect(p.x+10,p.y+16,8,G-p.y,'#8c8267');rect(p.x+p.w-18,p.y+16,8,G-p.y,'#8c8267')}}
 houses.forEach((h,i)=>{rect(h.x-46,h.y-100,110,100,['#d89777','#72a6ab','#c7b071','#9d91ad'][i]);ctx.fillStyle='#355c50';ctx.beginPath();ctx.moveTo(h.x-60,h.y-100);ctx.lineTo(h.x+9,h.y-145);ctx.lineTo(h.x+80,h.y-100);ctx.fill();rect(h.x-8,h.y-49,30,49,'#3c574d');circle(h.x+15,h.y-25,2,'#f4d88a');rect(h.x+35,h.y-77,20,26,'#fff0b7');rect(h.x-35,h.y-77,20,26,'#fff0b7');text(h.name,h.x-25,h.y-155,14,'#123f32');if(h.taken===3)text('✓ Collected',h.x-35,h.y-116,12,'#ddffde');else circle(h.x+8,h.y-121,5,'#ffdf82')});
 [80,2390].forEach(x=>{rect(x-55,325,120,95,'#245f51');rect(x-63,315,136,12,'#173e34');rect(x-35,365,80,30,'#102d26');text('COLLECTION',x-44,347,12);text('E · DELIVER',x-38,385,12,'#f2d37a')});
 tokens.forEach(t=>{if(!t.got){circle(t.x,t.y,11,'#eac460');text('↻',t.x-7,t.y+5,17,'#325340')}});
 // Draw a backpack, face, cap and walking legs.
 const p=player,walk=Math.abs(p.vx)>20?Math.sin(clock*15)*4:0;
 rect(p.x+(p.facing>0?-4:20),p.y+15,10,20,'#295d51');rect(p.x+4,p.y+14,19,21,'#edbd53');circle(p.x+13,p.y+8,10,'#bf875e');rect(p.x+3,p.y,22,5,'#174c40');rect(p.x+(p.facing>0?21:-4),p.y+3,9,3,'#174c40');circle(p.x+(p.facing>0?18:8),p.y+8,1.5,'#202d2a');rect(p.x+5,p.y+33,6,7+walk,'#173f37');rect(p.x+17,p.y+33,6,7-walk,'#173f37');
 particles.forEach(p=>rect(p.x,p.y,4,4,p.color));
 ctx.restore();
 // Overview map and location markers.
 rect(20,18,920,7,'#244e4860');for(const h of houses)circle(20+h.x/W*920,21,4,h.taken===3?'#2c9363':'#e8bd63');circle(20+player.x/W*920,21,5,'#fff');
 const context=nearCentre()?'E · DELIVER':nearHouse()?'E · Ring doorbell':'Explore and collect';
 rect(20,43,300,34,'#102e29e8');text(context,32,65,14);
 if(paused||complete){rect(0,0,960,480,'#08241ac9');text(complete?'Neighbourhood complete!':'Paused',290,215,30);text(complete?'Continue using the button below.':'Press P or Resume to continue.',290,253,16)}
}
function setPause(){paused=!paused;held.clear();pause.textContent=paused?'Resume':'Pause';draw()}
pause.onclick=setPause;
addEventListener('keydown',e=>{if(blocked()||e.ctrlKey||e.metaKey||e.altKey){held.clear();return}const k=e.key.toLowerCase();if(k===' '&&e.target.closest('button,a'))return;if(!['arrowleft','arrowright','arrowup','a','d','w',' ','e','p'].includes(k))return;e.preventDefault();if(k==='p'&&!e.repeat){setPause();return}if(paused||complete)return;if(['a','arrowleft'].includes(k))held.add('left');if(['d','arrowright'].includes(k))held.add('right');if(!e.repeat&&['w','arrowup',' '].includes(k))jump();if(k==='e'&&!e.repeat)interact()});
addEventListener('keyup',e=>{const k=e.key.toLowerCase();if(['a','arrowleft'].includes(k))held.delete('left');if(['d','arrowright'].includes(k))held.delete('right')});
addEventListener('blur',()=>held.clear());document.addEventListener('visibilitychange',()=>held.clear());$('.menu')?.addEventListener('click',()=>held.clear());
document.querySelectorAll('[data-key]').forEach(b=>{b.onpointerdown=e=>{if(paused||blocked())return;b.setPointerCapture(e.pointerId);held.add(b.dataset.key)};b.onpointerup=b.onpointercancel=b.onlostpointercapture=()=>held.delete(b.dataset.key)});
$('#jump').onclick=jump;$('#interact').onclick=interact;
$('#restart').onclick=()=>{scene=0;delivered=0;score=0;load()};$('#next-scene').onclick=()=>{if(scene===2){scene=0;delivered=0;score=0}else scene++;load()};
load();function frame(time){const dt=Math.min((time-last)/1000||0,.025);last=time;if(!blocked()&&!paused&&!complete)tick(dt);draw();requestAnimationFrame(frame)}requestAnimationFrame(frame);
})();
