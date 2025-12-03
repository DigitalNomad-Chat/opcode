import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 中英文翻译（YAGNI：仅关键UI）
const resources = {
  en: {
    translation: {
      'prompt.placeholder': 'Message Claude (@ for files, / for commands)...',
      'send': 'Send',
      'expand': 'Expand (Ctrl+Shift+E)',
      'model': 'Model',
      'thinking': 'Thinking',
      'drop.images': 'Drop images here...',
      // 扩展更多...
    }
  },
  zh: {
    translation: {
      'prompt.placeholder': '输入消息 (@文件 /命令)...',
      'send': '发送',
      'expand': '展开 (Ctrl+Shift+E)',
      'model': '模型',
      'thinking': '思考模式',
      'drop.images': '拖放图片...',
    }
  }
};

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources,
    lng: 'zh', // 默认中文
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

export default i18n;
