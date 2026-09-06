/**
 * ESP32 Smart Farm Dashboard Logic
 * Role: API Polling, Hardware Interfacing, Trend Analysis, Dynamic Localization
 */

// --- 1. Configuration & Constants ---
const ESP32_BASE_URL = "http://192.168.4.1/api";
const POLL_INTERVAL_MS = 2500;
const SOIL_DRY_THRESHOLD = 30.0; // Matches Arduino logic
const SOIL_WET_THRESHOLD = 60.0; // Matches Arduino logic

let historyData = []; // Stores recent soil readings to calculate trends
let currentLang = "en";
let isOffline = false;
let autoModeActive = true;
let pumpIsOn = false;
let hasData = false; // Prevents UI glitches before the first successful fetch

// --- 2. Localization Dictionary ---
const translations = {
    // Static HTML Elements
    "t-app-title": { en: "AgriSense Farm", hi: "एग्रीसेंस खेत", mr: "अॅग्रीसेन्स शेत", gu: "એગ્રીસેન્સ ફાર્મ", bn: "এগ্রিসেন্স খামার", ta: "அக்ரிசென்ஸ் பண்ணை", te: "అగ్రిసెన్స్ ఫార్మ్", kn: "ಅಗ್ರಿಸೆನ್ಸ್ ಫಾರ್ಮ್" },
    "t-reconnecting": { en: "Reconnecting to Farm Node...", hi: "फार्म नोड से फिर जुड़ रहा है...", mr: "फार्म नोडशी पुन्हा जोडत आहे...", gu: "ફાર્મ નોડ સાથે ફરી જોડાઈ રહ્યું છે...", bn: "খামার নোডের সাথে পুনরায় সংযোগ করা হচ্ছে...", ta: "பண்ணை முனையுடன் மீண்டும் இணைக்கிறது...", te: "ఫార్మ్ నోడ్‌కు మళ్లీ కనెక్ట్ అవుతోంది...", kn: "ಫಾರ್ಮ್ ನೋಡ್‌ಗೆ ಮರುಸಂಪರ್ಕಿಸಲಾಗುತ್ತಿದೆ..." },
    "t-offline-desc": { en: "Please ensure you are connected to the AgriSense_Node WiFi hotspot.", hi: "कृपया सुनिश्चित करें कि आप वाईफाई हॉटस्पॉट से जुड़े हैं।", mr: "कृपया खात्री करा की तुम्ही वायफाय हॉटस्पॉटशी जोडलेले आहात.", gu: "કૃપા કરીને ખાતરી કરો કે તમે વાઇફાઇ હોટસ્પોટ સાથે જોડાયેલા છો.", bn: "অনুগ্রহ করে নিশ্চিত করুন যে আপনি ওয়াইফাই হটস্পটের সাথে সংযুক্ত আছেন।", ta: "வைஃபை ஹாட்ஸ்பாட்டுடன் இணைக்கப்பட்டுள்ளீர்களா என்பதை உறுதிப்படுத்தவும்.", te: "దయచేసి మీరు వైఫై హాట్‌స్పాట్‌కు కనెక్ట్ అయ్యారని నిర్ధారించుకోండి.", kn: "ನೀವು ವೈಫೈ ಹಾಟ್‌ಸ್ಪಾಟ್‌ಗೆ ಸಂಪರ್ಕ ಹೊಂದಿದ್ದೀರಾ ಎಂದು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ." },
    "t-soil-label": { en: "Moisture:", hi: "नमी:", mr: "आर्द्रता:", gu: "ભેજ:", bn: "আর্দ্রতা:", ta: "ஈரப்பதம்:", te: "తేమ:", kn: "ತೇವಾಂಶ:" },
    "t-forecast-title": { en: "Farm Insights", hi: "खेत की जानकारी", mr: "शेतीची माहिती", gu: "ફાર્મની માહિતી", bn: "খামারের অন্তর্দৃষ্টি", ta: "பண்ணை நுண்ணறிவு", te: "ఫార్మ్ ఇన్‌సైట్స్", kn: "ಕೃಷಿ ಒಳನೋಟಗಳು" },
    "t-controls-title": { en: "Irrigation Controls", hi: "सिंचाई नियंत्रण", mr: "सिंचन नियंत्रणे", gu: "સિંચાઈ નિયંત્રણો", bn: "সেচ নিয়ন্ত্রণ", ta: "நீர்ப்பாசன கட்டுப்பாடுகள்", te: "నీటిపారుదల నియంత్రణలు", kn: "ನೀರಾವರಿ ನಿಯಂತ್ರಣಗಳು" },
    "t-auto-mode": { en: "Automatic Irrigation", hi: "स्वचालित सिंचाई", mr: "स्वयंचलित सिंचन", gu: "સ્વચાલિત સિંચાઈ", bn: "স্বয়ংক্রিয় সেচ", ta: "தானியங்கி நீர்ப்பாசனம்", te: "ఆటోమేటిక్ నీటిపారుదల", kn: "ಸ್ವಯಂಚಾಲಿತ ನೀರಾವರಿ" },
    "t-manual-pump": { en: "Manual Pump Control", hi: "मैनुअल पंप नियंत्रण", mr: "मॅन्युअल पंप नियंत्रण", gu: "મેન્યુઅલ પંપ નિયંત્રણ", bn: "ম্যানুয়াল পাম্প নিয়ন্ত্রণ", ta: "கைமுறை பம்ப் கட்டுப்பாடு", te: "మాన్యువల్ పంప్ కంట్రోల్", kn: "ಹಸ್ತಚಾಲಿತ ಪಂಪ್ ನಿಯಂತ್ರಣ" },
    "t-humidity": { en: "Humidity", hi: "नमी (हवा)", mr: "हवेतील आर्द्रता", gu: "ભેજ (હવા)", bn: "আর্দ্রতা (বায়ু)", ta: "காற்றில் ஈரப்பதம்", te: "గాలిలో తేమ", kn: "ಗಾಳಿಯಲ್ಲಿ ತೇವಾಂಶ" },
    "t-temp": { en: "Temperature", hi: "तापमान", mr: "तापमान", gu: "તાપમાન", bn: "তাপমাত্রা", ta: "வெப்பநிலை", te: "ఉష్ణోగ్రత", kn: "ತಾಪಮಾನ" },
    "t-vpd": { en: "Water Demand (VPD)", hi: "पौधे की पानी की मांग", mr: "पाण्याची मागणी", gu: "પાણીની માંગ", bn: "জলের চাহিদা", ta: "நீர் தேவை", te: "నీటి డిమాండ్", kn: "ನೀರಿನ ಬೇಡಿಕೆ" },
    "t-uptime": { en: "Uptime", hi: "अपटाइम", mr: "अपटाइम", gu: "અપટાઇમ", bn: "আপটাইম", ta: "இயங்கும் நேரம்", te: "అప్‌టైమ్", kn: "ಅಪ್‌ಟೈಮ್" },
    "t-history-title": { en: "Moisture Trend", hi: "नमी की प्रवृत्ति", mr: "आर्द्रता कल", gu: "ભેજનું વલણ", bn: "আর্দ্রতার প্রবণতা", ta: "ஈரப்பதம் போக்கு", te: "తేమ ధోరణి", kn: "ತೇವಾಂಶದ ಪ್ರವೃತ್ತಿ" },
    
    // Dynamic Status Logic
    "status_gathering": { en: "Gathering Data...", hi: "डेटा प्राप्त कर रहा है...", mr: "डेटा गोळा करत आहे...", gu: "ડેટા એકત્રિત કરી રહ્યું છે...", bn: "ডেটা সংগ্রহ করা হচ্ছে...", ta: "தரவை சேகரிக்கிறது...", te: "డేటాను సేకరిస్తోంది...", kn: "ಡೇಟಾವನ್ನು ಸಂಗ್ರಹಿಸಲಾಗುತ್ತಿದೆ..." },
    "status_perfect": { en: "Perfectly Watered", hi: "पर्याप्त पानी", mr: "उत्तम पाणी दिले", gu: "સંપૂર્ણપણે પાણીયુક્ત", bn: "পর্যাপ্ত জল", ta: "நன்கு நீர் பாய்ச்சப்பட்டது", te: "సంపూర్ణంగా నీరు పెట్టబడింది", kn: "ಪರಿಪೂರ್ಣವಾಗಿ ನೀರುಹಾಕಲಾಗಿದೆ" },
    "status_dry": { en: "Critically Dry", hi: "अत्यधिक सूखा", mr: "अत्यंत कोरडे", gu: "ખૂબ જ સૂકું", bn: "মারাত্মক শুকনো", ta: "மிகவும் வறண்டது", te: "తీవ్రంగా ఎండినది", kn: "ಅತ್ಯಂತ ಶುಷ್ಕ" },
    "status_watering": { en: "Irrigating Now", hi: "सिंचाई हो रही है", mr: "सिंचन चालू आहे", gu: "સિંચાઈ ચાલુ છે", bn: "সেচ চলছে", ta: "நீர் பாய்ச்சப்படுகிறது", te: "నీరు పెట్టబడుతోంది", kn: "ನೀರಾವರಿ ನಡೆಯುತ್ತಿದೆ" },
    
    // Pump States & Buttons
    "pump_on": { en: "Pump ON", hi: "पंप चालू", mr: "पंप चालू", gu: "પંપ ચાલુ", bn: "পাম্প চালু", ta: "பம்ப் ஆன்", te: "పంప్ ఆన్", kn: "ಪಂಪ್ ಆನ್" },
    "pump_off": { en: "Pump OFF", hi: "पंप बंद", mr: "पंप बंद", gu: "પંપ બંધ", bn: "পাম্প বন্ধ", ta: "பம்ப் ஆஃப்", te: "పంప్ ఆఫ్", kn: "ಪಂಪ್ ஆஃப்" },
    "btn_turn_on": { en: "Turn Pump ON", hi: "पंप चालू करें", mr: "पंप चालू करा", gu: "પંપ ચાલુ કરો", bn: "পাম্প চালু করুন", ta: "பம்ப் ஆன் செய்", te: "పంప్ ఆన్ చేయి", kn: "ಪಂಪ್ ಆನ್ ಮಾಡಿ" },
    "btn_turn_off": { en: "Turn Pump OFF", hi: "पंप बंद करें", mr: "पंप बंद करा", gu: "પંપ બંધ કરો", bn: "পাম্প বন্ধ করুন", ta: "பம்ப் ஆஃப் செய்", te: "పంప్ ఆఫ్ చేయి", kn: "ಪಂಪ್ ಆಫ್ ಮಾಡಿ" },

    // Forecasts & Recommendations
    "forecast_stable": { en: "Soil stable for today.", hi: "आज मिट्टी स्थिर है।", mr: "आज माती स्थिर आहे.", gu: "આજે જમીન સ્થિર છે.", bn: "আজ মাটি স্থিতিশীল।", ta: "இன்று மண் சீராக உள்ளது.", te: "ఈ రోజు మట్టి స్థిరంగా ఉంది.", kn: "ಇಂದು ಮಣ್ಣು ಸ್ಥಿರವಾಗಿದೆ." },
    "forecast_soon": { en: "Watering likely needed soon.", hi: "जल्द ही पानी की जरूरत होगी।", mr: "लवकरच पाण्याची गरज भासेल.", gu: "જલ્દી જ પાણીની જરૂર પડશે.", bn: "শীঘ্রই জলের প্রয়োজন হবে।", ta: "விரைவில் நீர் தேவைப்படும்.", te: "త్వరలో నీరు అవసరం అవుతుంది.", kn: "ಶೀಘ್ರದಲ್ಲೇ ನೀರಿನ ಅಗತ್ಯವಿದೆ." },
    "forecast_auto": { en: "System is managing irrigation automatically.", hi: "प्रणाली स्वचालित रूप से सिंचाई कर रही है।", mr: "प्रणाली स्वयंचलितपणे सिंचन करत आहे.", gu: "સિસ્ટમ આપમેળે સિંચાઈ કરી રહી છે.", bn: "সিস্টেম স্বয়ংক্রিয়ভাবে সেচ দিচ্ছে।", ta: "கணினி தானாகவே நீர்ப்பாசனத்தை நிர்வகிக்கிறது.", te: "సిస్టమ్ స్వయంచాలకంగా నీటిపారుదలని నిర్వహిస్తోంది.", kn: "ಸಿಸ್ಟಮ್ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ನೀರಾವರಿಯನ್ನು ನಿರ್ವಹಿಸುತ್ತಿದೆ." },
    "rec_turn_on_pump": { en: "Please turn on manual pump to prevent wilting.", hi: "पौधों को सूखने से बचाने के लिए कृपया मैनुअल पंप चालू करें।", mr: "रोपे सुकण्यापासून वाचवण्यासाठी कृपया मॅन्युअल पंप चालू करा.", gu: "છોડને સુકાતા અટકાવવા કૃપા કરીને મેન્યુઅલ પંપ ચાલુ કરો.", bn: "গাছগুলোকে শুকিয়ে যাওয়া থেকে বাঁচাতে দয়া করে ম্যানুয়াল পাম্প চালু করুন।", ta: "தாவரங்கள் வாடுவதைத் தடுக்க கைமுறை பம்பை இயக்கவும்.", te: "మొక్కలు వాడిపోకుండా ఉండటానికి దయచేసి మాన్యువల్ పంప్‌ను ఆన్ చేయండి.", kn: "ಸಸ್ಯಗಳು ಒಣಗದಂತೆ ತಡೆಯಲು ದಯವಿಟ್ಟು ಕೈಪಿಡಿ ಪಂಪ್ ಆನ್ ಮಾಡಿ." },
    "rec_soil_adequate": { en: "Soil moisture is adequate based on current VPD.", hi: "वर्तमान स्थिति के अनुसार मिट्टी की नमी पर्याप्त है।", mr: "सध्याच्या परिस्थितीनुसार मातीची आर्द्रता पुरेशी आहे.", gu: "વર્તમાન પરિસ્થિતિ મુજબ જમીનનો ભેજ પૂરતો છે.", bn: "বর্তমান অবস্থা অনুযায়ী মাটির আর্দ্রতা পর্যাপ্ত।", ta: "தற்போதைய நிலவரப்படி மண்ணின் ஈரப்பதம் போதுமானது.", te: "ప్రస్తుత పరిస్థితుల ఆధారంగా మట్టిలో తేమ సరిపోతుంది.", kn: "ಪ್ರಸ್ತುತ ಪರಿಸ್ಥಿತಿಗಳ ಆಧಾರದ ಮೇಲೆ ಮಣ್ಣಿನ ತೇವಾಂಶವು ಸಮರ್ಪಕವಾಗಿದೆ." }
};

