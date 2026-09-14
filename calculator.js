// The calculation works locally; Firebase loads only after a consented save.
async function saveConsentedEstimate(estimate) {
  const { saveConsentedEstimate: save } = await import('./firebase-client.js');
  return save(estimate);
}

// Category-specific depreciation and messaging. Monthly decay rates are rough
// but directionally realistic: phones and smartwatches lose value fastest,
// laptops and consoles hold value longer, batteries barely "depreciate" in
// relative terms since their base value is already small.
const CATEGORY_META = {
  smartphone: { label: 'Smartphone', decay: 0.018, material: 'meaningful material-recovery potential' },
  laptop: { label: 'Laptop', decay: 0.010, material: 'higher material-recovery potential' },
  tablet: { label: 'Tablet', decay: 0.014, material: 'meaningful material-recovery potential' },
  smartwatch: { label: 'Smartwatch', decay: 0.020, material: 'meaningful material-recovery potential' },
  console: { label: 'Console', decay: 0.008, material: 'higher material-recovery potential' },
  desktop: { label: 'Desktop', decay: 0.009, material: 'higher material-recovery potential' },
  battery: { label: 'Battery / power', decay: 0.012, material: 'important hazardous-material recovery, even at low resale value' },
  gadget: { label: 'Other gadget', decay: 0.015, material: 'meaningful material-recovery potential' },
};

const conditionFactor = { minor: 0.75, moderate: 0.52, severe: 0.3, nonworking: 0.16 };

const form = document.querySelector('#estimate-form');
const message = document.querySelector('#form-message');
const result = document.querySelector('#result');
const valueEl = document.querySelector('#value-result');
const repairEl = document.querySelector('#repair-result');
const impactEl = document.querySelector('#impact-result');
const detailEl = document.querySelector('#impact-detail');
const titleEl = document.querySelector('#result-title');
const summaryEl = document.querySelector('#result-summary');

// ---- Device search combobox ----
const searchInput = document.querySelector('#deviceSearch');
const hiddenId = document.querySelector('#deviceId');
const optionsList = document.querySelector('#device-options');
let selectedDevice = null;
let currentMatches = [];
let activeIndex = -1;

function filterDevices(query) {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];
  return DEVICE_DATABASE
    .filter((device) => {
      const name = device.name.toLowerCase();
      return tokens.every((token) => name.includes(token));
    })
    .slice(0, 8);
}

function renderOptions() {
  optionsList.innerHTML = '';
  currentMatches.forEach((device, index) => {
    const li = document.createElement('li');
    li.setAttribute('role', 'option');
    li.id = `device-option-${index}`;
    li.className = 'device-option' + (index === activeIndex ? ' is-active' : '');
    li.setAttribute('aria-selected', index === activeIndex ? 'true' : 'false');
    const name = document.createElement('span');
    name.className = 'device-name';
    name.textContent = device.name;
    const tag = document.createElement('span');
    tag.className = 'device-tag';
    tag.textContent = CATEGORY_META[device.category].label;
    li.append(name, tag);
    li.addEventListener('mousedown', (event) => {
      event.preventDefault();
      selectDevice(device);
    });
    optionsList.appendChild(li);
  });
  const hasMatches = currentMatches.length > 0;
  optionsList.hidden = !hasMatches;
  searchInput.setAttribute('aria-expanded', hasMatches ? 'true' : 'false');
  searchInput.setAttribute('aria-activedescendant', activeIndex >= 0 ? `device-option-${activeIndex}` : '');
}

function selectDevice(device) {
  selectedDevice = device;
  searchInput.value = device.name;
  hiddenId.value = device.id;
  currentMatches = [];
  activeIndex = -1;
  renderOptions();
  message.textContent = '';
}

searchInput.addEventListener('input', () => {
  selectedDevice = null;
  hiddenId.value = '';
  activeIndex = -1;
  currentMatches = filterDevices(searchInput.value);
  renderOptions();
});

searchInput.addEventListener('keydown', (event) => {
  if (optionsList.hidden || currentMatches.length === 0) return;
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    activeIndex = Math.min(activeIndex + 1, currentMatches.length - 1);
    renderOptions();
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    activeIndex = Math.max(activeIndex - 1, 0);
    renderOptions();
  } else if (event.key === 'Enter') {
    if (activeIndex >= 0) {
      event.preventDefault();
      selectDevice(currentMatches[activeIndex]);
    }
  } else if (event.key === 'Escape') {
    optionsList.hidden = true;
  }
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.device-combobox')) optionsList.hidden = true;
});

// ---- Estimate calculation ----
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  message.textContent = '';

  if (!selectedDevice) {
    message.textContent = 'Please search for your device and choose it from the list.';
    searchInput.focus();
    return;
  }

  if (!form.checkValidity()) { form.reportValidity(); return; }

  const data = Object.fromEntries(new FormData(form));
  const usageMonths = Number(data.usageMonths);
  const meta = CATEGORY_META[selectedDevice.category];
  const ageFactor = Math.max(0.15, 1 - usageMonths * meta.decay);
  const estimate = Math.max(100, Math.round(
    (selectedDevice.value * conditionFactor[data.damageLevel] * ageFactor) / 100
  ) * 100);
  const repairPercent = data.damageLevel === 'minor' ? 70
    : data.damageLevel === 'moderate' ? 50
    : data.damageLevel === 'severe' ? 30 : 15;

  valueEl.textContent = `₹${estimate.toLocaleString('en-IN')}`;
  repairEl.textContent = `${repairPercent}% potential`;
  impactEl.textContent = meta.material;
  detailEl.textContent = 'Responsible reuse or recycling keeps useful materials in circulation.';
  titleEl.textContent = `A practical next step for your ${selectedDevice.name}`;
  summaryEl.textContent = `Based on the details provided, this is an indicative recovery estimate for a ${selectedDevice.name.toLowerCase()} only. A partner must inspect the device before confirming any value.`;
  result.hidden = false;
  result.focus();

  const payload = {
    deviceId: selectedDevice.id,
    deviceName: selectedDevice.name,
    category: selectedDevice.category,
    damageLevel: data.damageLevel,
    usageMonths,
    damageDescription: data.damageDescription.trim().slice(0, 500),
  };
  try {
    const response = await saveConsentedEstimate(payload);
    message.textContent = response.saved
      ? 'Your consented estimate has been saved securely.'
      : 'Your estimate is shown. Connect Firebase to save consented requests.';
  } catch {
    message.textContent = 'Your estimate is shown, but it could not be saved. Please try again later.';
  }
});

document.querySelector('#reset-estimate').addEventListener('click', () => {
  form.reset();
  selectedDevice = null;
  hiddenId.value = '';
  currentMatches = [];
  optionsList.hidden = true;
  result.hidden = true;
  searchInput.focus();
});
