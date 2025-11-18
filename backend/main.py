from fastapi import FastAPI, Form
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import pyttsx3
import tempfile
import os
from pydantic import BaseModel
from typing import List
from gtts import gTTS
import io

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize pyttsx3 engine
engine = pyttsx3.init()

class Voice(BaseModel):
    id: str
    name: str
    lang: str

# gTTS supported languages (subset)
gtts_languages = {
    "ar": "Arabic",
    "en": "English",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "ru": "Russian",
    "ja": "Japanese",
    "ko": "Korean",
    "zh-CN": "Chinese (Simplified)",
}

@app.get("/api/voices", response_model=List[Voice])
async def get_voices():
    """
    Returns a list of available voices from pyttsx3 and gTTS.
    """
    # pyttsx3 voices
    voices = engine.getProperty('voices')
    voice_list = []
    for voice in voices:
        lang = "N/A"
        try:
            lang = voice.languages[0].split('_')[0] if voice.languages else "N/A"
        except:
            pass
        voice_list.append(Voice(id=voice.id, name=f"{voice.name} (Offline)", lang=lang))

    # Add gTTS voices
    for code, name in gtts_languages.items():
        voice_list.append(Voice(id=f"gtts-{code}", name="Google (Online)", lang=code))

    return voice_list

@app.get("/api/languages")
async def get_languages():
    """
    Returns a list of unique languages from pyttsx3 and gTTS.
    """
    voices = engine.getProperty('voices')
    languages = set()
    for voice in voices:
        try:
            lang_code = voice.languages[0].split('_')[0] if voice.languages else None
            if lang_code:
                languages.add(lang_code)
        except:
            pass
    
    for code in gtts_languages.keys():
        languages.add(code)

    return sorted(list(languages))


@app.post("/api/tts")
async def text_to_speech(text: str = Form(...), voice_id: str = Form(None)):
    """
    Converts text to speech using pyttsx3 or gTTS based on voice_id.
    """
    if voice_id and voice_id.startswith("gtts-"):
        lang = voice_id.split('-')[1]
        return await text_to_speech_gtts(text=text, lang=lang)
    else:
        if voice_id:
            engine.setProperty('voice', voice_id)

        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as fp:
            engine.save_to_file(text, fp.name)
            engine.runAndWait()
            fp.seek(0)
            file_content = fp.read()

        os.unlink(fp.name)
        return StreamingResponse(iter([file_content]), media_type="audio/mpeg")


async def text_to_speech_gtts(text: str, lang: str):
    """
    Converts text to speech using gTTS.
    """
    try:
        tts = gTTS(text=text, lang=lang, slow=False)
        fp = io.BytesIO()
        tts.write_to_fp(fp)
        fp.seek(0)
        return StreamingResponse(fp, media_type="audio/mpeg")
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": str(e)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)