// --- 3. DOM Elements ---
const DOM = {
    overlay: document.getElementById('offline-overlay'),
    langSelect: document.getElementById('lang-selector'),
    mainStatus: document.getElementById('ui-main-status'),
    soilPct: document.getElementById('val-soil-pct'),
    pumpStatus: document.getElementById('ui-irrigation-status'),
    forecastText: document.getElementById('ui-forecast-text'),
    recommendationText: document.getElementById('ui-recommendation-text'),
    toggleAuto: document.getElementById('toggle-auto'),
    manualContainer: document.getElementById('manual-pump-container'),
    btnPump: document.getElementById('btn-pump'),
    humidity: document.getElementById('val-humidity'),
    temp: document.getElementById('val-temp'),
    vpd: document.getElementById('val-vpd'),
    uptime: document.getElementById('val-uptime'),
    trendChart: document.getElementById('trend-chart')
};

// --- 4. Core Application Logic ---

// Apply translations dynamically to the DOM
function updateLanguage() {
    currentLang = DOM.langSelect.value;
    
    // Update simple static HTML text nodes by ID
    Object.keys(translations).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerText = translations[id][currentLang];
    });
    
    // Immediately force re-render of dynamic application state texts
    renderStatus();
}

// Translate utility function for JS dynamically generated strings
function t(key) {
    return translations[key] ? translations[key][currentLang] : key;
}

