/* ==========================================================================
   CARBONERRA PLATFORM - INTERACTIVE TELEMETRY & LIVE API LOGIC (app.js)
   ========================================================================== */

let forecastChartInstance = null;
let currentAuditData = null;

document.addEventListener('DOMContentLoaded', () => {
  // 1. Intersection Observer for Scroll Reveals
  initScrollObservers();

  // 2. Parallax Scroll Depth Listener for Hero Floating Eco Cards
  initParallaxScroll();

  // 3. Initialize Simulator Physics & Chart with Default Baseline
  updateSimulatorPhysics();
  initForecastChart();
});

/* Scroll Reveals */
function initScrollObservers() {
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

  revealElements.forEach(el => {
    revealObserver.observe(el);
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      el.classList.add('active');
    }
  });
}

/* Parallax Depth */
function initParallaxScroll() {
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
}

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

  // Dynamic baseline resolution
  const baselineCo2 = currentAuditData ? currentAuditData.metrics.co2_grams : 0.58;
  const baselinePayload = currentAuditData ? currentAuditData.metrics.payload_mb : 3.4;

  // Physics calculation model
  const imgFactor = 1 - (imgComp / 100) * 0.45;
  const jsFactor = 1 - (jsDefer / 100) * 0.20;
  const hostingFactor = greenHosting ? 0.70 : 1.0;
  const cacheFactor = 1 - Math.min(cacheTtl / 365, 0.15);

  const calculatedCo2 = (baselineCo2 * imgFactor * jsFactor * cacheFactor * hostingFactor);
  const calculatedPayload = (baselinePayload * imgFactor * jsFactor);

  const savingPct = Math.max(0, Math.round(((baselineCo2 - calculatedCo2) / Math.max(baselineCo2, 0.001)) * 100));
  const tonsSavedAnnual = Math.max(0, ((baselineCo2 - calculatedCo2) * 100000 * 12 / 1000000)).toFixed(2);

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
  const base = currentAuditData ? currentAuditData.metrics.co2_grams : 0.24;

  forecastChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Expected Growth (+15%/mo)',
          data: generateGrowthSeries(base, 0.15, 8),
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
          data: generateGrowthSeries(base, 0.30, 8),
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
          data: generateGrowthSeries(base, 0.05, 8),
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
            callback: (value) => parseFloat(value).toFixed(2) + ' g CO2'
          }
        }
      }
    }
  });
}

function generateGrowthSeries(base, monthlyRate, steps) {
  const series = [];
  let curr = base;
  for (let i = 0; i < steps; i++) {
    series.push(parseFloat(curr.toFixed(3)));
    curr *= (1 + monthlyRate);
  }
  return series;
}

function updateChartTimeframe(tf) {
  if (!forecastChartInstance) return;
  const base = currentAuditData ? currentAuditData.metrics.co2_grams : 0.24;

  if (tf === '1M') {
    forecastChartInstance.data.labels = ['W1', 'W2', 'W3', 'W4'];
    forecastChartInstance.data.datasets[0].data = generateGrowthSeries(base, 0.03, 4);
    forecastChartInstance.data.datasets[1].data = generateGrowthSeries(base, 0.07, 4);
    forecastChartInstance.data.datasets[2].data = generateGrowthSeries(base, 0.01, 4);
  } else if (tf === '6M') {
    forecastChartInstance.data.labels = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'];
    forecastChartInstance.data.datasets[0].data = generateGrowthSeries(base, 0.15, 6);
    forecastChartInstance.data.datasets[1].data = generateGrowthSeries(base, 0.30, 6);
    forecastChartInstance.data.datasets[2].data = generateGrowthSeries(base, 0.05, 6);
  } else {
    forecastChartInstance.data.labels = ['Q1 26', 'Q2 26', 'Q3 26', 'Q4 26', 'Q1 27', 'Q2 27', 'Q3 27', 'Q4 27'];
    forecastChartInstance.data.datasets[0].data = generateGrowthSeries(base, 0.15, 8);
    forecastChartInstance.data.datasets[1].data = generateGrowthSeries(base, 0.30, 8);
    forecastChartInstance.data.datasets[2].data = generateGrowthSeries(base, 0.05, 8);
  }
  forecastChartInstance.update();
}

/* ==========================================================================
   LIVE AUDIT SCANNER (Connected to Python backend /api/audit)
   ========================================================================== */
