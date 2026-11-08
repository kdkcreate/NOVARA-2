(() => {
 const dict=window.NOVARA_ML;
 const button=document.createElement('button');button.className='language-toggle';button.dataset.noTranslate='';document.querySelector('header').append(button);
 let lang='en';try{lang=localStorage.getItem('novara-language')==='ml'?'ml':'en'}catch{}
 const originals=new WeakMap(),attrs=new WeakMap();
 const norm=s=>s.trim().replace(/\s+/g,' ');
 function tr(s){
  const key=norm(s);if(dict[key])return dict[key];
  let m;
  if((m=key.match(/^Open photograph: (.+)$/)))return 'ചിത്രം തുറക്കുക: '+tr(m[1]);
  if((m=key.match(/^Team-supplied video (\d+) · Event description pending$/)))return 'ടീം നൽകിയ വീഡിയോ '+m[1]+' · പരിപാടിയുടെ വിവരണം ലഭിക്കാനുണ്ട്';
  if((m=key.match(/^Team-supplied video (\d+)$/)))return 'ടീം നൽകിയ വീഡിയോ '+m[1];
  if((m=key.match(/^Question (\d+) of (\d+)$/)))return 'ചോദ്യം '+m[1]+' / '+m[2];
  if((m=key.match(/^Your score: (\d+) \/ (\d+)$/)))return 'നിങ്ങളുടെ സ്കോർ: '+m[1]+' / '+m[2];
  if((m=key.match(/^Neighbourhood (\d+) \/ 3$/)))return 'അയൽപക്കം '+m[1]+' / 3';
  if((m=key.match(/^Delivered: (\d+) · Bag: (\d+) \/ 6$/)))return 'കൈമാറിയത്: '+m[1]+' · ബാഗ്: '+m[2]+' / 6';
  if((m=key.match(/^Mission complete! (\d+) fictional devices delivered across three neighbourhoods. Thank you for playing.$/)))return 'ദൗത്യം പൂർത്തിയായി! മൂന്ന് അയൽപക്കങ്ങളിൽ നിന്നായി '+m[1]+' സാങ്കൽപ്പിക ഉപകരണങ്ങൾ കൈമാറി. കളിച്ചതിന് നന്ദി.';
  if((m=key.match(/^(Mira|Arun|Leela): Thanks for collecting our old electronics!$/)))return tr(m[1])+': ഞങ്ങളുടെ പഴയ ഉപകരണങ്ങൾ ശേഖരിച്ചതിന് നന്ദി!';
  if((m=key.match(/^(Mira|Arun|Leela): Hello! We have a (.+) and (.+) for collection\. Please take them to the centre\. Device data has been prepared for this fictional handover\.$/)))return tr(m[1])+': നമസ്കാരം! ശേഖരണത്തിനായി '+tr(m[2][0].toUpperCase()+m[2].slice(1))+' ഒപ്പം '+tr(m[3][0].toUpperCase()+m[3].slice(1))+' ഉണ്ട്. ഇവ കേന്ദ്രത്തിൽ എത്തിക്കുക. ഈ സാങ്കൽപ്പിക കൈമാറ്റത്തിനായി ഉപകരണത്തിലെ ഡാറ്റ തയ്യാറാക്കിയിട്ടുണ്ട്.';
  if(key.startsWith('✓ Correct. '))return '✓ ശരിയാണ്. '+tr(key.slice(11));
  if(key.startsWith('✕ Incorrect. Correct answer: ')){const tail=key.slice(29);for(const source of Object.keys(dict)){if(tail.startsWith(source+'. '))return '✕ തെറ്റാണ്. ശരിയായ ഉത്തരം: '+dict[source]+'. '+tr(tail.slice(source.length+2))}}
  return s;
 }
 window.novaraTranslate=s=>lang==='ml'?tr(s):s;
 const ignored=el=>el.closest('script,style,[data-no-translate],#enc-screen');
 function translate(){
  observer.disconnect();
  // data-ml paragraphs have explicit reviewed local translations.
  document.querySelectorAll('[data-ml]').forEach(el=>{if(!el.dataset.en)el.dataset.en=el.textContent;el.textContent=lang==='ml'?el.dataset.ml:el.dataset.en});
  const walker=document.createTreeWalker(document.documentElement,NodeFilter.SHOW_TEXT);let node;
  while(node=walker.nextNode()){
   const parent=node.parentElement;if(!parent||ignored(parent)||parent.closest('[data-ml]'))continue;
   let record=originals.get(node);if(!record||node.nodeValue!==record.last)record={en:node.nodeValue};
   const value=lang==='ml'?tr(record.en):record.en;if(node.nodeValue!==value)node.nodeValue=value;record.last=value;originals.set(node,record);
  }
  document.querySelectorAll('[alt],[aria-label],[title],[placeholder]').forEach(el=>{if(ignored(el))return;let record=attrs.get(el)||{};for(const key of ['alt','aria-label','title','placeholder']){if(!el.hasAttribute(key))continue;const value=el.getAttribute(key);if(!record[key]||value!==record[key].last)record[key]={en:value};const translated=lang==='ml'?tr(record[key].en):record[key].en;el.setAttribute(key,translated);record[key].last=translated}attrs.set(el,record)});
  observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true});
 }
 const observer=new MutationObserver(translate);
 function apply(){document.documentElement.lang=lang;button.textContent=lang==='ml'?'English':'മലയാളത്തിലേക്ക്';button.setAttribute('aria-label',lang==='ml'?'Switch to English':'മലയാളത്തിലേക്ക് മാറ്റുക');translate();dispatchEvent(new Event('novara-language'))}
 button.onclick=()=>{lang=lang==='ml'?'en':'ml';try{localStorage.setItem('novara-language',lang)}catch{}apply()};
 apply();
})();