// Handle UI connection state
function setOfflineState(offline) {
    if (isOffline === offline) return;
    isOffline = offline;
    if (offline) {
        DOM.overlay.classList.remove('hidden');
    } else {
        DOM.overlay.classList.add('hidden');
    }
}

// Fetch telemetry from ESP32
async function fetchSensors() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        const response = await fetch(`${ESP32_BASE_URL}/sensors`, { 
            signal: controller.signal,
            cache: 'no-store'
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error("HTTP Error");
        
        const data = await response.json();
        setOfflineState(false);
        processSensorData(data);
    } catch (err) {
        setOfflineState(true);
    }
}

// Send POST request for Mode (Auto/Manual)
async function setMode(isAuto) {
    try {
        await fetch(`${ESP32_BASE_URL}/mode`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ auto_mode: isAuto })
        });
        fetchSensors(); // Refresh UI instantly 
    } catch (err) {
        console.error("Failed to change mode");
    }
}

// Send POST request to Toggle Pump
async function togglePump() {
    try {
        const action = pumpIsOn ? "OFF" : "ON";
        await fetch(`${ESP32_BASE_URL}/pump`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: action })
        });
        fetchSensors(); // Refresh UI instantly
    } catch (err) {
        console.error("Failed to toggle pump");
    }
}

