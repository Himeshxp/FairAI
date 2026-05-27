// FairAI - result.js

(function () {
  'use strict';

  const raw = sessionStorage.getItem('fairai_result');
  if (!raw) {
    window.location.href = 'dashboard.html';
    return;
  }

  const result = JSON.parse(raw);
  const biasScore = Number(result.biasScore || 0);
  const confidence = Number(result.confidence || 0);
  const verdict = String(result.verdict || 'Unknown');
  const summary = String(result.summary || 'No summary provided.');
  const findings = Array.isArray(result.findings) ? result.findings : [];
  const recommendations = Array.isArray(result.recommendations) ? result.recommendations : [];

  const level = biasScore < 30 ? 'low' : (biasScore < 65 ? 'moderate' : 'high');
  const levelLabel = level === 'low' ? 'Low Risk' : (level === 'moderate' ? 'Moderate Risk' : 'High Risk');

  const scoreValue = document.getElementById('scoreValue');
  const scoreBadge = document.getElementById('scoreBadge');
  scoreValue.textContent = biasScore + '%';
  scoreValue.className = 'score-value ' + level;
  scoreBadge.textContent = levelLabel;
  scoreBadge.className = 'score-badge ' + level;

  document.getElementById('maleRate').textContent = verdict;
  document.getElementById('femaleRate').textContent = confidence + '%';
  document.getElementById('explanation').textContent = summary;

  setTimeout(() => {
    document.getElementById('maleBar').style.width = biasScore + '%';
    document.getElementById('femaleBar').style.width = confidence + '%';
  }, 200);

  const findingsList = document.getElementById('findings');
  findingsList.innerHTML = (findings.length ? findings : ['No detailed findings returned.'])
    .map((x) => '<li>' + x + '</li>')
    .join('');

  const sugList = document.getElementById('suggestions');
  sugList.innerHTML = (recommendations.length ? recommendations : ['Review data quality and rerun analysis.'])
    .map((x) => '<li>' + x + '</li>')
    .join('');
})();
