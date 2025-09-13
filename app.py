import streamlit as st
import google.generativeai as genai
import io
import wave
import struct
import math
import base64
import random
import requests
import pyttsx3
import tempfile
import os
from datetime import datetime
from dataclasses import dataclass
from enum import Enum

st.set_page_config(page_title="EchoVerse Pro", page_icon="🎭", layout="wide")

class Tone(Enum):
    DRAMATIC = "Dramatic"
    CALM = "Calm"
    EXCITING = "Exciting"
    MYSTERIOUS = "Mysterious"
    ROMANTIC = "Romantic"

class Voice(Enum):
    MALE_DEEP = "Male Deep"
    MALE_MEDIUM = "Male Medium"
    MALE_YOUNG = "Male Young"
    FEMALE_SOPRANO = "Female Soprano"
    FEMALE_ALTO = "Female Alto"
    FEMALE_MATURE = "Female Mature"

@dataclass
class Narration:
    id: str
    original_text: str
    rewritten_text: str
    tone: Tone
    voice: Voice
    timestamp: datetime
    audio_bytes: bytes

def read_api_keys():
    try:
        with open('api_keys.txt', 'r', encoding='utf-8') as f:
            content = f.read()
        gemini_key = None
        for line in content.split('\n'):
            line = line.strip()
            if line.startswith('GEMINI_API_KEY='):
                gemini_key = line.split('=', 1)[1].strip()
        if gemini_key and gemini_key != 'your_gemini_api_key_here':
            return gemini_key
        else:
            return None
    except Exception:
        return None

class GeminiService:
    @staticmethod
    def rewrite_text_with_tone(text: str, tone: Tone) -> str:
        try:
            gemini_key = read_api_keys()
            if not gemini_key:
                return GeminiService.simple_rewrite_fallback(text, tone)
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            tone_prompts = {
                Tone.DRAMATIC: "Make this text slightly more engaging and impactful while keeping the original content mostly unchanged:",
                Tone.CALM: "Make this text slightly more peaceful and easy to read while preserving the original message:",
                Tone.EXCITING: "Add subtle energy to this text while maintaining the original meaning:",
                Tone.MYSTERIOUS: "Give this text a subtle mysterious feel while keeping the original content:",
                Tone.ROMANTIC: "Add gentle warmth to this text while preserving the original meaning:"
            }
            prompt = f"{tone_prompts[tone]}\n\n{text}"
            response = model.generate_content(prompt, generation_config=genai.types.GenerationConfig(temperature=0.1))
            return response.text.strip()
        except Exception as e:
            error_msg = str(e).lower()
            if "api key" in error_msg or "invalid" in error_msg:
                st.error("❌ Invalid Gemini API key. Please check your api_keys.txt file.")
            elif "quota" in error_msg or "429" in error_msg:
                st.warning("⚠️ Gemini API quota exceeded. Using fallback rewrite.")
            elif "rate limit" in error_msg:
                st.warning("⚠️ Gemini API rate limit reached. Using fallback rewrite.")
            else:
                st.error(f"❌ Error: {e}")
            return GeminiService.simple_rewrite_fallback(text, tone)
    
    @staticmethod
    def simple_rewrite_fallback(text: str, tone: Tone) -> str:
        tone_prefixes = {
            Tone.DRAMATIC: "🎭 DRAMATICALLY: ",
            Tone.CALM: "😌 CALMLY: ",
            Tone.EXCITING: "⚡ EXCITINGLY: ",
            Tone.MYSTERIOUS: "🔮 MYSTERIOUSLY: ",
            Tone.ROMANTIC: "💕 ROMANTICALLY: "
        }
        return f"{tone_prefixes[tone]}{text}"

