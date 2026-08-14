import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Placeholder for translation files
// Once DeepL translates popups.sample.json, we will load them here or in components.
const resources = {
  en: {
    translation: {
      "Start Exploring": "Start Exploring",
      "Where are you from?": "Where are you from?",
      "What are you interested in?": "What are you interested in?",
      "Reviews": "Reviews",
      "Saved": "Saved"
    }
  },
  ko: {
    translation: {
      "Start Exploring": "탐험 시작하기",
      "Where are you from?": "어디서 오셨나요?",
      "What are you interested in?": "어떤 분야에 관심이 있나요?",
      "Reviews": "리뷰",
      "Saved": "저장됨"
    }
  },
  zh: {
    translation: {
      "Start Exploring": "开始探索",
      "Where are you from?": "你来自哪里？",
      "What are you interested in?": "你对什么感兴趣？",
      "Reviews": "评论",
      "Saved": "已保存"
    }
  },
  ja: {
    translation: {
      "Start Exploring": "探索を始める",
      "Where are you from?": "出身はどちらですか？",
      "What are you interested in?": "何に興味がありますか？",
      "Reviews": "レビュー",
      "Saved": "保存済み"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
