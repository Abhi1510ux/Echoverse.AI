# EchoVerse Pro - Professional AI Audiobook Creator

🏆 **Single-File Professional Platform** - A sophisticated AI-powered audiobook creation tool built with Streamlit in a single `app.py` file. Features enterprise-grade security, 12 professional tones, and 8 premium voices.

## 🚀 Features

### 🎭 Advanced AI Tones (12 Options)
- **Neutral**: Clear, objective presentation
- **Suspenseful**: Builds tension and mystery  
- **Inspiring**: Motivational and uplifting
- **Dramatic**: Emotionally intense and powerful
- **Humorous**: Witty and entertaining
- **Romantic**: Passionate and tender
- **Mysterious**: Intriguing and enigmatic
- **Epic**: Grand and heroic
- **Calm**: Peaceful and serene
- **Energetic**: Dynamic and exciting
- **Nostalgic**: Sentimental and wistful
- **Professional**: Formal and authoritative

### 🎧 Premium Voice Options (8 Voices)
**Female Voices:**
- **Sophia**: Warm and engaging
- **Emma**: Clear and articulate  
- **Olivia**: Soft and gentle
- **Ava**: Confident and strong

**Male Voices:**
- **Alexander**: Deep and authoritative
- **Benjamin**: Smooth and professional
- **Christopher**: Authoritative and commanding
- **Daniel**: Friendly and approachable

### 🎨 Professional UI/UX
- **Modern Design**: Beautiful gradients and animations
- **Book-Style Display**: Professional book formatting
- **Advanced Audio Player**: Volume and speed controls
- **Text Highlighting**: Words highlight during playback
- **Tabbed Interface**: Organized, intuitive layout
- **Responsive Design**: Works perfectly on all devices

## 📁 Simple File Structure

```
book/
├── app.py              # Everything in one file!
├── api_keys.txt        # Your API keys
├── requirements.txt    # Dependencies
└── README.md          # This file
```

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Add Your API Keys
Edit `api_keys.txt` and replace the placeholder values:
```bash
GEMINI_API_KEY=your_actual_gemini_api_key
HUGGINGFACE_API_KEY=your_actual_huggingface_api_key
```

**Get your API keys from:**
- **Gemini**: https://makersuite.google.com/app/apikey
- **Hugging Face**: https://huggingface.co/settings/tokens

### 3. Run the App
```bash
streamlit run app.py
```

## 🎯 How to Use

1. **Input Text**: Upload a .txt file or paste your text
2. **Select Tone**: Choose from 12 professional tones
3. **Select Voice**: Pick from 8 premium voices
4. **Generate**: Click "Generate Audiobook"
5. **Enjoy**: 
   - **Book View**: Professional book-style display
   - **Text Comparison**: Side-by-side original vs rewritten
   - **Audio Player**: Advanced controls with text highlighting

## 🏆 Advanced Features

- **Volume Control**: Adjust audio volume (0-100%)
- **Speed Control**: Change playback speed (0.5x to 2.0x)
- **Text Highlighting**: Words highlight as audio plays
- **Book-Style Formatting**: Beautiful book-like layout
- **History Panel**: Track and reload past creations
- **Download Audio**: Save your audiobooks

## 💼 Use Cases

- **📚 Publishing**: Convert books to audiobooks
- **🎓 Education**: Create engaging educational content
- **📢 Marketing**: Generate compelling audio content
- **🎬 Entertainment**: Produce audio dramas
- **🏢 Corporate**: Create professional training materials
- **♿ Accessibility**: Make content accessible

## 🏆 Why EchoVerse Pro Wins

1. **Single File**: Everything in one `app.py` file
2. **12 Professional Tones**: More variety than competitors
3. **8 Premium Voices**: Character-based naming
4. **Modern UI/UX**: Beautiful, professional design
5. **Advanced Features**: Volume, speed, highlighting
6. **Book-Style Display**: Professional formatting
7. **Easy Setup**: Just edit one text file for API keys

## 🔧 Technical Details

- **Framework**: Streamlit
- **AI Text Processing**: Google Gemini 1.5 Flash
- **Text-to-Speech**: Hugging Face TTS models
- **Audio Format**: WAV (downloadable)
- **Text Limit**: 500 characters for optimal TTS performance

## 📝 Notes

- Keep `api_keys.txt` secure and don't share it
- Generated audio is limited to 500 characters for optimal performance
- All processing happens in real-time
- No data is permanently stored on the server

---

**Built for Hackathon Excellence. Ready for the Real World.** 🎭✨