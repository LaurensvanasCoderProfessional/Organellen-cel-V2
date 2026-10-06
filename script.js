// Organellen data met nauwkeurige coördinaten voor de target-stippen
const levelsData = [
  // Niveau 1: Basis organellen van een plantencel
  [
    { id: 'celwand', name: 'Celwand', top: '3.5%', left: '45%' },
    { id: 'celmembraan', name: 'Celmembraan', top: '7.5%', left: '45%' },
    { id: 'cytoplasma', name: 'Cytoplasma', top: '78%', left: '22%' },
    { id: 'vacuole', name: 'Vacuole', top: '50%', left: '62%' },
    { id: 'celkern', name: 'Celkern', top: '48%', left: '28%' },
    { id: 'chloroplast', name: 'Bladgroenkorrel', top: '18%', left: '68%' }
  ],
  // Niveau 2: Medium complexiteit (ER en Ribosoom zijn hier haarscherp gescheiden)
  [
    { id: 'er', name: 'Endoplasmatisch Reticulum', top: '46%', left: '11%' }, // Wijst naar de oranje membraanbanen
    { id: 'ribosoom', name: 'Ribosoom', top: '39%', left: '36%' },            // Wijst direct naar een rood bolletje
    { id: 'mitochondrion', name: 'Mitochondrion', top: '65%', left: '74%' },
    { id: 'golgi', name: 'Golgi-systeem', top: '82%', left: '72%' },
    { id: 'chloroplast', name: 'Bladgroenkorrel', top: '18%', left: '68%' },
    { id: 'vacuole', name: 'Vacuole', top: '50%', left: '62%' }
  ],
  // Niveau 3: Alle specifieke plantenorganellen
  [
    { id: 'nucleolus', name: 'Nucleolus', top: '43%', left: '23%' },
    { id: 'peroxisoom', name: 'Peroxisoom', top: '18%', left: '38%' },
    { id: 'amyloplast', name: 'Amyloplast', top: '79%', left: '15%' },
    { id: 'celwand', name: 'Celwand', top: '3.5%', left: '45%' },
    { id: 'golgi', name: 'Golgi-systeem', top: '82%', left: '72%' },
    { id: 'mitochondrion', name: 'Mitochondrion', top: '65%', left: '74%' }
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

  setFeedback('Kies een organelnaam en plaats deze op het juiste rondje!', '');

  // Dropzones aanmaken als kleine cirkels
  currentItems.forEach(item => {
    const zone = document.createElement('div');
    zone.classList.add('drop-zone');
    zone.style.top = item.top;
    zone.style.left = item.left;
    zone.dataset.id = item.id;
    zone.textContent = '?';

    // Drag & Drop events
    zone.addEventListener('dragover', e => e.preventDefault());
    zone.addEventListener('dragenter', () => zone.classList.add('drag-over'));
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', handleDrop);

    // Klik functionaliteit (voor touch/mobiel)
    zone.addEventListener('click', () => handleZoneClick(zone));

    dropZonesContainer.appendChild(zone);
  });

  // Labels schudden
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

function highlightSelectedLabel(label) {
  document.querySelectorAll('.draggable-label').forEach(l => l.classList.remove('selected'));
  selectedLabel = label;
  label.classList.add('selected');
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
  if (!selectedLabel) {
    setFeedback('Selecteer eerst een organelnaam uit de lijst rechts!', 'wrong');
    return;
  }
  checkMatch(selectedLabel.dataset.id, zone);
}

function checkMatch(labelId, zone) {
  if (zone.classList.contains('filled')) return;

  const targetId = zone.dataset.id;
  const matchedItem = currentItems.find(i => i.id === labelId);

  if (labelId === targetId) {
    // Goed antwoord!
    zone.textContent = '✓ ' + matchedItem.name;
    zone.classList.add('filled');

    // Deactiveer het label in het overzicht
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

    setFeedback(`Uitstekend! Dat is inderdaad de ${matchedItem.name}.`, 'correct');
    updateProgress();

    if (completedCount === currentItems.length) {
      setFeedback('🎉 Super! Je hebt alle organellen in dit niveau geplaatst!', 'correct');
      nextBtn.disabled = false;
    }
  } else {
    // Fout antwoord
    score = Math.max(0, score - 2);
    scoreDisplay.textContent = score;
    setFeedback('Dat is niet het juiste rondje voor dit organel. Probeer het opnieuw!', 'wrong');
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

window.addEventListener('DOMContentLoaded', initGame);
