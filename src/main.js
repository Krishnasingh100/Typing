// Typing test 
import words from './word.js';

document.addEventListener('DOMContentLoaded', () => {
	const resetBtn = document.getElementById('resetBtn');
	const textDisplay = document.getElementById('textDisplay');
	const timeEl = document.getElementById('time');
	const wpmEl = document.getElementById('wpm');
	const accEl = document.getElementById('accuracy');
	const errEl = document.getElementById('errors');

	let timer = null;
	let timeElapsed = 0; 
	let started = false;
	let position = 0;
	let errors = 0;
	let totalTyped = 0;
	let correctChars = 0;
	let text = '';

	function pickText(){
		const pool = Array.isArray(words) ? words : Object.values(words).flat();

		// create a paragraph of 50 words
		const out = [];
		while(out.length < 50){
			const next = pool[Math.floor(Math.random()*pool.length)];
			out.push(next);
		}
		return out.join(' ');
	}

	function renderText(){
		textDisplay.innerHTML = '';
		for(let i=0;i<text.length;i++){
			const span = document.createElement('span');
			span.className = 'char';
			span.textContent = text[i];
			if(i===0) span.classList.add('current');
			textDisplay.appendChild(span);
		}
		
	// Start the timer when clicking on text	
		textDisplay.addEventListener('click', () => {
			if (!started) {
				startTimer(); 
			}
		});
	}

	function resetStats(){
		clearInterval(timer);
		timer = null;
		timeElapsed = 0;
		started = false;
		position = 0;
		errors = 0;
		totalTyped = 0;
		correctChars = 0;
		timeEl.textContent = timeElapsed; 
		wpmEl.textContent = 0;
		accEl.textContent = 100;
		errEl.textContent = 0;
	}

	// Separate function to start just the timer
	function startTimer(){
		if (started) return; 
		started = true;
		timer = setInterval(()=>{
			timeElapsed += 1; 
			timeEl.textContent = timeElapsed;
			updateStats();
			
		},1000);
	}
// Removed automatic timer start - now waits for click
	function startTest(){
		resetStats();
		text = pickText();
		renderText();
		
	}

	function endTest(){
		clearInterval(timer);
		started = false;
		updateStats(true);
	}

	function updateStats(final=false){
		const elapsed = timeElapsed / 60; 
		const wpm = elapsed > 0 ? Math.round((correctChars/5)/elapsed) : 0;
		const accuracy = totalTyped>0 ? Math.max(0, Math.round((correctChars/totalTyped)*100)) : 100;
		wpmEl.textContent = wpm;
		accEl.textContent = accuracy;
		errEl.textContent = errors;
		if(final){
			// Show popup with stats
			showResultsPopup({
				time: timeElapsed,
				errors: errors,
				wpm: wpm,
				accuracy: accuracy
			});
		}
	}

	function setCurrentClass(){
		const spans = textDisplay.querySelectorAll('.char');
		spans.forEach((s,i)=>{
			s.classList.remove('current');
			if(i===position) s.classList.add('current');
		});
	}

	function processKey(key){
		// Start timer on first keypress if not already started
		if (!started) {
			startTimer();
		}
		//loda lahsun mean ignore modifier keys for stats and position
		if(key === 'Shift' || key === 'Alt' || key === 'Control' || key === 'Meta') return;
		const spans = textDisplay.querySelectorAll('.char');
		if(key === 'Backspace'){
			if(position===0) return;
			position--;
			const span = spans[position];
			if(span.classList.contains('incorrect')){
				errors = Math.max(0, errors-1);
			} else if(span.classList.contains('correct')){
				correctChars = Math.max(0, correctChars-1);
			}
			span.classList.remove('correct','incorrect');
			totalTyped = Math.max(0, totalTyped-1);
			setCurrentClass();
			updateStats();
			return;
		}

		//  printable char
		if(key.length === 1){
			if(position >= text.length) return;
			const expected = text[position];
			const span = spans[position];
			if(key === expected){
				span.classList.add('correct');
				correctChars++;
			} else {
				span.classList.add('incorrect');
				errors++;
			}
			position++;
			totalTyped++;
			setCurrentClass();
			updateStats();
			if(position >= text.length) endTest();
		}
	}

	resetBtn.addEventListener('click', ()=>{
		startTest();
	});

	document.addEventListener('keydown', (e)=>{
		if(e.key === 'Tab') return;
		// prevent default only for printable keys/backspace to avoid page scroll
		if(e.key.length === 1 || e.key === 'Backspace') e.preventDefault();
		processKey(e.key);
	});

	// auto-start test setup on load (but don't start timer bsdk)
	startTest();
});

function showResultsPopup({time, errors, wpm, accuracy}) {
	// Use HTML popup container
	const popup = document.getElementById('resultsPopup');
	document.getElementById('popupTime').textContent = time;
	document.getElementById('popupErrors').textContent = errors;
	document.getElementById('popupWpm').textContent = wpm;
	document.getElementById('popupAccuracy').textContent = accuracy;
	popup.style.display = 'flex';
	document.getElementById('closePopupBtn').onclick = function() {
		popup.style.display = 'none';
	};
}
