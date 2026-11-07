(() => {
 'use strict';
 const canvas=document.querySelector('#world'),ctx=canvas.getContext('2d');
 const dialogue=document.querySelector('#dialogue'),hotbar=document.querySelector('#hotbar'),next=document.querySelector('#next-scene');
 const types=['Phone','Laptop','Tablet','Charger','Headphones'],symbols=['▯','▱','▣','⌁','Ω'];
 const keys=new Set();let scene=0,delivered=0,bag=[],houses=[],platforms=[],player,complete=false,last=0;
 const ground=420,centre={x:835,y:420};
 function tell(s){dialogue.textContent=s}
 function load(){
  keys.clear();complete=false;bag=[];next.hidden=true;player={x:40,y:380,w:24,h:40,vy:0,onGround:false};
  houses=[{x:160,y:350,name:'Mira'},{x:410,y:290,name:'Arun'},{x:655,y:340,name:'Leela'}].map((h,i)=>({...h,y:h.y-(scene===1?10:0),items:[Math.floor(Math.random()*5),Math.floor(Math.random()*5)],collected:false}));
  platforms=[{x:0,y:ground,w:960},{x:90,y:380,w:60},{x:145,y:houses[0].y,w:120},{x:300,y:350,w:65},{x:365,y:houses[1].y,w:140},{x:550,y:365,w:65},{x:620,y:houses[2].y,w:135}];
  tell('Visit each terrace. Stand by a door and press E to ring the bell. Your bag holds six items.');update();draw();
 }
 function update(){document.querySelector('#stage').textContent=`Neighbourhood ${scene+1} / 3`;document.querySelector('#delivery').textContent=`Delivered: ${delivered} · Bag: ${bag.length} / 6`;hotbar.replaceChildren();types.forEach((type,i)=>{const slot=document.createElement('div');slot.className='slot';const count=bag.filter(t=>t===i).length;slot.innerHTML=`<b>${symbols[i]} × ${count}</b>${type}`;hotbar.append(slot)})}
 function interact(){
  if(complete)return;
  if(player.x>805&&player.y+player.h>390){if(!bag.length){tell('Collection centre: visit the houses first, then bring your items here.');return}delivered+=bag.length;bag=[];update();if(houses.every(h=>h.collected)){complete=true;next.hidden=false;next.textContent=scene===2?'Play a new mission':'Next neighbourhood →';tell(scene===2?`Mission complete! ${delivered} fictional devices delivered across three neighbourhoods. Thank you for playing.`:'Neighbourhood complete! All households visited and all items delivered.')}else tell('Delivery received. Your inventory is empty—visit the remaining houses.');return}
  const h=houses.find(h=>Math.abs(player.x+12-h.x)<55&&Math.abs(player.y+40-h.y)<16);
  if(!h){tell('Get close to a terrace door to ring, or stand beside the collection centre to deliver.');return}
  if(h.collected){tell(`${h.name}: Thanks for collecting our old electronics!`);return}
  if(bag.length+h.items.length>6){tell('Your bag is full. Deliver it at the centre first.');return}
  bag.push(...h.items);h.collected=true;tell(`${h.name}: Hello! We have a ${types[h.items[0]].toLowerCase()} and ${types[h.items[1]].toLowerCase()} for collection. Please take them to the centre. Device data has been prepared for this fictional handover.`);update();
 }
 function jump(){if(player.onGround&&!complete){player.vy=-470;player.onGround=false}}
 function tick(dt){
  if(complete)return;
  player.x=Math.max(0,Math.min(936,player.x+((keys.has('right')?1:0)-(keys.has('left')?1:0))*225*dt));
  const bottom=player.y+player.h;player.vy+=1250*dt;player.y+=player.vy*dt;player.onGround=false;
  for(const p of platforms){if(player.vy>=0&&bottom<=p.y+1&&player.y+player.h>=p.y&&player.x+player.w>p.x&&player.x<p.x+p.w){player.y=p.y-player.h;player.vy=0;player.onGround=true;break}}
 }
 function box(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(x,y,w,h)}
 function draw(){
  const sky=ctx.createLinearGradient(0,0,0,480);sky.addColorStop(0,['#b4dedc','#e1c6a0','#b8c7e5'][scene]);sky.addColorStop(1,'#f7edd6');ctx.fillStyle=sky;ctx.fillRect(0,0,960,480);
  ctx.fillStyle='#fbebba';ctx.beginPath();ctx.arc(800,72,35,0,Math.PI*2);ctx.fill();
  for(let i=0;i<8;i++){box(i*145-25,220-(i%3)*24,100,200,'#8bb3a0');box(i*145,245,12,20,'#bad3bf')}
  platforms.forEach(p=>{box(p.x,p.y,p.w,p.y===ground?60:14,'#b49b75');box(p.x,p.y,p.w,5,'#51886a')});
  houses.forEach((h,i)=>{box(h.x-30,h.y-100,88,100,['#ca8766','#568d99','#b7a368'][i]);ctx.fillStyle='#324e48';ctx.beginPath();ctx.moveTo(h.x-43,h.y-100);ctx.lineTo(h.x+13,h.y-142);ctx.lineTo(h.x+70,h.y-100);ctx.fill();box(h.x-4,h.y-47,27,47,h.collected?'#305c4b':'#543d36');box(h.x+33,h.y-78,17,22,'#f7e6ac');ctx.fillStyle='#183c32';ctx.font='bold 13px sans-serif';ctx.fillText(h.collected?'✓ Collected':h.name+' · E',h.x-30,h.y-153)});
  box(820,325,120,95,'#276b59');box(812,315,136,12,'#174936');box(839,357,80,35,'#113e33');ctx.fillStyle='#f8ebbf';ctx.font='bold 12px sans-serif';ctx.fillText('COLLECTION',835,345);ctx.fillText('E · DELIVER',839,380);
  box(player.x+4,player.y+9,17,23,'#f3bc52');box(player.x+2,player.y+2,20,13,'#a96c49');box(player.x+1,player.y,22,5,'#174e42');box(player.x,player.y+18,6,15,'#255e4d');box(player.x+4,player.y+32,6,8,'#193d35');box(player.x+15,player.y+32,6,8,'#193d35');
 }
 function controlsBlocked(target){return document.hidden||document.querySelector('.drawer.open')||target?.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"])')}
 addEventListener('keydown',e=>{
  if(controlsBlocked(e.target)||e.ctrlKey||e.metaKey||e.altKey){keys.clear();return}
  const k=e.key.toLowerCase();
  // Preserve Space/Enter activation on focused buttons and links.
  if(k===' '&&e.target.closest('button,a'))return;
  if(!['arrowleft','arrowright','arrowup','a','d','w',' ','e'].includes(k))return;
  e.preventDefault();
  if(k==='a'||k==='arrowleft')keys.add('left');
  if(k==='d'||k==='arrowright')keys.add('right');
  if(!e.repeat&&['w','arrowup',' '].includes(k))jump();
  if(!e.repeat&&k==='e')interact();
 });
 addEventListener('keyup',e=>{const k=e.key.toLowerCase();if(['a','arrowleft'].includes(k))keys.delete('left');if(['d','arrowright'].includes(k))keys.delete('right')});
 addEventListener('blur',()=>keys.clear());
 document.addEventListener('visibilitychange',()=>keys.clear());
 document.addEventListener('focusin',e=>{if(controlsBlocked(e.target))keys.clear()});
 document.querySelector('.menu')?.addEventListener('click',()=>keys.clear());
 document.querySelectorAll('[data-key]').forEach(b=>{b.onpointerdown=e=>{b.setPointerCapture(e.pointerId);keys.add(b.dataset.key)};b.onpointerup=b.onpointercancel=()=>keys.delete(b.dataset.key)});
 document.querySelector('#jump').onclick=jump;document.querySelector('#interact').onclick=interact;
 document.querySelector('#restart').onclick=()=>{scene=0;delivered=0;load()};next.onclick=()=>{if(scene===2){scene=0;delivered=0}else scene++;load();canvas.focus()};
 load();function frame(time){const dt=Math.min((time-last)/1000||0,.025);last=time;if(!document.hidden){tick(dt);draw()}requestAnimationFrame(frame)}requestAnimationFrame(frame);
})();
