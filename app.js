/* ==========================================================================
   CARBONERRA PLATFORM - ORIGINAL GREEN FOREST & SAGE INTERACTIVE LOGIC (app.js)
   ========================================================================== */

let forecastChartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  // 1. Intersection Observer for Scroll Reveals
  const revealElements = document.querySelectorAll('.reveal');
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.05
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, observerOptions);

  // Use revealObserver
  revealElements.forEach(el => {
    revealObserver.observe(el);
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      el.classList.add('active');
    }
  });

  // 2. Parallax Scroll Depth Listener for Hero Floating Eco Cards
  const floatingCards = document.querySelectorAll('.floating-eco-card');
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY < window.innerHeight * 1.5) {
      floatingCards.forEach(card => {
        const speed = parseFloat(card.getAttribute('data-speed') || '0.05');
        const translateY = scrollY * speed * 75;
        card.style.transform = `translate3d(0, ${translateY}px, 0)`;
      });
    }
  }, { passive: true });

  // 3. Initialize Simulator Physics & Chart
  updateSimulatorPhysics();
  initForecastChart();
});

/* Scroll Helper */
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

/* Carbon Lab Physics Simulator Engine */
function updateSimulatorPhysics() {
  const imgComp = parseInt(document.getElementById('sliderImgComp')?.value || '85');
  const jsDefer = parseInt(document.getElementById('sliderJsDefer')?.value || '60');
  const cacheTtl = parseInt(document.getElementById('sliderCacheTtl')?.value || '30');
  const greenHosting = document.getElementById('toggleGreenHosting')?.checked ?? true;

  // Display value labels
  if (document.getElementById('valImgComp')) document.getElementById('valImgComp').innerText = `${imgComp}%`;
  if (document.getElementById('valJsDefer')) document.getElementById('valJsDefer').innerText = `${jsDefer}%`;
  if (document.getElementById('valCacheTtl')) document.getElementById('valCacheTtl').innerText = `${cacheTtl} Days`;

  // Physics calculation model
  const baselineCo2 = 0.58; // g
  const baselinePayload = 3.4; // MB

  const imgFactor = 1 - (imgComp / 100) * 0.45;
  const jsFactor = 1 - (jsDefer / 100) * 0.20;
  const hostingFactor = greenHosting ? 0.70 : 1.0;
  const cacheFactor = 1 - Math.min(cacheTtl / 365, 0.15);

  const calculatedCo2 = (baselineCo2 * imgFactor * jsFactor * cacheFactor * hostingFactor);
  const calculatedPayload = (baselinePayload * imgFactor * jsFactor);

  const savingPct = Math.round(((baselineCo2 - calculatedCo2) / baselineCo2) * 100);
  const tonsSavedAnnual = ((baselineCo2 - calculatedCo2) * 100000 * 12 / 1000000).toFixed(2);

  // Update target DOM elements
  const targetCo2El = document.getElementById('targetCo2Val');
  const targetPayloadEl = document.getElementById('targetPayloadVal');
  const savingPctEl = document.getElementById('savingPctVal');
  const annualSavingEl = document.getElementById('annualSavingVal');

  if (targetCo2El) targetCo2El.innerText = `${calculatedCo2.toFixed(2)} g`;
  if (targetPayloadEl) targetPayloadEl.innerText = `${calculatedPayload.toFixed(1)} MB Payload`;
  if (savingPctEl) savingPctEl.innerText = `-${savingPct}%`;
  if (annualSavingEl) {
    annualSavingEl.innerHTML = `🌱 Saves <strong>${tonsSavedAnnual} Metric Tons CO2</strong> per year`;
  }
}

