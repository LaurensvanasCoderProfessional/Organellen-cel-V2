// Organellen data voor de plantencel verdeeld over 3 niveaus
const levelsData = [
  // Niveau 1: Basis organellen van een plantencel
  [
    { id: 'celwand', name: 'Celwand', top: '3%', left: '42%' },
    { id: 'celmembraan', name: 'Celmembraan', top: '10%', left: '8%' },
    { id: 'cytoplasma', name: 'Cytoplasma', top: '88%', left: '60%' },
    { id: 'vacuole', name: 'Vacuole', top: '48%', left: '56%' },
    { id: 'celkern', name: 'Celkern', top: '42%', left: '16%' },
    { id: 'chloroplast', name: 'Bladgroenkorrel', top: '15%', left: '68%' }
  ],
  // Niveau 2: Medium complexiteit
  [
    { id: 'mitochondrion', name: 'Mitochondrion', top: '64%', left: '72%' },
    { id: 'er', name: 'Endoplasmatisch Reticulum', top: '32%', left: '2%' },
    { id: 'golgi', name: 'Golgi-systeem', top: '82%', left: '68%' },
    { id: 'ribosoom', name: 'Ribosoom', top: '32%', left: '34%' },
    { id: 'chloroplast', name: 'Bladgroenkorrel', top: '15%', left: '68%' },
    { id: 'vacuole', name: 'Vacuole', top: '48%', left: '56%' }
  ],
  // Niveau 3: Alle specifieke plantenorganellen
  [
    { id: 'nucleolus', name: 'Nucleolus', top: '38%', left: '25%' },
    { id: 'peroxisoom', name: 'Peroxisoom', top: '14%', left: '35%' },
    { id: 'amyloplast', name: 'Amyloplast', top: '78%', left: '10%' },
    { id: 'celwand', name: 'Celwand', top: '3%', left: '42%' },
    { id: 'golgi', name: 'Golgi-systeem', top: '82%', left: '68%' },
    { id: 'mitochondrion', name: 'Mitochondrion', top: '64%', left: '72%' }
  ]
];

let currentLevel = 0;
let score = 0;
let timeRemaining = 300; // 5 minuten
let timerInterval = null;
let currentItems = [];
let completedCount = 0;
let selectedLabel = null;

// DOM Elementen
const dropZonesContainer = document.getElementById('drop-zones-container');
const labelsContainer = document.getElementById('labels-container');
const feedbackMessage = document.getElementById('feedback-message');
const scoreDisplay = document.getElementById('score-display');
const levelDisplay = document.getElementById('level-display');
const timerDisplay = document.getElementById('timer-display');
const progressBar = document.getElementById('progress-bar');
const nextBtn = document.getElementById('next-btn');
const endModal = document.getElementById('end-modal');

// Initialiseer spel
function initGame() {
  startTimer();
  loadLevel(currentLevel);

  nextBtn.addEventListener('click', () => {
    if (currentLevel < levelsData.length - 1) {
      currentLevel++;
      loadLevel(currentLevel);
    } else {
      showEndModal();
    }
  });
}

// Niveau laden
function loadLevel(levelIdx) {
  completedCount = 0;
  selectedLabel = null;
  nextBtn.disabled = true;
  dropZonesContainer.innerHTML = '';
  labelsContainer.innerHTML = '';

  currentItems = levelsData[levelIdx];
  levelDisplay.textContent = `${levelIdx + 1} / ${levelsData.length}`;
  updateProgress();

  setFeedback('Kies een organelnaam en sleep of klik op het juiste vakje!', '');

  // Dropzones aanmaken
  currentItems.forEach(item => {
    const zone = document.createElement('div');
    zone.classList.add('drop-zone');
    zone.style.top = item.top;
    zone.style.left = item.left;
    zone.dataset.id = item.id;
    zone.textContent = '???';

    // Drag & Drop events
    zone.addEventListener('dragover', e => e.preventDefault());
    zone.addEventListener('dragenter', () => zone.classList.add('drag-over'));
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', handleDrop);

    // Klik functionaliteit (voor mobiel/touch)
    zone.addEventListener('click', () => handleZoneClick(zone));

    dropZonesContainer.appendChild(zone);
  });

  // Labels schudden (random volgorde)
  const shuffledItems = [...currentItems].sort(() => Math.random() - 0.5);

  shuffledItems.forEach(item => {
    const label = document.createElement('div');
    label.classList.add('draggable-label');
    label.draggable = true;
    label.dataset.id = item.id;
    label.textContent = item.name;

    label.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', item.id);
      highlightSelectedLabel(label);
    });

    label.addEventListener('click', () => {
      if (label.classList.contains('disabled')) return;
      highlightSelectedLabel(label);
    });

    labelsContainer.appendChild(label);
  });
}

