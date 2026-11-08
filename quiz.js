(() => {
 const panel=document.querySelector('#quiz'),start=document.querySelector('#start');
 let index=0,score=0,answered=false;
 function shuffle(values){const copy=[...values];for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]]}return copy}
 function render(){
  answered=false;panel.replaceChildren();
  if(index===quizData.length){panel.innerHTML=`<h2 tabindex="-1">Your score: ${score} / ${quizData.length}</h2><p>${score>=12?'Excellent knowledge!':score>=8?'A solid start. Keep exploring the learning guide.':'Keep learning—you can try again whenever you like.'}</p>`;start.hidden=false;start.textContent='Play again';panel.querySelector('h2').focus({preventScroll:true});return}
  const [question,options,explanation]=quizData[index];
  panel.innerHTML=`<p>Question ${index+1} of ${quizData.length}</p><progress value="${index}" max="${quizData.length}" aria-label="Quiz progress"></progress><h2 tabindex="-1"></h2><div class="answers"></div><p class="quiz-feedback" role="status"></p><button class="button next" hidden>Next question →</button>`;
  panel.querySelector('h2').textContent=question;
  const group=panel.querySelector('.answers'),feedback=panel.querySelector('.quiz-feedback'),next=panel.querySelector('.next');
  shuffle(options).forEach(answer=>{const button=document.createElement('button');button.className='quiz-option';button.textContent=answer;button.dataset.correct=String(answer===options[0]);group.append(button);button.onclick=()=>{if(answered)return;answered=true;const correct=answer===options[0];if(correct)score++;group.querySelectorAll('button').forEach(b=>{b.disabled=true;if(b.dataset.correct==='true')b.classList.add('correct')});if(!correct)button.classList.add('wrong');feedback.textContent=(correct?'✓ Correct. ':'✕ Incorrect. Correct answer: '+options[0]+'. ')+explanation;next.hidden=false;next.textContent=index===quizData.length-1?'See results →':'Next question →';next.focus({preventScroll:true})}});
  next.onclick=()=>{index++;render()};panel.querySelector('h2').focus({preventScroll:true});
 }
 start.onclick=()=>{index=0;score=0;start.hidden=true;render()};
})();