class TTSService:
    @staticmethod
    def generate_audio(text: str, voice: Voice) -> bytes:
        try:
            print(f"🎤 Generating real speech audio for voice: {voice.value}")
            return TTSService.generate_real_speech(text, voice)
        except Exception as e:
            print(f"❌ TTS Error: {e}")
            return TTSService.create_speech_fallback(text, voice)
    
    @staticmethod
    def generate_real_speech(text: str, voice: Voice) -> bytes:
        """Generate real speech using pyttsx3"""
        try:
            import pythoncom
            pythoncom.CoInitialize()
            
            engine = pyttsx3.init()
            
            # Voice configuration based on voice type
            voice_configs = {
                Voice.MALE_DEEP: {"rate": 150, "volume": 0.9, "voice_id": 0},
                Voice.MALE_MEDIUM: {"rate": 180, "volume": 0.8, "voice_id": 0},
                Voice.MALE_YOUNG: {"rate": 200, "volume": 0.8, "voice_id": 0},
                Voice.FEMALE_SOPRANO: {"rate": 220, "volume": 0.8, "voice_id": 1},
                Voice.FEMALE_ALTO: {"rate": 190, "volume": 0.8, "voice_id": 1},
                Voice.FEMALE_MATURE: {"rate": 170, "volume": 0.8, "voice_id": 1}
            }
            
            config = voice_configs.get(voice, voice_configs[Voice.MALE_MEDIUM])
            
            # Set voice properties
            engine.setProperty('rate', config["rate"])
            engine.setProperty('volume', config["volume"])
            
            # Try to set specific voice if available
            voices = engine.getProperty('voices')
            if voices and len(voices) > config["voice_id"]:
                engine.setProperty('voice', voices[config["voice_id"]].id)
            
            # Create unique temporary file name to avoid conflicts
            import uuid
            temp_filename = f"temp_audio_{uuid.uuid4().hex}.wav"
            temp_path = os.path.join(tempfile.gettempdir(), temp_filename)
            
            engine.save_to_file(text, temp_path)
            engine.runAndWait()
            
            # Read the generated audio file
            with open(temp_path, 'rb') as f:
                audio_data = f.read()
            
            # Clean up temporary file
            try:
                os.unlink(temp_path)
            except:
                pass  # Ignore cleanup errors
            
            pythoncom.CoUninitialize()
            
            print(f"✅ Real speech generated! {len(audio_data)} bytes")
            return audio_data
                
        except Exception as e:
            print(f"Real speech generation error: {e}")
            try:
                pythoncom.CoUninitialize()
            except:
                pass
            return TTSService.create_speech_fallback(text, voice)
    
    
    @staticmethod
    def create_speech_fallback(text: str, voice: Voice) -> bytes:
        try:
            sample_rate = 22050
            duration = min(len(text) * 0.1, 8)
            
            # Fallback voice frequencies
            fallback_freqs = {
                Voice.MALE_DEEP: 80,
                Voice.MALE_MEDIUM: 110,
                Voice.MALE_YOUNG: 140,
                Voice.FEMALE_SOPRANO: 210,
                Voice.FEMALE_ALTO: 170,
                Voice.FEMALE_MATURE: 150
            }
            
            base_freq = fallback_freqs.get(voice, 120)
            samples = []
            for i in range(int(sample_rate * duration)):
                char_index = i % len(text) if text else 0
                frequency = base_freq + (ord(text[char_index]) % 50)
                envelope = 0.3 * math.sin(math.pi * i / (sample_rate * duration))
                sample = int(32767 * envelope * math.sin(2 * math.pi * frequency * i / sample_rate))
                samples.append(sample)
            audio_data = struct.pack('<' + 'h' * len(samples), *samples)
            wav_buffer = io.BytesIO()
            with wave.open(wav_buffer, 'wb') as wav_file:
                wav_file.setnchannels(1)
                wav_file.setsampwidth(2)
                wav_file.setframerate(sample_rate)
                wav_file.writeframes(audio_data)
            wav_buffer.seek(0)
            return wav_buffer.read()
        except Exception as e:
            print(f"Fallback error: {e}")
            return b""

