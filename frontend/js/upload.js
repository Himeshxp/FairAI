// FairAI - upload.js
// Handles CSV upload and forwards file object

(function () {
  'use strict';

  const uploadZone = document.getElementById('uploadZone');
  const csvInput = document.getElementById('csvInput');

  if (!uploadZone || !csvInput) return;

  function handleFile(file) {
    if (!file || !file.name.toLowerCase().endsWith('.csv')) {
      alert('Please upload a valid .csv file.');
      return;
    }

    if (typeof window.onCSVFileSelected === 'function') {
      window.onCSVFileSelected(file);
    }
  }

  csvInput.addEventListener('change', function () {
    if (this.files[0]) handleFile(this.files[0]);
  });

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
