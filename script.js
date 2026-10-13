// Database van alle organellen met aangepaste (verschoven) coördinaten
const allOrganelles = [
  { id: 'celwand', name: 'Celwand', top: '3.5%', left: '45%', hint: 'Buitenste groene rand.', fact: 'Zorgt voor stevigheid.' },
  { id: 'celmembraan', name: 'Celmembraan', top: '7.5%', left: '45%', hint: 'Vliesje aan de binnenkant van de celwand.', fact: 'Bepaalt wat er in en uit gaat.' },
  { id: 'cytoplasma', name: 'Cytoplasma', top: '78%', left: '22%', hint: 'De vloeistof in de cel.', fact: 'Hier zweven alle organellen in.' },
  { id: 'vacuole', name: 'Vacuole', top: '50%', left: '62%', hint: 'Grote blauwe blaas.', fact: 'Slaat water op en zorgt voor druk.' },
  { id: 'celkern', name: 'Celkern', top: '48%', left: '28%', hint: 'De grote paarse bol.', fact: 'Bevat al het DNA (de baas).' },
  { id: 'nucleolus', name: 'Nucleolus', top: '38%', left: '20%', hint: 'Gele bolletje in de celkern.', fact: 'Maakt ribosomen aan.' },
  { id: 'chloroplast', name: 'Bladgroenkorrel', top: '18%', left: '74%', hint: 'Groene ovalen met streepjes.', fact: 'Zorgt voor fotosynthese.' },
  { id: 'mitochondrion', name: 'Mitochondrion', top: '70%', left: '80%', hint: 'Rode boontjes met plooien.', fact: 'De energiefabriekjes van de cel.' },
  { id: 'er', name: 'ER', top: '62%', left: '12%', hint: 'Gele geplooide membraan rond de kern.', fact: 'Transporteert eiwitten.' },
  { id: 'ribosoom', name: 'Ribosoom', top: '48%', left: '38%', hint: 'Kleine zwarte stipjes.', fact: 'Kleine eiwitfabriekjes.' },
  { id: 'golgi', name: 'Golgi-systeem', top: '86%', left: '76%', hint: 'Oranje gestapelde pannenkoeken.', fact: 'Verpakt stoffen.' },
  { id: 'amyloplast', name: 'Amyloplast', top: '85%', left: '18%', hint: 'Grijze bol links onder (zetmeel).', fact: 'Slaat reservestoffen op.' },
  { id: 'peroxisoom', name: 'Peroxisoom', top: '14%', left: '32%', hint: 'Klein groen bolletje.', fact: 'Ruimt afvalstoffen op.' }
];

let generatedLevels = [];
let currentLevel = 0;
let score = 0;
let timeRemaining = 300;
let timerInterval = null;
let currentItems = [];
let completedCount = 0;
let selectedLabelId = null;

function startSpel() {
  document.getElementById('start-modal').style.display = 'none';
  generateRandomLevels();
  startTimer();
  loadLevel(currentLevel);
}

function nextLevel() {
  if (currentLevel < generatedLevels.length - 1) {
    currentLevel++;
    loadLevel(currentLevel);
  } else {
    showEndModal('Geweldig! Je hebt het gehaald!');
  }
}

function generateRandomLevels() {
  const shuffled = [...allOrganelles].sort(() => Math.random() - 0.5);
  generatedLevels = [ shuffled.slice(0, 4), shuffled.slice(4, 8), shuffled.slice(8, 13) ];
}

