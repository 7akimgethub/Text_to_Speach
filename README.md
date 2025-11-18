# Text to Speech Application

This is a text-to-speech application with a web-based front-end and a Python back-end. It allows you to convert text into speech using different languages and voices available on your system.

## Features

-   Web-based interface
-   Multi-language support
-   Multi-voice selection (per language)
-   Real-time speech generation

## How to Run

### 1. Prerequisites

-   Python 3.6+
-   A modern web browser
-   A text-to-speech engine installed on your operating system (e.g., Windows SAPI5, macOS NSSpeechSynthesizer, or eSpeak on Linux). `pyttsx3` depends on this.

### 2. Back-end Setup

1.  **Navigate to the project root directory.**
2.  **Create a virtual environment (recommended):**
    ```bash
    python -m venv venv
    ```
3.  **Activate the virtual environment:**
    -   On Windows:
        ```bash
        .\venv\Scripts\activate
        ```
    -   On macOS/Linux:
        ```bash
        source venv/bin/activate
        ```
4.  **Install the required Python packages:**
    ```bash
    pip install -r requirements.txt
    ```
5.  **Start the back-end server:**
    ```bash
    python backend/main.py
    ```
    The server will be running at `http://localhost:8000`.

### 3. Front-end Setup

1.  **Open the `frontend/index.html` file in your web browser.**
    - You can usually do this by double-clicking the file or right-clicking and selecting "Open with" your browser.

### 4. Usage

1.  Select a language from the dropdown menu.
2.  Select a voice for the chosen language.
3.  Enter the text you want to convert to speech in the text area.
4.  Click the "Speak" button.
5.  The audio will be generated and played automatically.
