/**
 * SMART FARM - Hardware Production Version
 * Multilingual Support + Direct ESP32 Communication + Qualitative Range Parsing
 */

// --- CONFIGURATION ---
const CONFIG = {
    ESP32_BASE_URL: "http://192.168.4.1/api",
    POLL_INTERVAL: 2000, // Matches ESP32 DHT11 limitation
    TIMEOUT: 4000
};

// --- TRANSLATION DICTIONARY ---
const I18N = {
    en: {
        app_title: "Smart Farm", connecting: "Connecting...", connected: "Connected", offline: "Offline",
        offline_desc: "Ensure you are connected to the 'AgriSense_Node' Wi-Fi.", checking_soil: "Checking Soil...",
        moisture_label: "Moisture:", state_critical: "Critically Dry", state_dry: "Needs Water",
        state_perfect: "Perfectly Watered", state_wet: "Very Wet", temp_title: "Temperature", hum_title: "Humidity",
        vpd_title: "VPD Stress", pump_title: "Water Pump", pump_on: "Watering Now", pump_off: "Not Watering",
        auto_title: "Automatic Irrigation", auto_desc: "The farm will water itself between 30% and 60% moisture.",
        disaster_title: "Disaster Prediction", disaster_desc: "Currently disabled. No environmental disaster sensors are connected. This is a future add-on feature.",
        btn_water: "WATER NOW", btn_stop_water: "TURN PUMP OFF", btn_emergency: "EMERGENCY STOP", btn_sending: "SENDING...",
        failsafe_alert: "DRY-RUN FAILSAFE TRIGGERED. PUMP DISABLED.", error_offline: "Error: Farm is offline.",
        
        // NEW: Qualitative terminology for Humidity and VPD
        hum_dry: "Dry", hum_good: "Good", hum_high: "Very Humid",
        vpd_low: "Low", vpd_good: "Excellent", vpd_high: "High", vpd_danger: "Danger"
    },
    hi: {
        app_title: "स्मार्ट खेत", connecting: "जुड़ रहा है...", connected: "जुड़ा हुआ", offline: "ऑफ़लाइन",
        offline_desc: "सुनिश्चित करें कि आप 'AgriSense_Node' वाई-फाई से जुड़े हैं।", checking_soil: "मिट्टी की जाँच...",
        moisture_label: "नमी:", state_critical: "बहुत सूखा", state_dry: "पानी चाहिए",
        state_perfect: "बिल्कुल सही", state_wet: "बहुत गीला", temp_title: "तापमान", hum_title: "नमी (Humidity)",
        vpd_title: "वी.पी.डी. तनाव", pump_title: "वाटर पंप", pump_on: "सिंचाई चालू है", pump_off: "सिंचाई बंद है",
        auto_title: "स्वचालित सिंचाई", auto_desc: "खेत 30% और 60% नमी के बीच अपने आप पानी ले लेगा।",
        disaster_title: "आपदा भविष्यवाणी", disaster_desc: "वर्तमान में अक्षम। कोई पर्यावरण आपदा सेंसर जुड़ा नहीं है। यह भविष्य की सुविधा है।",
        btn_water: "अभी पानी दें", btn_stop_water: "पंप बंद करें", btn_emergency: "आपातकालीन रोक", btn_sending: "भेज रहा है...",
        failsafe_alert: "ड्राई-रन फेलसेफ ट्रिगर। पंप बंद कर दिया गया है।", error_offline: "त्रुटि: खेत ऑफ़लाइन है।",
        
        hum_dry: "सूखा", hum_good: "अच्छा", hum_high: "उमस भरा",
        vpd_low: "कम", vpd_good: "उत्कृष्ट", vpd_high: "अधिक", vpd_danger: "खतरा"
    },
    mr: {
        app_title: "स्मार्ट शेती", connecting: "जोडत आहे...", connected: "जोडले", offline: "ऑफलाइन",
        offline_desc: "'AgriSense_Node' वाय-फाय शी जोडलेले असल्याची खात्री करा.", checking_soil: "माती तपासत आहे...",
        moisture_label: "ओलावा:", state_critical: "अतिशय कोरडे", state_dry: "पाण्याची गरज",
        state_perfect: "उत्तम ओलावा", state_wet: "खूप ओले", temp_title: "तापमान", hum_title: "आर्द्रता",
        vpd_title: "VPD ताण", pump_title: "पाण्याचा पंप", pump_on: "पाणी चालू आहे", pump_off: "पाणी बंद आहे",
        auto_title: "स्वयंचलित सिंचन", auto_desc: "मातीचा ओलावा ३०% आणि ६०% च्या दरम्यान असताना शेत आपोआप पाणी घेईल.",
        disaster_title: "आपत्तीचा अंदाज", disaster_desc: "सध्या अक्षम. कोणतेही आपत्ती सेन्सर जोडलेले नाहीत. हे भविष्यातील वैशिष्ट्य आहे.",
        btn_water: "आता पाणी द्या", btn_stop_water: "पंप बंद करा", btn_emergency: "तातडीने थांबवा", btn_sending: "पाठवत आहे...",
        failsafe_alert: "ड्राय-रन फेलसेफ सुरू. पंप अक्षम केला आहे.", error_offline: "चूक: शेत ऑफलाइन आहे.",
        
        hum_dry: "कोरडे", hum_good: "चांगले", hum_high: "दमट",
        vpd_low: "कमी", vpd_good: "उत्कृष्ट", vpd_high: "जास्त", vpd_danger: "धोका"
    },
    te: {
        app_title: "స్మార్ట్ ఫార్మ్", connecting: "కనెక్ట్ అవుతోంది...", connected: "కనెక్ట్ చేయబడింది", offline: "ఆఫ్‌లైన్",
        offline_desc: "మీరు Wi-Fi కి కనెక్ట్ అయ్యారని నిర్ధారించుకోండి.", checking_soil: "నేలను తనిఖీ చేస్తోంది...", 
        moisture_label: "తేమ:", state_critical: "చాలా పొడిగా ఉంది", state_dry: "నీరు అవసరం", 
        state_perfect: "పర్ఫెక్ట్", state_wet: "చాలా తడిగా ఉంది", temp_title: "ఉష్ణోగ్రత", hum_title: "గాలిలో తేమ", 
        vpd_title: "VPD ఒత్తిడి", pump_title: "నీటి పంపు", pump_on: "నీరు పోస్తోంది", pump_off: "నీరు పోయడం లేదు", 
        auto_title: "ఆటోమేటిక్ నీరు", auto_desc: "30% మరియు 60% తేమ మధ్య పొలం స్వయంచాలకంగా నీరు పోసుకుంటుంది.",
        disaster_title: "విపత్తు అంచనా", disaster_desc: "ప్రస్తుతం నిలిపివేయబడింది. సెన్సార్లు కనెక్ట్ చేయబడలేదు. ఇది భవిష్యత్తు ఫీచర్.",
        btn_water: "ఇప్పుడు నీరు పోయండి", btn_stop_water: "పంపును ఆపండి", btn_emergency: "అత్యవసర నిలుపుదల",
        btn_sending: "పంపుతోంది...", failsafe_alert: "డ్రై-రన్ ఫెయిల్‌సేఫ్ ట్రిగ్గర్ చేయబడింది. పంపు నిలిపివేయబడింది.", error_offline: "పొలం ఆఫ్‌లైన్‌లో ఉంది.",
        
        hum_dry: "పొడిగా ఉంది", hum_good: "మంచిది", hum_high: "తేమగా ఉంది",
        vpd_low: "తక్కువ", vpd_good: "అద్భుతమైన", vpd_high: "ఎక్కువ", vpd_danger: "ప్రమాదం"
    },
    ta: {
        app_title: "ஸ்மார்ட் பண்ணை", connecting: "இணைக்கிறது...", connected: "இணைக்கப்பட்டது", offline: "ஆஃப்லைன்",
        offline_desc: "வைஃபை உடன் இணைக்கப்பட்டுள்ளதா என உறுதிப்படுத்தவும்.", checking_soil: "மண் சோதிக்கப்படுகிறது...", 
        moisture_label: "ஈரப்பதம்:", state_critical: "மிகவும் வறண்டது", state_dry: "நீர் தேவை", 
        state_perfect: "சரியானது", state_wet: "மிகவும் ஈரமானது", temp_title: "வெப்பநிலை", hum_title: "காற்றில் ஈரப்பதம்", 
        vpd_title: "VPD அழுத்தம்", pump_title: "நீர் பம்ப்", pump_on: "நீர் பாய்கிறது", pump_off: "நீர் பாயவில்லை", 
        auto_title: "தானியங்கி பாசனம்", auto_desc: "30% முதல் 60% ஈரப்பதம் இடையே பண்ணை தானாகவே நீர்பாசனம் செய்யும்.",
        disaster_title: "பேரழிவு கணிப்பு", disaster_desc: "தற்போது முடக்கப்பட்டுள்ளது. எந்த பேரிடர் உணரிகளும் இணைக்கப்படவில்லை.",
        btn_water: "இப்போது நீர் பாய்ச்சு", btn_stop_water: "பம்பை நிறுத்து", btn_emergency: "அவசர நிறுத்தம்",
        btn_sending: "அனுப்புகிறது...", failsafe_alert: "பாதுகாப்பு தூண்டப்பட்டது. பம்ப் நிறுத்தப்பட்டது.", error_offline: "பண்ணை ஆஃப்லைனில் உள்ளது.",
        
        hum_dry: "வறண்ட", hum_good: "நல்லது", hum_high: "ஈரப்பதம்",
        vpd_low: "குறைவு", vpd_good: "சிறப்பானது", vpd_high: "அதிகம்", vpd_danger: "ஆபத்து"
    }
};

