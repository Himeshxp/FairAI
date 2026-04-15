// ===== FairAI – result.js =====
// Displays analysis results dynamically

(function () {
  'use strict';

  const raw = sessionStorage.getItem('fairai_data');
  if (!raw) {
    window.location.href = 'dashboard.html';
    return;
  }

  const data = JSON.parse(raw);

  // Compute analysis locally (mirrors main.js fairaiAPI.analyze)
  const males = data.filter(d => d.gender.toLowerCase() === 'male');
  const females = data.filter(d => d.gender.toLowerCase() === 'female');
  const maleApproved = males.filter(d => d.decision.toLowerCase() === 'approved').length;
  const femaleApproved = females.filter(d => d.decision.toLowerCase() === 'approved').length;
  const maleRate = males.length > 0 ? maleApproved / males.length : 0;
  const femaleRate = females.length > 0 ? femaleApproved / females.length : 0;
  const disparity = Math.abs(maleRate - femaleRate);
  const biasScore = Math.round(disparity * 100);

  const maleRatePct = Math.round(maleRate * 100);
  const femaleRatePct = Math.round(femaleRate * 100);

  const level = biasScore < 10 ? 'low' : biasScore < 40 ? 'moderate' : 'high';
  const levelLabel = level === 'low' ? 'Low Risk' : level === 'moderate' ? 'Moderate Risk' : 'High Risk';
  const levelIcon = level === 'low' ? '✓' : '⚠';

  const favored = maleRate > femaleRate ? 'male' : 'female';
  let explanation;
  if (biasScore < 10) {
    explanation = 'The analysis shows minimal demographic disparity. Approval rates are relatively balanced across genders, indicating fair decision-making processes.';
  } else if (biasScore < 40) {
    explanation = 'A moderate disparity was detected. ' + (favored === 'male' ? 'Male' : 'Female') + ' candidates are approved at a higher rate (' + Math.round(Math.max(maleRate, femaleRate) * 100) + '%) compared to ' + (favored === 'male' ? 'female' : 'male') + ' candidates (' + Math.round(Math.min(maleRate, femaleRate) * 100) + '%). This warrants further investigation.';
  } else {
    explanation = 'Significant bias detected. ' + (favored === 'male' ? 'Male' : 'Female') + ' candidates are disproportionately favored with a ' + biasScore + '% disparity in approval rates. Immediate review of the decision pipeline is strongly recommended.';
  }

  const suggestions = [
    'Audit the scoring algorithm for demographic proxies',
    'Implement blind review processes where feasible',
    'Introduce fairness constraints in the decision model',
    'Regularly monitor selection rates across all demographics',
    'Consider retraining the model with balanced datasets'
  ];

  // Render
  const scoreValue = document.getElementById('scoreValue');
  const scoreBadge = document.getElementById('scoreBadge');

  scoreValue.textContent = biasScore + '%';
  scoreValue.className = 'score-value ' + level;

  scoreBadge.textContent = levelIcon + ' ' + levelLabel;
  scoreBadge.className = 'score-badge ' + level;

  document.getElementById('maleRate').textContent = maleRatePct + '%';
  document.getElementById('femaleRate').textContent = femaleRatePct + '%';
  document.getElementById('maleCount').textContent = males.length + ' total';
  document.getElementById('femaleCount').textContent = females.length + ' total';

  // Animate bars after a small delay
  setTimeout(() => {
    document.getElementById('maleBar').style.width = maleRatePct + '%';
    document.getElementById('femaleBar').style.width = femaleRatePct + '%';
  }, 200);

  document.getElementById('explanation').textContent = explanation;

  const sugList = document.getElementById('suggestions');
  sugList.innerHTML = suggestions.map(s => '<li>' + s + '</li>').join('');
})();
