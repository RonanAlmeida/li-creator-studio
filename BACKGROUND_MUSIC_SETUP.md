# Background Music Setup

## ✅ Backend Ready!

The video generation pipeline now supports mixing lofi background music with narration audio!

## 🎵 How It Works:

When generating a video, the system will:
1. Generate narration audio from your script (ElevenLabs)
2. Mix narration (100% volume) + background music (20% volume)
3. Apply mixed audio to video with captions

## 📁 Adding Lofi Tracks:

### Step 1: Add MP3 Files
Place your lofi music files in:
```
public/background-music/
```

Example:
```
public/background-music/
├── lofi-chill.mp3
├── lofi-study.mp3
└── lofi-relaxing.mp3
```

### Step 2: Update the Track List
Edit `lib/constants/background-music.ts` and add your tracks:

```typescript
export const BACKGROUND_MUSIC_TRACKS: BackgroundMusic[] = [
  {
    id: 'none',
    name: 'None',
    description: 'No background music',
    filename: '',
  },
  {
    id: 'lofi-chill',
    name: 'Lofi Chill',
    description: 'Relaxing lofi beats',
    filename: 'lofi-chill.mp3',
    duration: 120,
  },
  {
    id: 'lofi-study',
    name: 'Lofi Study',
    description: 'Focus and productivity',
    filename: 'lofi-study.mp3',
    duration: 180,
  },
];
```

### Step 3: Create the Dropdown Component
You'll need to create a `BackgroundMusicSelector` component (similar to `VoiceSelector`) with:
- Dropdown showing all tracks
- "None" option (no background music)
- Selected track passed to API

### Step 4: Update Frontend
In `app/page.tsx`, add:
```typescript
const [selectedBackgroundMusic, setSelectedBackgroundMusic] = useState('');

// In handleGenerate:
const video = await overlayAudioAndCaptions(
  text,
  selectedVoiceId,
  captionOptions,
  selectedBackgroundMusic  // Pass selected track filename
);
```

## 🎚️ Audio Mixing:

Current settings:
- **Narration**: 100% volume (full volume)
- **Background Music**: 20% volume (subtle background)

To adjust, edit `lib/services/video-overlay.service.ts`:
```typescript
'[1:a]volume=1.0[narration]',    // Change narration volume (0.0-2.0)
'[2:a]volume=0.2[bgmusic]',      // Change background volume (0.0-1.0)
```

## 🎵 Where to Get Lofi Music:

**Royalty-Free Sources:**
- YouTube Audio Library
- Pixabay Music
- Bensound
- Purple Planet Music
- Free Music Archive

**Make sure to use royalty-free tracks for commercial use!**

## 🧪 Testing:

1. Add a lofi MP3 to `public/background-music/`
2. Update `background-music.ts` with the track info
3. Create dropdown UI component
4. Generate a video with background music selected
5. Video should have narration + quiet lofi in the background!