// Fill unmapped languages dynamically with English fallback to ensure stability
const supportedLangs = ['kn','ml','bn','gu','pa','or','as'];
supportedLangs.forEach(lang => { 
    I18N[lang] = { ...I18N.en, app_title: `Smart Farm (${lang.toUpperCase()})` }; 
});

// --- STATE MANAGEMENT ---
const State = {
    connected: false,
    preferences: { language: localStorage.getItem('sf_lang') || 'en' },
    telemetry: { moisture: null, temperature: null, humidity: null, vpd: null },
    system: { pumpRunning: false, autoMode: true, failsafe: false, alert: "" }
};

// --- FAULT-TOLERANT PARSER ---
const safeFloat = (val) => {
    if (val === null || val === undefined) return null;
    const parsed = parseFloat(val);
    return isNaN(parsed) ? null : parsed;
};

// --- ESP32 API ADAPTER ---
const API = {
    async fetchWithTimeout(url, options = {}) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);
        try {
            const res = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(id);
            if (!res.ok) throw new Error("HTTP " + res.status);
            return await res.json();
        } catch (err) {
            clearTimeout(id);
            throw err;
        }
    },
    
    async getStatus() {
        const raw = await this.fetchWithTimeout(`${CONFIG.ESP32_BASE_URL}/sensors`);
        return {
            moisture: safeFloat(raw.soil_moisture_pct),
            temperature: safeFloat(raw.temperature_c),
            humidity: safeFloat(raw.humidity_pct),
            vpd: safeFloat(raw.vpd_kpa),
            pumpRunning: !!raw.pump_status,
            autoMode: !!raw.auto_mode,
            failsafe: !!raw.failsafe_triggered,
            alertMessage: raw.alert_message || ""
        };
    },

    async setPump(state) {
        return this.fetchWithTimeout(`${CONFIG.ESP32_BASE_URL}/pump`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: state ? "ON" : "OFF" })
        });
    },

    async setAutoMode(enabled) {
        return this.fetchWithTimeout(`${CONFIG.ESP32_BASE_URL}/mode`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ auto_mode: enabled })
        });
    }
};