// Selectie markeren (voor klikken)
function highlightSelectedLabel(label) {
  document.querySelectorAll('.draggable-label').forEach(l => l.classList.remove('selected'));
  selectedLabel = label;
  label.classList.add('selected');
}

// Drop afhandelen
function handleDrop(e) {
  e.preventDefault();
  const zone = e.currentTarget;
  zone.classList.remove('drag-over');
  const draggedId = e.dataTransfer.getData('text/plain');

  checkMatch(draggedId, zone);
}

// Klik afhandelen
function handleZoneClick(zone) {
  if (zone.classList.contains('filled')) return;
  if (!selectedLabel) {
    setFeedback('Selecteer eerst een organelnaam uit de rechterlijst!', 'wrong');
    return;
  }
  checkMatch(selectedLabel.dataset.id, zone);
}

// Controleer of de gekozen naam bij de zone hoort
function checkMatch(labelId, zone) {
  if (zone.classList.contains('filled')) return;

  const targetId = zone.dataset.id;
  const matchedItem = currentItems.find(i => i.id === labelId);

  if (labelId === targetId) {
    // Goed!
    zone.textContent = matchedItem.name;
    zone.classList.add('filled');
    
    // Schakel label uit
    const labelEl = Array.from(document.querySelectorAll('.draggable-label')).find(l => l.dataset.id === labelId && !l.classList.contains('disabled'));
    if (labelEl) {
      labelEl.classList.add('disabled');
      labelEl.classList.remove('selected');
      labelEl.draggable = false;
    }

    selectedLabel = null;
    score += 10;
    scoreDisplay.textContent = score;
    completedCount++;

    setFeedback(`Goed zo! Dat is inderdaad de ${matchedItem.name}.`, 'correct');
    updateProgress();

    if (completedCount === currentItems.length) {
      setFeedback('🎉 Super! Je hebt alle organellen in dit niveau correct aangewezen!', 'correct');
      nextBtn.disabled = false;
    }
  } else {
    // Fout!
    score = Math.max(0, score - 2);
    scoreDisplay.textContent = score;
    setFeedback('Helaas, dat is niet de juiste plek. Probeer het nog eens!', 'wrong');
  }
}

function setFeedback(msg, type) {
  feedbackMessage.textContent = msg;
  feedbackMessage.className = `feedback-message ${type}`;
}

function updateProgress() {
  const pct = (completedCount / currentItems.length) * 100;
  progressBar.style.width = `${pct}%`;
}

function startTimer() {
  timerInterval = setInterval(() => {
    timeRemaining--;
    const mins = Math.floor(timeRemaining / 60).toString().padStart(2, '0');
    const secs = (timeRemaining % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${mins}:${secs}`;

    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      showEndModal('De tijd is om!');
    }
  }, 1000);
}

function showEndModal(customTitle) {
  clearInterval(timerInterval);
  if (customTitle) {
    endModal.querySelector('h2').textContent = customTitle;
  }
  document.getElementById('final-stats').textContent = `Eindscore: ${score} punten!`;
  endModal.style.display = 'flex';
}

// Start het spel bij laden
window.addEventListener('DOMContentLoaded', initGame);
