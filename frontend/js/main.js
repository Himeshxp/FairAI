// ===== FairAI – main.js =====
// Handles navbar scroll effect and shared utilities

(function () {
  'use strict';

  // Sticky navbar background on scroll
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  // Simple Type Animation
  const element = document.getElementById("main-name");

  if (!element) {
    console.error("main-name not found");
    return;
  }

  const text = element.textContent.trim();

  element.textContent = "";

  text.split("").forEach((char, index) => {
    const span = document.createElement("span");

    span.textContent = char === " " ? "\u00A0" : char;
    span.style.animationDelay = (index * 0.2) + "s";

    element.appendChild(span);
  });

  // Placeholder API helper (returns dummy JSON)
  window.fairaiAPI = {
    analyze: function (data) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const males = data.filter(d => d.gender.toLowerCase() === 'male');
          const females = data.filter(d => d.gender.toLowerCase() === 'female');
          const maleApproved = males.filter(d => d.decision.toLowerCase() === 'approved').length;
          const femaleApproved = females.filter(d => d.decision.toLowerCase() === 'approved').length;
          const maleRate = males.length > 0 ? maleApproved / males.length : 0;
          const femaleRate = females.length > 0 ? femaleApproved / females.length : 0;
          const disparity = Math.abs(maleRate - femaleRate);
          const biasScore = Math.round(disparity * 100);

          const favored = maleRate > femaleRate ? 'male' : 'female';
          let explanation;
          if (biasScore < 10) {
            explanation = 'The analysis shows minimal demographic disparity. Approval rates are relatively balanced across genders, indicating fair decision-making processes.';
          } else if (biasScore < 40) {
            explanation = 'A moderate disparity was detected. ' + (favored === 'male' ? 'Male' : 'Female') + ' candidates are approved at a higher rate (' + Math.round(Math.max(maleRate, femaleRate) * 100) + '%) compared to ' + (favored === 'male' ? 'female' : 'male') + ' candidates (' + Math.round(Math.min(maleRate, femaleRate) * 100) + '%). This warrants further investigation.';
          } else {
            explanation = 'Significant bias detected. ' + (favored === 'male' ? 'Male' : 'Female') + ' candidates are disproportionately favored with a ' + biasScore + '% disparity in approval rates. Immediate review of the decision pipeline is strongly recommended.';
          }

          resolve({
            biasScore: biasScore,
            maleRate: Math.round(maleRate * 100),
            femaleRate: Math.round(femaleRate * 100),
            totalMale: males.length,
            totalFemale: females.length,
            explanation: explanation,
            suggestions: [
              'Audit the scoring algorithm for demographic proxies',
              'Implement blind review processes where feasible',
              'Introduce fairness constraints in the decision model',
              'Regularly monitor selection rates across all demographics',
              'Consider retraining the model with balanced datasets'
            ]
          });
        }, 300);
      });
    }
  };
})();