// --- UI CONTROLLER ---
const UI = {
    els: {},
    init() {
        // Cache DOM elements
        ['dashboard', 'connection-status', 'offline-overlay', 'system-alert', 'alert-text',
         'moisture-card', 'moisture-headline', 'moisture-value', 'temp-value', 
         'humidity-status', 'humidity-value', 'vpd-status', 'vpd-value',
         'pump-status', 'pump-animation', 'auto-toggle', 'btn-manual-water', 'btn-emergency-stop', 'failsafe-banner',
         'toast-container', 'language-selector'].forEach(id => this.els[id] = document.getElementById(id));

        // Bind Events
        this.els['language-selector'].value = State.preferences.language;
        this.els['language-selector'].addEventListener('change', (e) => this.changeLanguage(e.target.value));
        this.els['auto-toggle'].addEventListener('change', (e) => App.toggleAutoMode(e.target.checked));
        this.els['btn-manual-water'].addEventListener('click', () => App.togglePump());
        this.els['btn-emergency-stop'].addEventListener('click', () => App.emergencyStop());
        
        this.applyTranslations();
    },

    t(key) {
        const lang = State.preferences.language;
        return I18N[lang][key] || I18N.en[key] || key;
    },

    changeLanguage(lang) {
        State.preferences.language = lang;
        localStorage.setItem('sf_lang', lang);
        this.applyTranslations();
        this.renderTelemetry(); 
    },

    applyTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.innerText = this.t(key);
        });
    },

    renderConnection() {
        const dot = this.els['connection-status'].querySelector('.status-dot');
        const txt = this.els['connection-status'].querySelector('.status-text');
        
        dot.className = 'status-dot';
        if (State.connected) {
            dot.classList.add('connected');
            txt.innerText = this.t('connected');
            this.els['offline-overlay'].classList.add('hidden');
            Array.from(this.els['dashboard'].children).forEach(c => {
                if (c.tagName === 'SECTION') c.classList.remove('blurred');
            });
        } else {
            dot.classList.add('error');
            txt.innerText = this.t('offline');
            this.els['offline-overlay'].classList.remove('hidden');
            Array.from(this.els['dashboard'].children).forEach(c => {
                if (c.tagName === 'SECTION') c.classList.add('blurred');
            });
        }
    },

    renderTelemetry() {
        const m = State.telemetry.moisture;
        const h = State.telemetry.humidity;
        const t = State.telemetry.temperature;
        const v = State.telemetry.vpd;
        
        // Moisture Logic
        this.els['moisture-value'].innerText = m !== null ? `${m.toFixed(1)}%` : "--%";
        if (m === null) {
            this.els['moisture-headline'].innerText = this.t('checking_soil');
            this.els['moisture-card'].className = "card primary-status";
        } else if (m < 20) {
            this.els['moisture-headline'].innerText = this.t('state_critical');
            this.els['moisture-card'].className = "card primary-status bg-critical";
        } else if (m < 35) {
            this.els['moisture-headline'].innerText = this.t('state_dry');
            this.els['moisture-card'].className = "card primary-status bg-dry";
        } else if (m <= 70) {
            this.els['moisture-headline'].innerText = this.t('state_perfect');
            this.els['moisture-card'].className = "card primary-status bg-perfect";
        } else {
            this.els['moisture-headline'].innerText = this.t('state_wet');
            this.els['moisture-card'].className = "card primary-status bg-wet";
        }

        // Temperature (Raw value only)
        this.els['temp-value'].innerText = t !== null ? `${t.toFixed(1)} °C` : "-- °C";

        // Humidity (Qualitative Translation)
        if (h === null) {
            this.els['humidity-status'].innerText = "--";
            this.els['humidity-status'].className = "status-label";
            this.els['humidity-value'].innerText = "--%";
        } else {
            this.els['humidity-value'].innerText = `${h.toFixed(1)}%`;
            if (h < 40) {
                this.els['humidity-status'].innerText = this.t('hum_dry');
                this.els['humidity-status'].className = "status-label text-warn";
            } else if (h <= 75) {
                this.els['humidity-status'].innerText = this.t('hum_good');
                this.els['humidity-status'].className = "status-label text-good";
            } else {
                this.els['humidity-status'].innerText = this.t('hum_high');
                this.els['humidity-status'].className = "status-label text-danger";
            }
        }

        // VPD (Qualitative Translation)
        if (v === null) {
            this.els['vpd-status'].innerText = "--";
            this.els['vpd-status'].className = "status-label";
            this.els['vpd-value'].innerText = "-- kPa";
        } else {
            this.els['vpd-value'].innerText = `${v.toFixed(2)} kPa`;
            if (v < 0.4) {
                this.els['vpd-status'].innerText = this.t('vpd_low');
                this.els['vpd-status'].className = "status-label text-warn";
            } else if (v <= 1.2) {
                this.els['vpd-status'].innerText = this.t('vpd_good');
                this.els['vpd-status'].className = "status-label text-good";
            } else if (v <= 1.6) {
                this.els['vpd-status'].innerText = this.t('vpd_high');
                this.els['vpd-status'].className = "status-label text-warn";
            } else {
                this.els['vpd-status'].innerText = this.t('vpd_danger');
                this.els['vpd-status'].className = "status-label text-danger";
            }
        }
        
        // Pump state
        const p = State.system.pumpRunning;
        this.els['pump-status'].innerText = p ? this.t('pump_on') : this.t('pump_off');
        this.els['pump-status'].className = p ? "status-label text-good" : "status-label off";
        p ? this.els['pump-animation'].classList.remove('hidden') : this.els['pump-animation'].classList.add('hidden');
        
        // Manual pump button
        this.els['btn-manual-water'].innerText = p ? this.t('btn_stop_water') : this.t('btn_water');
        this.els['btn-manual-water'].className = p ? "btn btn-danger outline" : "btn btn-primary";

        // Auto Toggle state
        this.els['auto-toggle'].checked = State.system.autoMode;

        // Alerts & Failsafe Display
        if (State.system.failsafe) {
            this.els['failsafe-banner'].classList.remove('hidden');
            this.els['system-alert'].classList.add('hidden'); 
        } else {
            this.els['failsafe-banner'].classList.add('hidden');
            if (State.system.alert) {
                this.els['system-alert'].classList.remove('hidden');
                this.els['alert-text'].innerText = State.system.alert;
            } else {
                this.els['system-alert'].classList.add('hidden');
            }
        }
    },

    showToast(msg) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerText = msg;
        this.els['toast-container'].appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
};

