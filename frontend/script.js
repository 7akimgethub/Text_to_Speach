const textInput = document.getElementById('text-input');
const speakButton = document.getElementById('speak-button');
const audioOutput = document.getElementById('audio-output');
const langSelect = document.getElementById('lang-select');
const voiceSelect = document.getElementById('voice-select');
const langEnButton = document.getElementById('lang-en');
const langArButton = document.getElementById('lang-ar');

let allVoices = [];

const translations = {
    en: {
        title: "Text to Speech",
        language_label: "Language:",
        voice_label: "Voice:",
        placeholder: "Enter text to speak...",
        speak_button: "Speak",
    },
    ar: {
        title: "تحويل النص إلى كلام",
        language_label: "اللغة:",
        voice_label: "الصوت:",
        placeholder: "أدخل النص للتحدث...",
        speak_button: "تحدث",
    }
};

function setLanguage(lang) {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    document.querySelectorAll('[data-key]').forEach(element => {
        const key = element.getAttribute('data-key');
        if (translations[lang] && translations[lang][key]) {
            if (element.tagName === 'TEXTAREA') {
                element.placeholder = translations[lang][key];
            } else {
                element.textContent = translations[lang][key];
            }
        }
    });

    if (lang === 'ar') {
        document.body.classList.add('rtl');
    } else {
        document.body.classList.remove('rtl');
    }
}

langEnButton.addEventListener('click', () => setLanguage('en'));
langArButton.addEventListener('click', () => setLanguage('ar'));


async function initialize() {
    try {
        // Fetch and populate languages
        const langResponse = await fetch('http://localhost:8000/api/languages');
        if (!langResponse.ok) {
            throw new Error(`HTTP error! status: ${langResponse.status}`);
        }
        const languages = await langResponse.json();
        langSelect.innerHTML = ''; // Clear existing options
        languages.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang;
            option.textContent = lang;
            langSelect.appendChild(option);
        });

        // Fetch and populate voices
        const voiceResponse = await fetch('http://localhost:8000/api/voices');
        if (!voiceResponse.ok) {
            throw new Error(`HTTP error! status: ${voiceResponse.status}`);
        }
        allVoices = await voiceResponse.json();
        
        // Set default language and populate voices for it
        langSelect.value = 'en'; 
        populateVoices();
        setLanguage('en');

    } catch (error) {
        console.error('Initialization error:', error);
        alert('Could not initialize the application. Please check the console for details.');
    }
}

function populateVoices() {
    const selectedLang = langSelect.value;
    voiceSelect.innerHTML = ''; // Clear existing options
    const filteredVoices = allVoices.filter(voice => voice.lang === selectedLang);

    filteredVoices.forEach(voice => {
        const option = document.createElement('option');
        option.value = voice.id;
        option.textContent = voice.name;
        voiceSelect.appendChild(option);
    });
}

langSelect.addEventListener('change', populateVoices);

speakButton.addEventListener('click', () => {
    const text = textInput.value.trim();
    const voiceId = voiceSelect.value;
    if (text && voiceId) {
        speak(text, voiceId);
    }
});

async function speak(text, voiceId) {
    try {
        const formData = new FormData();
        formData.append('text', text);
        formData.append('voice_id', voiceId);

        const response = await fetch('http://localhost:8000/api/tts', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        const audioUrl = URL.createObjectURL(blob);
        audioOutput.src = audioUrl;
        audioOutput.play();

    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please check the console for details.');
    }
}

document.addEventListener('DOMContentLoaded', initialize);