/* ML Predictive Chart Initialization */
function initForecastChart() {
  const ctx = document.getElementById('forecastChart')?.getContext('2d');
  if (!ctx) return;

  const labels = ['Q1 26', 'Q2 26', 'Q3 26', 'Q4 26', 'Q1 27', 'Q2 27', 'Q3 27', 'Q4 27'];

  forecastChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Expected Growth (+15%/mo)',
          data: [0.24, 0.35, 0.52, 0.81, 1.15, 1.60, 2.20, 3.00],
          borderColor: '#01472e',
          backgroundColor: 'rgba(1, 71, 46, 0.12)',
          borderWidth: 3,
          fill: true,
          tension: 0.3,
          pointBackgroundColor: '#01472e',
          pointRadius: 4
        },
        {
          label: 'Aggressive Growth (+30%/mo)',
          data: [0.24, 0.56, 1.18, 2.40, 4.20, 7.10, 11.5, 18.0],
          borderColor: '#dc2626',
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: [4, 4],
          fill: false,
          tension: 0.3,
          pointBackgroundColor: '#dc2626',
          pointRadius: 4
        },
        {
          label: 'Conservative Growth (+5%/mo)',
          data: [0.24, 0.28, 0.31, 0.34, 0.38, 0.41, 0.44, 0.48],
          borderColor: '#d97706',
          backgroundColor: 'transparent',
          borderWidth: 2,
          fill: false,
          tension: 0.3,
          pointBackgroundColor: '#d97706',
          pointRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { color: 'rgba(1, 71, 46, 0.1)' },
          ticks: { color: '#01472e', font: { family: 'Inter', size: 11, weight: '700' } }
        },
        y: {
          grid: { color: 'rgba(1, 71, 46, 0.1)' },
          ticks: { 
            color: '#01472e', 
            font: { family: 'JetBrains Mono', size: 11 },
            callback: (value) => value + ' g CO2'
          }
        }
      }
    }
  });
}

function updateChartTimeframe(tf) {
  if (!forecastChartInstance) return;

  if (tf === '1M') {
    forecastChartInstance.data.labels = ['W1', 'W2', 'W3', 'W4'];
    forecastChartInstance.data.datasets[0].data = [0.24, 0.25, 0.25, 0.26];
    forecastChartInstance.data.datasets[1].data = [0.24, 0.26, 0.28, 0.30];
    forecastChartInstance.data.datasets[2].data = [0.24, 0.24, 0.25, 0.25];
  } else if (tf === '6M') {
    forecastChartInstance.data.labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    forecastChartInstance.data.datasets[0].data = [0.24, 0.26, 0.28, 0.31, 0.35, 0.40];
    forecastChartInstance.data.datasets[1].data = [0.24, 0.29, 0.35, 0.44, 0.56, 0.72];
    forecastChartInstance.data.datasets[2].data = [0.24, 0.25, 0.26, 0.27, 0.28, 0.29];
  } else {
    forecastChartInstance.data.labels = ['Q1 26', 'Q2 26', 'Q3 26', 'Q4 26', 'Q1 27', 'Q2 27', 'Q3 27', 'Q4 27'];
    forecastChartInstance.data.datasets[0].data = [0.24, 0.35, 0.52, 0.81, 1.15, 1.60, 2.20, 3.00];
    forecastChartInstance.data.datasets[1].data = [0.24, 0.56, 1.18, 2.40, 4.20, 7.10, 11.5, 18.0];
    forecastChartInstance.data.datasets[2].data = [0.24, 0.28, 0.31, 0.34, 0.38, 0.41, 0.44, 0.48];
  }
  forecastChartInstance.update();
}

/* Action Handlers */
function runLiveAuditScanner() {
  const targetUrl = document.getElementById('targetUrlInput')?.value || 'main-website-v2.com';
  const scanBtnText = document.getElementById('scanBtnText');

  if (scanBtnText) scanBtnText.innerText = '⚡ SCANNING PAGE AST...';

  setTimeout(() => {
    if (scanBtnText) scanBtnText.innerText = '⚡ RUN CARBON AUDIT';
    alert(`⚡ Live Audit Complete for ${targetUrl}!\n\nEcoScore: A+ (0.24 g CO2e / view)\nTotal Transfer: 1.85 MB\nOptimized Assets: 38/42\nP0 Critical Recommendations: 1`);
  }, 1200);
}

function applyToCarbonBudget() {
  alert('✅ Simulated Target (0.19g CO2e) successfully applied to site carbon budget policy!');
}

function exportPRPatch() {
  alert('⚡ Pull Request Created!\n\nTitle: [CARBONERRA] Automated Carbon Optimization Patch (-67.2% CO2e)\nBranch: carbonerra/patch-avif-js-defer\nPR Link: https://github.com/org/main-website/pull/148');
}

function runAIGenerator() {
  alert('⚡ AI Code Patch Generated!\n\nSuccessfully generated AST transformation diff for Google Tag Manager deferral & AVIF image wrapper.');
}