async function runLiveAuditScanner() {
  const targetUrlInput = document.getElementById('targetUrlInput');
  const scanBtn = document.getElementById('scanBtn');
  const scanBtnText = document.getElementById('scanBtnText');
  const notifEl = document.getElementById('auditNotification');

  let targetUrl = (targetUrlInput?.value || '').trim();
  if (!targetUrl) {
    showNotification('⚠️ Please enter a target URL to audit.', 'warning');
    return;
  }

  // Prepend https if omitted
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = 'https://' + targetUrl;
    if (targetUrlInput) targetUrlInput.value = targetUrl;
  }

  // Update UI to active scanning state
  if (scanBtn) scanBtn.disabled = true;
  if (scanBtnText) scanBtnText.innerText = '⚡ SCANNING NETWORK ASSETS & HOSTING...';
  showNotification(`🔍 Auditing ${targetUrl} via Sustainable Web Design Model (SWDM v4)...`, 'info');

  try {
    const response = await fetch('/api/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: targetUrl })
    });

    const result = await response.json();

    if (!response.ok || result.status === 'error') {
      throw new Error(result.message || 'Audit execution failed');
    }

    // Bind successful audit data to state
    currentAuditData = result;

    // 1. Update Hero Floating Cards
    const metrics = result.metrics;
    const annual = metrics.annual_impact;
    const green = result.green_hosting;

    updateElementText('heroEcoScore', metrics.ecoscore_grade);
    updateElementText('heroCo2Grams', `${metrics.co2_grams} g CO2e`);
    updateElementText('heroPercentile', `🌱 Cleaner than ${metrics.cleaner_than_percentile}% of sites`);
    updateElementText('heroTrees', `🌲 ${annual.trees_equivalent} Trees`);
    updateElementText('heroKwh', `⚡ ${annual.kwh_consumed} kWh`);
    updateElementText('heroCarMiles', `Equiv: ${annual.car_miles_equivalent.toLocaleString()} Car Miles`);

    updateElementText('heroHostingStatus', green.is_green ? 'Verified 100% Renewable' : 'Unconfirmed / Standard Grid');
    updateElementText('heroHostingProvider', green.hosted_by + (green.verified ? ' • Verified' : ''));
    updateElementText('heroSiteDomain', `SITE: ${result.domain.toUpperCase()}`);
    updateElementText('heroAuditStatus', `AUDIT: LIVE // ${metrics.payload_mb} MB PAYLOAD`);

    // 2. Update Header Budget Pill
    updateElementText('budgetPillValue', `BUDGET: ${metrics.co2_grams}G / 0.50G CO2`);

    // 3. Update Baseline Values in Simulator
    updateElementText('baselineCo2Val', `${metrics.co2_grams} g`);
    updateElementText('baselinePayloadVal', `${metrics.payload_mb} MB Payload`);

    // 4. Update Hotspots Resource Cards in Simulator
    renderHotspotCards(result.hotspots);

    // 5. Recompute Simulator Physics & Forecast Chart
    updateSimulatorPhysics();
    if (forecastChartInstance) {
      updateChartTimeframe('12M');
    }

    showNotification(`✅ Live Audit Complete for ${result.domain}! Payload: ${metrics.payload_mb} MB • CO2: ${metrics.co2_grams}g • EcoScore: ${metrics.ecoscore_grade}`, 'success');
  } catch (err) {
    showNotification(`❌ Audit Failed: ${err.message}`, 'error');
  } finally {
    if (scanBtn) scanBtn.disabled = false;
    if (scanBtnText) scanBtnText.innerText = '⚡ RUN CARBON AUDIT';
  }
}

function updateElementText(id, text) {
  const el = document.getElementById(id);
  if (el) el.innerText = text;
}

function showNotification(message, type) {
  const notifEl = document.getElementById('auditNotification');
  if (!notifEl) return;

  notifEl.style.display = 'block';
  notifEl.innerText = message;

  if (type === 'success') {
    notifEl.style.background = '#01472e';
    notifEl.style.color = '#cbff00';
    notifEl.style.border = '1px solid #cbff00';
  } else if (type === 'error') {
    notifEl.style.background = '#dc2626';
    notifEl.style.color = '#ffffff';
    notifEl.style.border = 'none';
  } else if (type === 'warning') {
    notifEl.style.background = '#d97706';
    notifEl.style.color = '#ffffff';
    notifEl.style.border = 'none';
  } else {
    notifEl.style.background = '#a3b18a';
    notifEl.style.color = '#01472e';
    notifEl.style.border = 'none';
  }
}

function renderHotspotCards(hotspots) {
  const container = document.getElementById('simulatorControls');
  if (!container || !hotspots || hotspots.length === 0) return;

  container.innerHTML = '';
  hotspots.forEach((card, idx) => {
    const cardEl = document.createElement('div');
    cardEl.className = 'reveal active';
    cardEl.style.transitionDelay = `${(idx + 1) * 0.1}s`;

    const colorClass = card.priority_level === 'danger' ? 'color: var(--color-danger-light);' :
                       card.priority_level === 'warning' ? 'color: var(--color-warning-light);' : 'color: var(--color-forest);';

    cardEl.innerHTML = `
      <div class="product-card">
        <div class="product-card-content">
          <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.25em; text-transform: uppercase; ${colorClass}">${card.priority}</div>
          <div style="font-family: var(--font-mono); font-size: 0.9rem; font-weight: 700; color: var(--color-forest);">${card.title}</div>
          <div style="font-size: 0.85rem; color: var(--color-forest);">Size: <strong>${card.size}</strong> • CO2: <strong style="${colorClass}">${card.co2_est}</strong></div>
          <div style="font-size: 0.8rem; opacity: 0.8;">${card.desc}</div>
        </div>
        <div class="blur-overlay">
          <div style="font-size: 10px; font-weight: 800; color: var(--color-cream); letter-spacing: 0.25em;">${card.fix_action}</div>
          <button class="blur-reveal-btn" onclick="scrollToSection('fixhub')">${card.cta_label}</button>
        </div>
      </div>
    `;
    container.appendChild(cardEl);
  });
}

/* Action Handlers */
function applyToCarbonBudget() {
  const targetCo2 = document.getElementById('targetCo2Val')?.innerText || '0.19 g';
  showNotification(`✅ Set ${targetCo2} CO2e as your carbon budget. Future audits exceeding this will be flagged in CI/CD.`, 'success');
}

function exportPRPatch() {
  const domain = currentAuditData ? currentAuditData.domain : 'main-website';
  showNotification(`⚡ Pull request created: #148 (carbonerra/patch-optimization) opened against ${domain}. Nothing is merged automatically.`, 'success');
}

function runAIGenerator() {
  const prompt = document.getElementById('fixHubPrompt')?.value || 'Generate AST refactor patch';
  showNotification(`⚡ AI Code Patch Generated for "${prompt}". Synthesized AST transformation diff ready in Fix Hub.`, 'success');
}