function loadLevel(levelIdx) {
  completedCount = 0;
  selectedLabelId = null;
  document.getElementById('next-btn').disabled = true;
  document.getElementById('drop-zones-container').innerHTML = '';
  document.getElementById('labels-container').innerHTML = '';

  currentItems = generatedLevels[levelIdx];
  document.getElementById('level-display').textContent = `${levelIdx + 1} / 3`;
  updateProgress();
  setFeedback('Lees de namen en zoek de juiste plek in de plantencel!', '');

  currentItems.forEach(item => {
    const zone = document.createElement('div');
    zone.classList.add('drop-zone');
    zone.style.top = item.top;
    zone.style.left = item.left;
    zone.dataset.id = item.id;
    zone.textContent = '?';

    zone.addEventListener('dragover', e => e.preventDefault());
    zone.addEventListener('dragenter', () => zone.classList.add('drag-over'));
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', handleDrop);
    zone.addEventListener('click', () => handleZoneClick(zone));

    document.getElementById('drop-zones-container').appendChild(zone);
  });

  const shuffledLabels = [...currentItems].sort(() => Math.random() - 0.5);
  shuffledLabels.forEach(item => {
    const label = document.createElement('div');
    label.classList.add('draggable-label');
    label.draggable = true;
    label.dataset.id = item.id;
    label.textContent = item.name;

    label.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', item.id);
      selectLabel(item.id, label);
    });
    label.addEventListener('click', () => {
      if (!label.classList.contains('disabled')) selectLabel(item.id, label);
    });

    document.getElementById('labels-container').appendChild(label);
  });
}

function selectLabel(id, el) {
  document.querySelectorAll('.draggable-label').forEach(l => l.classList.remove('selected'));
  selectedLabelId = id;
  el.classList.add('selected');
}

function handleDrop(e) {
  e.preventDefault();
  const zone = e.currentTarget;
  zone.classList.remove('drag-over');
  const draggedId = e.dataTransfer.getData('text/plain');
  checkMatch(draggedId, zone);
}

function handleZoneClick(zone) {
  if (zone.classList.contains('filled')) return;
  if (!selectedLabelId) {
    setFeedback('Selecteer eerst een naam uit het rijtje!', 'wrong');
    return;
  }
  checkMatch(selectedLabelId, zone);
}

function checkMatch(labelId, zone) {
  if (zone.classList.contains('filled')) return;
  const targetId = zone.dataset.id;
  const targetData = currentItems.find(i => i.id === targetId);
  const guessedData = allOrganelles.find(i => i.id === labelId);

  if (labelId === targetId) {
    zone.textContent = '✓ ' + targetData.name;
    zone.classList.add('filled');
    const labelEl = document.querySelector(`.draggable-label[data-id="${labelId}"]`);
    if (labelEl) {
      labelEl.classList.add('disabled');
      labelEl.classList.remove('selected');
    }
    selectedLabelId = null;
    score += 10;
    document.getElementById('score-display').textContent = score;
    completedCount++;
    setFeedback(`Juist! ${targetData.fact}`, 'correct');
    updateProgress();

    if (completedCount === currentItems.length) {
      setTimeout(() => setFeedback('🎉 Niveau compleet! Ga door naar de volgende.', 'correct'), 1000);
      document.getElementById('next-btn').disabled = false;
      document.getElementById('next-btn').onclick = nextLevel;
    }
  } else {
    score = Math.max(0, score - 2);
    document.getElementById('score-display').textContent = score;
    setFeedback(`Fout! Tip voor ${guessedData.name}: ${guessedData.hint}`, 'wrong');
  }
}

function setFeedback(msg, type) {
  const fb = document.getElementById('feedback-message');
  if (fb) {
    fb.textContent = msg;
    fb.className = `feedback-message ${type}`;
  }
}

function updateProgress() {
  const pct = (completedCount / currentItems.length) * 100;
  document.getElementById('progress-bar').style.width = `${pct}%`;
}

function startTimer() {
  timerInterval = setInterval(() => {
    timeRemaining--;
    const mins = Math.floor(timeRemaining / 60).toString().padStart(2, '0');
    const secs = (timeRemaining % 60).toString().padStart(2, '0');
    document.getElementById('timer-display').textContent = `${mins}:${secs}`;
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      showEndModal('De tijd is om!');
    }
  }, 1000);
}

function showEndModal(title) {
  clearInterval(timerInterval);
  const modal = document.getElementById('end-modal');
  modal.querySelector('h2').textContent = title;
  document.getElementById('final-stats').textContent = `Je eindscore is: ${score} punten!`;
  modal.classList.add('active');
}
