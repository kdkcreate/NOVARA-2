(() => {
 const key='novara-video-published';
 const section=document.querySelector('#encycle-animation, #encycle-film');
 if (!section) return;
 const show=() => { section.hidden=false; };
 try { if(localStorage.getItem(key)==='yes') show(); } catch (_) {}
 const dialog=document.createElement('dialog');
 dialog.className='video-admin';
 dialog.innerHTML=`<form method="dialog"><button class="admin-close" aria-label="Close">×</button></form><h2>Admin panel</h2><div class="admin-login"><p>Enter the four-digit passcode.</p><div class="admin-digits" role="group" aria-label="Four-digit passcode">${Array.from({length:4},(_,i)=>`<input aria-label="Digit ${i+1}" inputmode="numeric" autocomplete="off" maxlength="1" pattern="[0-9]">`).join('')}</div><p role="status" class="admin-message"></p></div><div class="admin-actions" hidden><p>Manage the Encycle Bank video.</p><button type="button" class="button admin-publish">Publish video</button> <button type="button" class="button alt admin-preview">Or Preview</button><p class="admin-note">Publishing is saved in this browser only.</p></div>`;
 document.body.append(dialog);
 const inputs=[...dialog.querySelectorAll('input')],message=dialog.querySelector('.admin-message'),login=dialog.querySelector('.admin-login'),actions=dialog.querySelector('.admin-actions');
 function reset(){login.hidden=false;actions.hidden=true;message.textContent='';inputs.forEach(i=>i.value='');}
 inputs.forEach((input,i)=>{
  input.addEventListener('input',()=>{input.value=input.value.replace(/\D/g,'').slice(-1);if(input.value && i<3) inputs[i+1].focus();if(inputs.every(x=>x.value)){if(inputs.map(x=>x.value).join('')==='1923'){login.hidden=true;actions.hidden=false;actions.querySelector('button').focus();}else{message.textContent='Incorrect passcode. Try again.';inputs.forEach(x=>x.value='');inputs[0].focus();}}});
  input.addEventListener('keydown',e=>{if(e.key==='Backspace'&&!input.value&&i>0)inputs[i-1].focus()});
  input.addEventListener('paste',e=>{const digits=(e.clipboardData.getData('text').match(/\d/g)||[]).slice(0,4);if(digits.length===4){e.preventDefault();inputs.forEach((x,j)=>x.value=digits[j]);inputs[3].dispatchEvent(new Event('input',{bubbles:true}));}});
 });
 function reveal(){show();dialog.close();section.scrollIntoView({behavior:'smooth'});}
 dialog.querySelector('.admin-preview').onclick=reveal;
 dialog.querySelector('.admin-publish').onclick=()=>{try{localStorage.setItem(key,'yes');reveal();}catch(_){message.textContent='Browser storage is unavailable; publishing could not be saved.';login.hidden=false;actions.hidden=true;}};
 addEventListener('storage',e=>{if(e.key===key&&e.newValue==='yes')show()});
 addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&(e.key==='/'||e.code==='Slash')){e.preventDefault();if(!dialog.open){reset();dialog.showModal();inputs[0].focus();}}});
})();