// Update DOM elements with ESP32 data
function processSensorData(data) {
    hasData = true; // Prevents UI glitches before connection

    // 1. Basic Values
    DOM.soilPct.innerText = parseFloat(data.soil_moisture_pct).toFixed(1);
    DOM.humidity.innerText = parseFloat(data.humidity_pct).toFixed(1);
    DOM.temp.innerText = parseFloat(data.temperature_c).toFixed(1);
    DOM.vpd.innerText = parseFloat(data.vpd_kpa).toFixed(2);
    DOM.uptime.innerText = data.uptime;
    
    // 2. State & Controls
    autoModeActive = data.auto_mode;
    pumpIsOn = data.pump_status;
    
    DOM.toggleAuto.checked = autoModeActive;
    DOM.manualContainer.style.display = autoModeActive ? 'none' : 'flex';
    DOM.btnPump.style.backgroundColor = pumpIsOn ? 'var(--pastel-pink)' : 'var(--pastel-blue)';

    // 3. Trends & History
    updateTrend(data.soil_moisture_pct);

    // 4. Update dynamic language text based on conditions
    renderStatus(data.soil_moisture_pct);
}

// Agronomy UI & Dynamic Translations Logic
function renderStatus(moisture = null) {
    // Failsafe for initial boot up before data has arrived
    if (!hasData) {
        DOM.mainStatus.innerText = t('status_gathering');
        DOM.mainStatus.style.color = "var(--text-main)";
        DOM.pumpStatus.innerText = "--";
        DOM.forecastText.innerText = t('status_gathering');
        DOM.recommendationText.innerText = "";
        DOM.btnPump.innerText = t('btn_turn_on');
        return;
    }

    if (moisture === null) moisture = parseFloat(DOM.soilPct.innerText) || 0;
    
    // Irrigation & Pump texts
    DOM.pumpStatus.innerText = pumpIsOn ? t('pump_on') : t('pump_off');
    DOM.btnPump.innerText = pumpIsOn ? t('btn_turn_off') : t('btn_turn_on');

    // Main title
    if (pumpIsOn) {
        DOM.mainStatus.innerText = t('status_watering');
        DOM.mainStatus.style.color = "#2980B9";
    } else if (moisture <= SOIL_DRY_THRESHOLD) {
        DOM.mainStatus.innerText = t('status_dry');
        DOM.mainStatus.style.color = "#C0392B";
    } else {
        DOM.mainStatus.innerText = t('status_perfect');
        DOM.mainStatus.style.color = "#27AE60";
    }

    // Predictive insights & Recommendations
    if (autoModeActive) {
        DOM.forecastText.innerText = t('forecast_auto');
        DOM.recommendationText.innerText = "";
    } else {
        if (moisture <= SOIL_DRY_THRESHOLD && !pumpIsOn) {
            DOM.forecastText.innerText = t('forecast_soon');
            DOM.recommendationText.innerText = t('rec_turn_on_pump');
        } else {
            DOM.forecastText.innerText = t('forecast_stable');
            DOM.recommendationText.innerText = t('rec_soil_adequate');
        }
    }
}

// Handle Historical Array & DOM Chart
function updateTrend(currentVal) {
    historyData.push(currentVal);
    if (historyData.length > 20) historyData.shift();

    DOM.trendChart.innerHTML = '';
    
    historyData.forEach(val => {
        const bar = document.createElement('div');
        bar.className = 'chart-bar';
        bar.style.height = `${val}%`;

        if(val <= SOIL_DRY_THRESHOLD) {
            bar.style.backgroundColor = "var(--pastel-pink)";
        } else if (val >= SOIL_WET_THRESHOLD) {
            bar.style.backgroundColor = "var(--pastel-blue)";
        } else {
            bar.style.backgroundColor = "var(--pastel-yellow)";
        }
        DOM.trendChart.appendChild(bar);
    });
}

// --- 5. Event Listeners & Bootstrap ---

DOM.langSelect.addEventListener('change', updateLanguage);

DOM.toggleAuto.addEventListener('change', (e) => {
    setMode(e.target.checked);
});

DOM.btnPump.addEventListener('click', () => {
    togglePump();
});

// Init
updateLanguage();
setInterval(fetchSensors, POLL_INTERVAL_MS);
fetchSensors();