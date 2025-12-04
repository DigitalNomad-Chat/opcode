import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import i18nDebugger from '@/i18n/debug';

/**
 * 开发环境下的i18n测试面板
 * 只在开发模式下显示
 */
export const I18nTestPanel: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();
  const [showDebug, setShowDebug] = useState(false);

  // 只在开发环境下显示
  if (import.meta.env.MODE !== "development") {
    return null;
  }

  const testTranslations = [
    'prompt.placeholder',
    'send',
    'expand',
    'projects',
    'settings',
    'agents',
    'usage',
    'mcp',
    'tabs.new',
    'tabs.close',
    'tabs.projects',
    'tabs.settings',
    'tabs.agents',
    'tabs.usage',
    'tabs.mcp',
    'status.checking',
    'status.loading',
    'status.error',
    'status.success'
  ];

  const handleLanguageSwitch = async (lang: 'zh' | 'en') => {
    await changeLanguage(lang);
    console.log(`🌐 Language switched to: ${lang}`);
  };

  const handleDebugCheck = () => {
    i18nDebugger.checkStatus();
    setShowDebug(true);
  };

  const handleTestTranslations = () => {
    i18nDebugger.testTranslations();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="p-4 max-w-md max-h-96 overflow-y-auto bg-background/95 backdrop-blur">
        <h3 className="text-sm font-semibold mb-3">🌍 i18n Test Panel</h3>

        <div className="space-y-3">
          {/* 当前语言信息 */}
          <div className="text-xs">
            <span className="font-medium">Current Language: </span>
            <span className="text-primary">{currentLanguage}</span>
          </div>

          {/* 语言切换按钮 */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={currentLanguage === 'zh' ? 'default' : 'outline'}
              onClick={() => handleLanguageSwitch('zh')}
            >
              中文
            </Button>
            <Button
              size="sm"
              variant={currentLanguage === 'en' ? 'default' : 'outline'}
              onClick={() => handleLanguageSwitch('en')}
            >
              English
            </Button>
          </div>

          {/* 调试按钮 */}
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={handleDebugCheck}>
              Check Status
            </Button>
            <Button size="sm" variant="secondary" onClick={handleTestTranslations}>
              Test Keys
            </Button>
          </div>

          {/* 翻译测试 */}
          <div className="border-t pt-2">
            <h4 className="text-xs font-medium mb-2">Translation Tests:</h4>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {testTranslations.map((key) => (
                <div key={key} className="text-xs">
                  <span className="text-muted-foreground">{key}: </span>
                  <span className={t(key) === key ? 'text-red-500 italic' : ''}>
                    {t(key)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 调试信息 */}
          {showDebug && (
            <div className="border-t pt-2">
              <h4 className="text-xs font-medium mb-2">Debug Info:</h4>
              <div className="text-xs space-y-1">
                <div>i18n.isInitialized: {String(i18n.isInitialized)}</div>
                <div>FallbackLng: {String(i18n.options.fallbackLng)}</div>
                <div>Available Languages: {Object.keys(i18n.options.resources || {}).join(', ')}</div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};