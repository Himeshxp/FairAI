// FairAI - main.js

(function () {
  'use strict';

  const element = document.getElementById('main-name');
  if (element) {
    const text = element.textContent.trim();
    element.textContent = '';

    text.split('').forEach((char, index) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.animationDelay = index * 0.2 + 's';
      element.appendChild(span);
    });
  }

  const grid = document.querySelector('.features-grid');
  if (grid) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
        } else {
          entry.target.classList.remove('show');
        }
      });
    }, { threshold: 0.4 });

    observer.observe(grid);
  }

  const API_BASE_URL = window.FAIRAI_API_BASE_URL || 'http://localhost:8080';

  async function parseError(response) {
    try {
      const json = await response.json();
      return json.error || `Server error (${response.status})`;
    } catch (_) {
      return `Server error (${response.status})`;
    }
  }

  window.fairaiAPI = {
    async analyzeCsvFile(file) {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/api/analyze-csv-ai`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(await parseError(response));
      }

      return response.json();
    }
  };
})();