// --- APPLICATION LOGIC ---
const App = {
    async init() {
        UI.init();
        this.loop();
    },

    async loop() {
        try {
            const data = await API.getStatus();
            
            if (!State.connected) {
                State.connected = true;
                UI.renderConnection();
            }
            
            State.telemetry = { moisture: data.moisture, temperature: data.temperature, humidity: data.humidity, vpd: data.vpd };
            State.system = { pumpRunning: data.pumpRunning, autoMode: data.autoMode, failsafe: data.failsafe, alert: data.alertMessage };

            UI.renderTelemetry();
        } catch (err) {
            if (State.connected) {
                State.connected = false;
                UI.renderConnection();
            }
        }
        
        setTimeout(() => this.loop(), CONFIG.POLL_INTERVAL);
    },

    async toggleAutoMode(enable) {
        if (!State.connected) {
            UI.showToast(UI.t('error_offline'));
            UI.els['auto-toggle'].checked = !enable; 
            return;
        }
        try {
            await API.setAutoMode(enable);
            State.system.autoMode = enable;
        } catch (e) {
            UI.els['auto-toggle'].checked = !enable;
        }
    },

    async togglePump() {
        if (!State.connected) return UI.showToast(UI.t('error_offline'));
        
        const turnOn = !State.system.pumpRunning;
        try {
            UI.els['btn-manual-water'].innerText = UI.t('btn_sending');
            await API.setPump(turnOn);
        } catch (e) {
            UI.renderTelemetry(); 
        }
    },

    async emergencyStop() {
        if (!State.connected) return UI.showToast(UI.t('error_offline'));
        try {
            await API.setPump(false);
            UI.els['auto-toggle'].checked = false;
            await API.setAutoMode(false);
        } catch (e) {}
    }
};

// Boot application
document.addEventListener('DOMContentLoaded', () => App.init());