(() => {
  const $ = (id) => document.getElementById(id);
  const intro = $('game-intro'), question = $('game-question'), results = $('game-results');
  if (!intro || !question || !results) return;
  const bank = [
    {name:'Smartphone',emoji:'📱',category:'MOBILE DEVICE',prompt:'A phone is discarded with its battery and circuit board still inside. What is the most responsible environmental reason to send it to an authorised e-waste collector?',answers:['It allows useful metals and components to be recovered under controlled conditions.','It makes every component harmless immediately.','It guarantees the phone will be reused without inspection.','It removes the need to manage the battery separately.'],correct:0,explain:'Phones contain materials such as copper and small quantities of precious metals, alongside batteries and other components. Formal recyclers can recover useful materials and manage hazardous fractions more safely. Reuse may be possible after assessment, but it is not guaranteed.'},
    {name:'Rechargeable battery',emoji:'🔋',category:'BATTERY',prompt:'A damaged rechargeable battery is thrown into mixed household waste. Which risk is especially important?',answers:['It can never react once removed from a device.','It may be damaged or short-circuited, creating a fire risk.','It naturally turns into clean compost.','It only affects the appearance of the waste bin.'],correct:1,explain:'Lithium-based batteries can be damaged, crushed or short-circuited during collection and processing. Under some conditions they can overheat and ignite. Keep batteries out of mixed rubbish and use dedicated battery collection routes.'},
    {name:'Laptop',emoji:'💻',category:'COMPUTING EQUIPMENT',prompt:'An old laptop is dismantled informally and parts are burned to recover metals. What is a major concern?',answers:['Burning makes all metals easier to reuse safely.','Smoke and residues can release hazardous substances into the environment.','The process removes all plastic without emissions.','The only impact is extra noise.'],correct:1,explain:'Open burning of electronic components can release harmful fumes and particulate matter. Residues may also contaminate nearby soil and water. Controlled mechanical separation and specialist treatment are safer recovery approaches.'},
    {name:'Circuit board',emoji:'▧',category:'ELECTRONIC COMPONENT',prompt:'Why are circuit boards worth collecting separately for specialist recycling?',answers:['They contain recoverable metals, including copper and small amounts of precious metals.','They are made entirely from harmless paper.','They dissolve safely in rainwater.','They contain no materials that can be recovered.'],correct:0,explain:'Circuit boards can contain copper, gold, silver and other metals in complex mixtures. Specialist facilities can recover some of these materials while managing resins, metals and other fractions. Recovery methods and yields vary by board and process.'},
    {name:'Charger and cables',emoji:'🔌',category:'ACCESSORY',prompt:'A pile of unwanted chargers and cables is dumped outdoors. Which statement best describes the issue?',answers:['Cables disappear quickly because copper is biodegradable.','Plastic insulation and metal conductors can persist as waste; collection can recover some materials.','Every cable releases toxic chemicals immediately when exposed to air.','Cables have no recyclable materials.'],correct:1,explain:'Cables often combine metal conductors, plastic insulation and connectors. They can add to persistent waste when dumped, while appropriate processing can recover copper and some plastics. The exact recovery options depend on cable composition and local facilities.'},
    {name:'Fluorescent lamp',emoji:'💡',category:'LIGHTING EQUIPMENT',prompt:'Why should a fluorescent lamp be kept out of ordinary household waste where dedicated collection is available?',answers:['Some fluorescent lamps contain mercury that needs controlled handling.','All fluorescent lamps contain large quantities of lead.','The glass turns into a battery when crushed.','It is safe to crush them to save space.'],correct:0,explain:'Some fluorescent lamps contain mercury. If broken or poorly handled, mercury can be released and create exposure and contamination concerns. Keep lamps intact and use a suitable collection or take-back route. Different lamp technologies have different material profiles.'},
    {name:'Television',emoji:'📺',category:'DISPLAY EQUIPMENT',prompt:'An old television is sent to an uncontrolled dismantling site. What makes responsible processing important?',answers:['Displays and internal components may contain materials that require careful separation and treatment.','All televisions are identical and contain no hazardous materials.','A television becomes safe once its screen is switched off.','The only concern is the amount of space it occupies.'],correct:0,explain:'Televisions vary by age and display technology. Some contain substances or components that require careful handling, while metals, plastics and glass may be recoverable. An authorised recycler can identify and separate the different material streams.'},
    {name:'Mixed electronic parts',emoji:'♻️',category:'RECOVERY STREAM',prompt:'What is one environmental benefit of recovering metals from e-waste through a well-managed recycling process?',answers:['It removes the need for all future mining.','It can reduce demand for some newly extracted raw materials.','It guarantees zero energy use.','It makes product design and repair unnecessary.'],correct:1,explain:'Recovered materials can substitute for some virgin raw materials, helping reduce pressure on mining and extraction. Recycling still uses energy and cannot replace all primary production, so durable design, repair, reuse and responsible recycling all matter.'}
  ];
  let deck = [], index = 0, score = 0, locked = false, correctCount = 0;
  const shuffle = (items) => { const copy=[...items]; for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];} return copy; };
  const show = (el) => { el.hidden=false; };
  const hide = (el) => { el.hidden=true; };
  function start(){ deck=shuffle(bank); index=0; score=0; correctCount=0; hide(intro); hide(results); show(question); render(); }
  function render(){
    locked=false; const item=deck[index];
    $('game-step').textContent=`QUESTION ${String(index+1).padStart(2,'0')} / ${String(deck.length).padStart(2,'0')}`;
    $('live-score').textContent=score;
    $('game-progress').setAttribute('aria-valuenow',index);
    $('game-progress-fill').style.width=`${(index/deck.length)*100}%`;
    $('item-emoji').textContent=item.emoji; $('item-category').textContent=item.category;
    $('question-title').textContent=`${item.name}: what is the impact?`;
    $('question-prompt').textContent=item.prompt;
    $('answer-feedback').textContent=''; $('answer-feedback').className='answer-feedback';
    hide($('explanation')); $('next-question').disabled=true;
    const list=$('answer-list'); list.replaceChildren();
    item.answers.forEach((answer,i)=>{
      const button=document.createElement('button'); button.type='button'; button.className='answer-option';
      button.innerHTML=`<span class="answer-index">0${i+1}</span><span></span>`;
      button.querySelector('span:last-child').textContent=answer;
      button.addEventListener('click',()=>choose(i)); list.append(button);
    });
  }
  function choose(choice){
    if(locked)return; locked=true; const item=deck[index]; const buttons=[...$('answer-list').children];
    buttons.forEach((button,i)=>{button.disabled=true;if(i===item.correct)button.classList.add('is-correct');if(i===choice&&choice!==item.correct)button.classList.add('is-wrong');});
    const correct=choice===item.correct; if(correct){score++;correctCount++;}
    const feedback=$('answer-feedback'); feedback.textContent=correct?'Correct. You spotted the key impact.':'Not quite. The highlighted answer is the most accurate.'; feedback.classList.add(correct?'is-correct':'is-wrong');
    $('explanation-title').textContent=correct?'Why that matters':'The environmental context'; $('explanation-text').textContent=item.explain; show($('explanation'));
    $('live-score').textContent=score; $('next-question').disabled=false; $('next-question').textContent=index===deck.length-1?'View results →':'Next question →';
  }
  function next(){if(!locked)return; index++; if(index>=deck.length){finish();return;} render();}
  function finish(){hide(question);show(results);$('game-progress').setAttribute('aria-valuenow',deck.length);$('game-progress-fill').style.width='100%';$('final-score').textContent=`${score}/${deck.length}`;
    const pct=score/deck.length; $('result-heading').textContent=pct===1?'Excellent environmental awareness.':pct>=.625?'A strong field report.':'A good starting point.';
    $('result-copy').textContent=`You answered ${correctCount} of ${deck.length} questions correctly. The most useful takeaway: the impact of e-waste depends on its materials and the way it is collected, handled and processed. Keep learning, repair and reuse where possible, and choose authorised collection routes.`;
  }
  $('start-game').addEventListener('click',start); $('next-question').addEventListener('click',next); $('restart-game').addEventListener('click',start);
})();
