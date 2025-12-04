import i18n from './index';

/**
 * i18n调试工具 - 用于诊断翻译问题
 */
export const i18nDebugger = {
  /**
   * 检查i18n状态
   */
  checkStatus() {
    console.group('🌍 i18n Status Check');
    console.log('Current language:', i18n.language);
    console.log('Supported languages:', Object.keys(i18n.options.resources || {}));
    console.log('Available translation keys:', this.getTranslationKeys());
    console.log('Fallback language:', i18n.options.fallbackLng);
    console.log('Is initialized:', i18n.isInitialized);
    console.groupEnd();
  },

  /**
   * 获取所有翻译键
   */
  getTranslationKeys(): string[] {
    const keys: string[] = [];
    const currentLang = i18n.language;
    const resources = (i18n.options.resources as any)?.[currentLang]?.translation;

    if (resources) {
      const extractKeys = (obj: any, prefix = ''): void => {
        Object.keys(obj).forEach(key => {
          const fullKey = prefix ? `${prefix}.${key}` : key;
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            extractKeys(obj[key], fullKey);
          } else {
            keys.push(fullKey);
          }
        });
      };
      extractKeys(resources);
    }

    return keys;
  },

  /**
   * 检查特定翻译键是否存在
   */
  checkTranslation(key: string, language?: string) {
    const lang = language || i18n.language;
    const translation = i18n.getResource(lang, 'translation', key);
    console.log(`📝 Translation for "${key}" (${lang}):`, translation || '❌ Not found');
    return translation;
  },

  /**
   * 测试翻译功能
   */
  testTranslations() {
    console.group('🧪 Testing Translations');
    const testKeys = [
      'prompt.placeholder',
      'send',
      'projects',
      'settings',
      'agents',
      'usage',
      'mcp',
      'tabs.new',
      'tabs.close',
      'status.checking'
    ];

    testKeys.forEach(key => {
      this.checkTranslation(key);
      this.checkTranslation(key, 'en');
      this.checkTranslation(key, 'zh');
    });
    console.groupEnd();
  },

  /**
   * 强制重新加载翻译资源
   */
  reloadResources() {
    console.log('🔄 Reloading i18n resources...');
    i18n.reloadResources();
  }
};

// 在开发环境下自动运行状态检查
if (import.meta.env.MODE === "development") {
  // 延迟检查，确保i18n完全初始化
  setTimeout(() => {
    i18nDebugger.checkStatus();
  }, 1000);
}

export default i18nDebugger;