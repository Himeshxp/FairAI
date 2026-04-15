// ===== FairAI – upload.js =====
// Handles CSV file parsing and drag-and-drop

(function () {
  'use strict';

  const uploadZone = document.getElementById('uploadZone');
  const csvInput = document.getElementById('csvInput');

  if (!uploadZone || !csvInput) return;

  // Parse CSV text into array of { gender, score, decision }
  function parseCSV(text) {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    const gi = headers.indexOf('gender');
    const si = headers.indexOf('score');
    const di = headers.indexOf('decision');

    if (gi === -1 || si === -1 || di === -1) {
      alert('CSV must have "gender", "score", and "decision" columns.');
      return [];
    }

    const results = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim());
      if (cols.length < 3) continue;
      results.push({
        gender: cols[gi],
        score: Number(cols[si]),
        decision: cols[di]
      });
    }
    return results;
  }

  function handleFile(file) {
    if (!file || !file.name.endsWith('.csv')) {
      alert('Please upload a .csv file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
      const data = parseCSV(e.target.result);
      if (data.length > 0 && typeof window.onCSVParsed === 'function') {
        window.onCSVParsed(data);
      }
    };
    reader.readAsText(file);
  }

  // File input change
  csvInput.addEventListener('change', function () {
    if (this.files[0]) handleFile(this.files[0]);
  });

  // Drag & drop
  uploadZone.addEventListener('dragover', function (e) {
    e.preventDefault();
    this.classList.add('drag-over');
  });

  uploadZone.addEventListener('dragleave', function () {
    this.classList.remove('drag-over');
  });

  uploadZone.addEventListener('drop', function (e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  });
})();