def render_header():
    st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');
    
    .main-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
        padding: 1.5rem 2rem;
        border-radius: 1.5rem;
        text-align: center;
        margin-bottom: 2rem;
        box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        position: relative;
        overflow: hidden;
        animation: slideInDown 1s ease-out;
    }
    
    .main-header::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
        opacity: 0.3;
        animation: float 6s ease-in-out infinite;
    }
    
    .header-content {
        position: relative;
        z-index: 2;
    }
    
    .main-title {
        color: white;
        font-family: 'Poppins', sans-serif;
        font-size: 2.5rem;
        font-weight: 700;
        margin: 0;
        text-shadow: 2px 2px 8px rgba(0,0,0,0.3);
        animation: glow 2s ease-in-out infinite alternate;
    }
    
    .main-subtitle {
        color: rgba(255,255,255,0.9);
        font-family: 'Poppins', sans-serif;
        font-size: 1.1rem;
        margin: 0.5rem 0 0 0;
        font-weight: 300;
        animation: fadeInUp 1.5s ease-out 0.5s both;
    }
    
    .logo-icon {
        font-size: 3rem;
        margin-bottom: 0.5rem;
        animation: bounce 2s ease-in-out infinite;
    }
    
    @keyframes slideInDown {
        from { transform: translateY(-100px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes fadeInUp {
        from { transform: translateY(30px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes glow {
        from { text-shadow: 2px 2px 8px rgba(0,0,0,0.3); }
        to { text-shadow: 2px 2px 20px rgba(255,255,255,0.5), 0 0 30px rgba(255,255,255,0.3); }
    }
    
    @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        60% { transform: translateY(-5px); }
    }
    
    @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
    }
    
    .book-page {
        background: linear-gradient(145deg, #f8f9fa, #e9ecef);
        border-radius: 1.5rem;
        padding: 2rem;
        margin: 1rem 0;
        box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        border: 1px solid rgba(0,0,0,0.1);
        position: relative;
        animation: fadeInUp 0.8s ease-out;
    }
    
    .book-page::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background: linear-gradient(to bottom, #667eea, #764ba2);
        border-radius: 2px 0 0 2px;
    }
    
    .book-page-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 1rem;
    }
    
    .book-content {
        font-family: 'Georgia', serif;
        font-size: 1.1rem;
        line-height: 1.8;
        color: #2c3e50;
        text-align: justify;
        text-indent: 1.5rem;
        padding: 1.5rem;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 0.8rem;
        box-shadow: inset 0 2px 8px rgba(0,0,0,0.1);
        min-height: 300px;
    }
    
    .book-title {
        text-align: center;
        color: #2c3e50;
        margin-bottom: 1.5rem;
        font-family: 'Poppins', sans-serif;
        font-weight: 600;
        font-size: 1.3rem;
    }
    
    .book-text {
        font-family: 'Georgia', serif;
        font-size: 1.1rem;
        line-height: 1.8;
        color: #2c3e50;
        text-align: justify;
        padding: 1.5rem;
        background: white;
        border-radius: 0.8rem;
        box-shadow: inset 0 2px 8px rgba(0,0,0,0.1);
        position: relative;
    }
    
    .highlight-word {
        background: linear-gradient(120deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 2px 4px;
        border-radius: 4px;
        transition: all 0.3s ease;
        animation: highlightPulse 0.5s ease-in-out;
    }
    
    @keyframes highlightPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    .audio-player-container {
        background: rgba(15, 23, 42, 0.95);
        border-radius: 1.5rem;
        padding: 2rem;
        border: 2px solid rgba(148, 163, 184, 0.3);
        margin: 1rem 0;
        backdrop-filter: blur(10px);
        animation: fadeInUp 0.8s ease-out;
    }
    
    .control-slider {
        background: linear-gradient(90deg, #667eea, #764ba2);
        border-radius: 10px;
        height: 8px;
        outline: none;
        transition: all 0.3s ease;
    }
    
    .control-slider:hover {
        transform: scaleY(1.2);
    }
    
    .control-slider::-webkit-slider-thumb {
        appearance: none;
        width: 20px;
        height: 20px;
        background: white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .control-slider::-webkit-slider-thumb:hover {
        transform: scale(1.2);
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    }
    </style>
    
    <div class="main-header">
        <div class="header-content">
            <div class="logo-icon">🎭</div>
            <h1 class="main-title">EchoVerse Pro</h1>
            <p class="main-subtitle">Professional Audiobook Creation Tool</p>
        </div>
    </div>
    """, unsafe_allow_html=True)

def check_api_keys():
    gemini_key = read_api_keys()
    if not gemini_key:
        st.error("🔑 Gemini API Key Required")
        st.markdown("""
        <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 0.5rem; padding: 1rem; margin: 1rem 0;">
            <h4>📋 Setup Instructions:</h4>
            <ol>
                <li><strong>Google Gemini API (Required):</strong>
                    <ul>
                        <li>Go to <a href="https://makersuite.google.com/app/apikey" target="_blank">Google AI Studio</a></li>
                        <li>Create a new API key</li>
                        <li>Copy the key</li>
                    </ul>
                </li>
                <li><strong>Configure:</strong>
                    <ul>
                        <li>Open <code>api_keys.txt</code> in your project folder</li>
                        <li>Paste your Gemini key in the format: <code>GEMINI_API_KEY=your_key_here</code></li>
                        <li>Save the file and refresh this page</li>
                    </ul>
                </li>
            </ol>
        </div>
        """, unsafe_allow_html=True)
        return False
    
    st.info("✅ **Available Services:** 🎤 Real Speech Audio (pyttsx3), 🤖 Gemini AI Text Enhancement")
    return True

def render_input_area():
    st.markdown("### 📝 Enter Your Text")
    text_input = st.text_area("Paste your text here:", height=150, placeholder="Enter the text you want to convert into an audiobook...")
    uploaded_file = st.file_uploader("Or upload a .txt file:", type=['txt'], help="Upload a text file to automatically load its content")
    if uploaded_file is not None:
        try:
            content = uploaded_file.read().decode('utf-8')
            text_input = content
        except Exception as e:
            st.error(f"Error reading file: {e}")
    return text_input

def render_controls():
    col1, col2 = st.columns(2)
    with col1:
        tone = st.selectbox("🎭 Select Tone:", options=list(Tone), format_func=lambda x: x.value, help="Choose the emotional tone for your audiobook")
    with col2:
        voice = st.selectbox("🎤 Select Voice:", options=list(Voice), format_func=lambda x: x.value, help="Choose between male or female voice")
    return tone, voice

def render_book_style_text(text: str, text_id: str, title: str):
    st.markdown(f"""
    <div class="book-page">
        <h3 class="book-title">{title}</h3>
        <div class="book-text" id="{text_id}">
            {text}
        </div>
    </div>
    """, unsafe_allow_html=True)

def render_advanced_audio_player(audio_bytes: bytes, rewritten_text: str):
    if not audio_bytes:
        return
    st.markdown("### 🎧 Audio Player")
    
    col1, col2, col3 = st.columns([2, 1, 1])
    with col1:
        volume = st.slider("🔊 Volume", 0.0, 1.0, 0.8, 0.1, key="volume_control")
    with col2:
        speed = st.slider("⚡ Speed", 0.5, 2.0, 1.0, 0.1, key="speed_control")
    with col3:
        st.download_button(label="📥 Download Audio", data=audio_bytes, file_name=f"echoverse_narration_{datetime.now().strftime('%Y%m%d_%H%M%S')}.wav", mime="audio/wav", use_container_width=True)
    
    audio_base64 = base64.b64encode(audio_bytes).decode()
    
    st.markdown(f"""
    <div class="audio-player-container">
        <audio controls style="width: 100%; margin-bottom: 1rem;" id="main-audio">
            <source src="data:audio/wav;base64,{audio_base64}" type="audio/wav">
            Your browser does not support the audio element.
        </audio>
    </div>
    
    <script>
    // Text highlighting functionality
    function highlightText(textId, audioElement) {{
        const textElement = document.getElementById(textId);
        if (!textElement || !audioElement) return;
        
        const words = textElement.textContent.split(' ');
        
        // Wrap each word in a span
        textElement.innerHTML = words.map(word => 
            `<span class="word" data-word="${{word}}">${{word}}</span>`
        ).join(' ');
        
        // Get all word spans
        const wordSpans = textElement.querySelectorAll('.word');
        
        // Calculate timing for each word (rough estimation)
        const duration = audioElement.duration || 10; // fallback duration
        const wordDuration = duration / words.length;
        
        let currentWordIndex = 0;
        let highlightInterval = null;
        
        // Reset highlighting
        function resetHighlight() {{
            wordSpans.forEach(span => {{
                span.classList.remove('highlight-word');
            }});
            currentWordIndex = 0;
            if (highlightInterval) {{
                clearInterval(highlightInterval);
                highlightInterval = null;
            }}
        }}
        
        // Highlight current word
        function highlightCurrentWord() {{
            if (currentWordIndex < wordSpans.length) {{
                // Remove previous highlight
                if (currentWordIndex > 0) {{
                    wordSpans[currentWordIndex - 1].classList.remove('highlight-word');
                }}
                
                // Add current highlight
                wordSpans[currentWordIndex].classList.add('highlight-word');
                
                // Scroll to current word
                wordSpans[currentWordIndex].scrollIntoView({{
                    behavior: 'smooth',
                    block: 'center'
                }});
                
                currentWordIndex++;
            }}
        }}
        
        // Event listeners
        audioElement.addEventListener('play', () => {{
            resetHighlight();
            highlightInterval = setInterval(highlightCurrentWord, wordDuration * 1000);
        }});
        
        audioElement.addEventListener('pause', () => {{
            if (highlightInterval) {{
                clearInterval(highlightInterval);
                highlightInterval = null;
            }}
        }});
        
        audioElement.addEventListener('ended', () => {{
            resetHighlight();
        }});
        
        audioElement.addEventListener('seeked', () => {{
            const seekTime = audioElement.currentTime;
            const newIndex = Math.floor((seekTime / duration) * words.length);
            currentWordIndex = Math.max(0, Math.min(newIndex, words.length - 1));
            resetHighlight();
            for (let i = 0; i < currentWordIndex; i++) {{
                wordSpans[i].classList.add('highlight-word');
            }}
        }});
    }}
    
    // Enhanced audio controls and highlighting
    document.addEventListener('DOMContentLoaded', function() {{
        const audio = document.getElementById('main-audio');
        if (audio) {{
            // Set initial volume and speed
            audio.volume = {volume};
            audio.playbackRate = {speed};
            
            // Update volume when slider changes
            const volumeSlider = document.querySelector('input[aria-label="Volume"]');
            if (volumeSlider) {{
                volumeSlider.addEventListener('input', function() {{
                    audio.volume = parseFloat(this.value);
                }});
            }}
            
            // Update speed when slider changes
            const speedSlider = document.querySelector('input[aria-label="Speed"]');
            if (speedSlider) {{
                speedSlider.addEventListener('input', function() {{
                    audio.playbackRate = parseFloat(this.value);
                }});
            }}
            
            // Initialize highlighting when audio is ready
            audio.addEventListener('loadedmetadata', () => {{
                highlightText('rewritten_text', audio);
            }});
        }}
    }});
    </script>
    """, unsafe_allow_html=True)
    
    # Add info message using Streamlit components
    st.info("🎧 **Your audiobook is ready!** Use the controls above to play and watch the text highlight as you listen.")
    
    # Add book-style page layout with rewritten text
    if rewritten_text:
        st.markdown("### 📖 Book View")
        st.markdown(f"""
        <div class="book-page-container">
            <div class="book-page">
                <div class="book-content" id="rewritten_text">
                    {rewritten_text}
                </div>
            </div>
        </div>
        """, unsafe_allow_html=True)

def render_audiobook_display(original_text: str, rewritten_text: str, audio_bytes: bytes):
    if not rewritten_text:
        return
    st.markdown("### 📚 Your Audiobook")
    tab1, tab2, tab3 = st.tabs(["📖 Book View", "📝 Text Comparison", "🎧 Audio Player"])
    with tab1:
        render_book_style_text(rewritten_text, "rewritten_text", "🎭 Rewritten Text")
    with tab2:
        col1, col2 = st.columns(2)
        with col1:
            render_book_style_text(original_text, "original_text", "📝 Original Text")
        with col2:
            render_book_style_text(rewritten_text, "rewritten_text_compare", "🎭 Rewritten Text")
    with tab3:
        render_advanced_audio_player(audio_bytes, rewritten_text)

def render_history_panel():
    st.sidebar.markdown("### 📚 History")
    if 'narrations' not in st.session_state:
        st.session_state.narrations = []
    if st.session_state.narrations:
        for i, narration in enumerate(reversed(st.session_state.narrations[-10:])):
            with st.sidebar.expander(f"📖 {narration.timestamp.strftime('%H:%M')} - {narration.tone.value}"):
                st.write(f"**Voice:** {narration.voice.value}")
                st.write(f"**Text:** {narration.original_text[:100]}...")
                if st.button(f"🔄 Reload", key=f"reload_{i}"):
                    st.session_state.current_text = narration.original_text
                    st.session_state.current_tone = narration.tone
                    st.session_state.current_voice = narration.voice
                    st.rerun()
    else:
        st.sidebar.info("No history yet. Create your first audiobook!")

def main():
    render_header()
    if not check_api_keys():
        return
    if 'narrations' not in st.session_state:
        st.session_state.narrations = []
    render_history_panel()
    original_text = render_input_area()
    tone, voice = render_controls()
    if st.button("🎭 Generate Audiobook", type="primary", use_container_width=True):
        if not original_text.strip():
            st.error("Please enter some text to generate an audiobook.")
        else:
            with st.spinner("🎭 Rewriting text and generating audio..."):
                try:
                    rewritten_text = GeminiService.rewrite_text_with_tone(original_text, tone)
                    audio_bytes = TTSService.generate_audio(rewritten_text, voice)
                    if rewritten_text and audio_bytes:
                        narration = Narration(id=datetime.now().strftime('%Y%m%d_%H%M%S'), original_text=original_text, rewritten_text=rewritten_text, tone=tone, voice=voice, timestamp=datetime.now(), audio_bytes=audio_bytes)
                        st.session_state.narrations.append(narration)
                        render_audiobook_display(original_text, rewritten_text, audio_bytes)
                        st.success("🎉 Audiobook generated successfully!")
                    else:
                        st.error("Failed to generate audiobook. Please try again.")
                except Exception as e:
                    st.error(f"Error: {e}")

if __name__ == "__main__":
    main()
