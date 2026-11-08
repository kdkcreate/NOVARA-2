(() => {
 const home=location.pathname.endsWith('/')||location.pathname.endsWith('/index.html');
 const layer=document.createElement('div');layer.className='foliage'+(home?' home-leaves':'');layer.setAttribute('aria-hidden','true');
 // Original vector foliage; no images or animation libraries needed.
 const branch=`<path class="leaf-stem" d="M38 -10 Q125 105 74 300 Q59 355 95 440"/>
 <g fill="#3e7645"><path d="M77 67 Q15 18 5 55 Q0 109 85 119 Q113 93 77 67Z"/><path d="M99 133 Q158 63 197 89 Q219 135 91 182 Q75 156 99 133Z"/><path d="M86 207 Q19 140 4 190 Q-7 248 79 259 Q111 236 86 207Z"/><path d="M76 290 Q148 210 185 246 Q200 293 68 342 Q52 318 76 290Z"/><path d="M79 369 Q14 310 9 355 Q4 403 92 425 Q112 397 79 369Z"/></g>
 <g fill="#64934d"><path d="M54 25 Q105 -8 143 16 Q132 65 74 71Z"/><path d="M84 258 Q127 300 126 351 Q84 337 70 303Z"/></g>
 <g class="leaf-vein"><path d="M85 113 Q54 83 14 62 M94 174 Q145 124 191 97 M80 251 Q48 218 12 196 M70 334 Q119 283 179 254 M91 416 Q54 382 18 359 M73 65 L134 21"/></g>`;
 layer.innerHTML=['left','right'].map(side=>`<svg class="leaf-cluster ${side}" viewBox="0 0 220 460" xmlns="http://www.w3.org/2000/svg" focusable="false"><g ${side==='right'?'transform="translate(220 0) scale(-1 1)"':''}>${branch}</g></svg>`).join('');
 document.body.append(layer);
 const pause=()=>document.body.classList.toggle('leaves-paused',document.hidden);document.addEventListener('visibilitychange',pause);pause();
})();
