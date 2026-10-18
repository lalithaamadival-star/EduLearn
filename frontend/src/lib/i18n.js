/**
 * AccessEd Multilingual Localization Architecture
 * Supports English, Kannada (ಕನ್ನಡ), and Hindi (हिन्दी).
 */

export const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' }
];

export const translations = {
  en: {
    brand: {
      name: 'AccessEd',
      tagline: 'Learning should adapt to the learner.',
      mission: 'Inclusive learning and multimodal accessibility ecosystem.'
    },
    nav: {
      home: 'Home',
      product: 'Product',
      solutions: 'Solutions',
      accessibility: 'Accessibility',
      ai: 'AI Engine',
      about: 'About',
      contact: 'Contact',
      dashboard: 'Dashboard',
      myLearning: 'My Learning',
      explore: 'Explore',
      assignments: 'Assignments',
      revision: 'Revision',
      aiTutor: 'AI Tutor',
      progress: 'Progress',
      accessibilityCenter: 'Accessibility Center',
      profile: 'Profile',
      signIn: 'Sign In',
      signUp: 'Get Started',
      signOut: 'Sign Out',
      skipToContent: 'Skip to primary content'
    },
    auditory: {
      orientationButton: 'Orientation Status (Alt+O)',
      whereAmI: 'Where am I?',
      whatCanIDo: 'What can I do?',
      whatHappened: 'What just happened?',
      whereGoing: 'Where am I going?'
    },
    lesson: {
      readAloud: 'Read Aloud',
      pauseAudio: 'Pause Audio',
      simplify: 'Simplify Content',
      summarize: 'Summarize',
      original: 'Original Text',
      askAI: 'Ask AI Tutor',
      notes: 'Learning Notes',
      bookmarks: 'Bookmark',
      fontSize: 'Text Scale',
      contrast: 'High Contrast',
      focusMode: 'Focus Mode',
      transcript: 'Full Transcript',
      takeQuiz: 'Take Mastery Quiz',
      markComplete: 'Mark Completed'
    },
    aiTutor: {
      title: 'Contextual AI Tutor',
      subtitle: 'Aware of your active lesson, progress, and accessibility preferences',
      inputPlaceholder: 'Ask a question about this lesson or request clarification...',
      send: 'Ask Tutor',
      listening: 'Listening to your voice...',
      speakQuery: 'Speak your question',
      loading: 'Loading AI response...',
      simplifiedView: 'Cognitive Simplified View',
      readAloudResponse: 'Read Response Aloud',
      explainMistake: 'Explain Quiz Mistake'
    },
    teacher: {
      dashboard: 'Teacher Operations',
      classes: 'Classes',
      courses: 'Courses',
      content: 'Curriculum & Lessons',
      documents: 'Document OCR Intelligence',
      analytics: 'Pedagogical Analytics',
      aiAssistant: 'Teacher AI Co-pilot',
      accessibilityPreview: 'Accessibility Preview'
    }
  },
  kn: {
    brand: {
      name: 'ಆಕ್ಸೆಸ್-ಎಡ್',
      tagline: 'ಕಲಿಕೆಯು ಕಲಿಯುವವರಿಗೆ ಹೊಂದಿಕೊಳ್ಳಬೇಕು.',
      mission: 'ಅಂತರ್ಗತ ಕಲಿಕೆ ಮತ್ತು ಬಹು-ಮಾದರಿ ಪ್ರವೇಶಿಸುವಿಕೆ ಪರಿಸರ ವ್ಯವಸ್ಥೆ.'
    },
    nav: {
      home: 'ಮುಖಪುಟ',
      product: 'ಉತ್ಪನ್ನ',
      solutions: 'ಪರಿಹಾರಗಳು',
      accessibility: 'ಪ್ರವೇಶಿಸುವಿಕೆ',
      ai: 'ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ (AI)',
      about: 'ನಮ್ಮ ಬಗ್ಗೆ',
      contact: 'ಸಂಪರ್ಕಿಸಿ',
      dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
      myLearning: 'ನನ್ನ ಕಲಿಕೆ',
      explore: 'ಅನ್ವೇಷಿಸಿ',
      assignments: 'ಅಸೈನ್‌ಮೆಂಟ್‌ಗಳು',
      revision: 'ಪುನರಾವರ್ತನೆ',
      aiTutor: 'AI ಶಿಕ್ಷಕ',
      progress: 'ಪ್ರಗತಿ',
      accessibilityCenter: 'ಪ್ರವೇಶಿಸುವಿಕೆ ಕೇಂದ್ರ',
      profile: 'ಪ್ರೊಫೈಲ್',
      signIn: 'ಸೈನ್ ಇನ್',
      signUp: 'ಪ್ರಾರಂಭಿಸಿ',
      signOut: 'ಸೈನ್ ಔಟ್',
      skipToContent: 'ಮುಖ್ಯ ವಿಷಯಕ್ಕೆ ತೆರಳಿ'
    },
    auditory: {
      orientationButton: 'ದಿಕ್ಸೂಚಿ ಸ್ಥಿತಿ (Alt+O)',
      whereAmI: 'ನಾನು ಎಲ್ಲಿದ್ದೇನೆ?',
      whatCanIDo: 'ನಾನು ಏನು ಮಾಡಬಹುದು?',
      whatHappened: 'ಈಗಷ್ಟೇ ಏನಾಯಿತು?',
      whereGoing: 'ನಾನು ಎಲ್ಲಿಗೆ ಹೋಗುತ್ತಿದ್ದೇನೆ?'
    },
    lesson: {
      readAloud: 'ಧ್ವನಿ ಓದುವಿಕೆ',
      pauseAudio: 'ಆಡಿಯೋ ನಿಲ್ಲಿಸಿ',
      simplify: 'ವಿಷಯವನ್ನು ಸರಳಗೊಳಿಸಿ',
      summarize: 'ಸಂಕ್ಷಿಪ್ತಗೊಳಿಸಿ',
      original: 'ಮೂಲ ಪಠ್ಯ',
      askAI: 'AI ಟ್ಯೂಟರ್‌ಗೆ ಕೇಳಿ',
      notes: 'ಕಲಿಕೆಯ ಟಿಪ್ಪಣಿಗಳು',
      bookmarks: 'ಬುಕ್‌ಮಾರ್ಕ್',
      fontSize: 'ಪಠ್ಯ ಗಾತ್ರ',
      contrast: 'ಹೆಚ್ಚಿನ ಕಾಂಟ್ರಾಸ್ಟ್',
      focusMode: 'ಗಮನ ಮೋಡ್',
      transcript: 'ಸಂಪೂರ್ಣ ಪ್ರತಿಲೇಖನ',
      takeQuiz: 'ಪರೀಕ್ಷೆ ತೆಗೆದುಕೊಳ್ಳಿ',
      markComplete: 'ಪೂರ್ಣಗೊಂಡಿದೆ ಎಂದು ಗುರುತಿಸಿ'
    },
    aiTutor: {
      title: 'ಸಂದರ್ಭೋಚಿತ AI ಬೋಧಕ',
      subtitle: 'ನಿಮ್ಮ ಸಕ್ರಿಯ ಪಾಠ ಮತ್ತು ಕಲಿಕೆಯ ಆದ್ಯತೆಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುತ್ತದೆ',
      inputPlaceholder: 'ಈ ಪಾಠದ ಬಗ್ಗೆ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ...',
      send: 'ಕೇಳಿ',
      listening: 'ನಿಮ್ಮ ಧ್ವನಿಯನ್ನು ಆಲಿಸಲಾಗುತ್ತಿದೆ...',
      speakQuery: 'ಧ್ವನಿಯಲ್ಲಿ ಮಾತನಾಡಿ',
      loading: 'ಪ್ರತಿಕ್ರಿಯೆಯನ್ನು ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ...',
      simplifiedView: 'ಸರಳೀಕೃತ ನೋಟ',
      readAloudResponse: 'ಗಟ್ಟಿಯಾಗಿ ಓದಿ',
      explainMistake: 'ತಪ್ಪನ್ನು ವಿವರಿಸಿ'
    },
    teacher: {
      dashboard: 'ಶಿಕ್ಷಕರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
      classes: 'ತರಗತಿಗಳು',
      courses: 'ಕೋರ್ಸ್‌ಗಳು',
      content: 'ವಿಷಯ ಮತ್ತು ಪಾಠಗಳು',
      documents: 'ದಾಖಲೆ ಬುದ್ಧಿಮತ್ತೆ (OCR)',
      analytics: 'ವಿಶ್ಲೇಷಣೆ',
      aiAssistant: 'ಶಿಕ್ಷಕರ AI ಸಹಾಯಕ',
      accessibilityPreview: 'ಪ್ರವೇಶಿಸುವಿಕೆ ಪೂರ್ವವೀಕ್ಷಣೆ'
    }
  },
  hi: {
    brand: {
      name: 'एक्सेस-एड',
      tagline: 'शिक्षा को सीखने वाले के अनुकूल होना चाहिए।',
      mission: 'समावेशी शिक्षा और बहु-माध्यम सुगमता पारिस्थितिकी तंत्र।'
    },
    nav: {
      home: 'होम',
      product: 'उत्पाद',
      solutions: 'समाधान',
      accessibility: 'सुगमता (Accessibility)',
      ai: 'एआई इंजन',
      about: 'परिचय',
      contact: 'संपर्क',
      dashboard: 'डैशबोर्ड',
      myLearning: 'मेरी सीख',
      explore: 'खोजें',
      assignments: 'असाइनमेंट',
      revision: 'पुनरावृत्ति (Revision)',
      aiTutor: 'एआई ट्यूटर',
      progress: 'प्रगति',
      accessibilityCenter: 'सुगमता केंद्र',
      profile: 'प्रोफ़ाइल',
      signIn: 'साइन इन',
      signUp: 'शुरू करें',
      signOut: 'साइन आउट',
      skipToContent: 'मुख्य सामग्री पर जाएं'
    },
    auditory: {
      orientationButton: 'अभिविन्यास स्थिति (Alt+O)',
      whereAmI: 'मैं कहाँ हूँ?',
      whatCanIDo: 'मैं क्या कर सकता हूँ?',
      whatHappened: 'अभी क्या हुआ?',
      whereGoing: 'मैं कहाँ जा रहा हूँ?'
    },
    lesson: {
      readAloud: 'बोलकर पढ़ें',
      pauseAudio: 'ऑडियो रोकें',
      simplify: 'सामग्री सरल करें',
      summarize: 'सारांश',
      original: 'मूल पाठ',
      askAI: 'एआई से पूछें',
      notes: 'अध्ययन नोट्स',
      bookmarks: 'बुकमार्क',
      fontSize: 'अक्षर आकार',
      contrast: 'उच्च कंट्रास्ट',
      focusMode: 'फ़ोकस मोड',
      transcript: 'पूर्ण प्रतिलेख (Transcript)',
      takeQuiz: 'प्रश्नोत्तरी दें',
      markComplete: 'पूर्ण चिह्नित करें'
    },
    aiTutor: {
      title: 'प्रासंगिक एआई ट्यूटर',
      subtitle: 'आपके वर्तमान पाठ और सुगमता प्राथमिकताओं से अवगत',
      inputPlaceholder: 'इस पाठ के बारे में प्रश्न पूछें...',
      send: 'पूछें',
      listening: 'आपकी आवाज़ सुनी जा रही है...',
      speakQuery: 'बोलकर पूछें',
      loading: 'एआई उत्तर तैयार हो रहा है...',
      simplifiedView: 'सरल व्याख्या',
      readAloudResponse: 'उत्तर बोलकर सुनाएं',
      explainMistake: 'गलती की व्याख्या'
    },
    teacher: {
      dashboard: 'शिक्षक संचालन',
      classes: 'कक्षाएं',
      courses: 'पाठ्यक्रम',
      content: 'पाठ्यक्रम सामग्री',
      documents: 'दस्तावेज़ ओसीआर (OCR)',
      analytics: 'शैक्षणिक विश्लेषण',
      aiAssistant: 'शिक्षक एआई सह-पायलट',
      accessibilityPreview: 'सुगमता पूर्वावलोकन'
    }
  }
};

export function getTranslation(lang, path, fallback = '') {
  const dictionary = translations[lang] || translations.en;
  const parts = path.split('.');
  let current = dictionary;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      // Fallback to English
      let fallbackCurrent = translations.en;
      for (const fbPart of parts) {
        if (fallbackCurrent && typeof fallbackCurrent === 'object' && fbPart in fallbackCurrent) {
          fallbackCurrent = fallbackCurrent[fbPart];
        } else {
          return fallback || path;
        }
      }
      return fallbackCurrent;
    }
  }
  return current;
}
