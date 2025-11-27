
import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Globe, Key, Eye, EyeOff, Server, Box, Cpu, MessageSquare } from 'lucide-react';
import { getUserSettings, saveUserSettings } from '../services/storageService';
import Button from './Button';
import { SummaryLanguage, AIProvider } from '../types';

interface SettingsProps {
  onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const [language, setLanguage] = useState<SummaryLanguage>('zh');
  const [provider, setProvider] = useState<AIProvider>('gemini');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [modelName, setModelName] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const settings = getUserSettings();
    setLanguage(settings.language);
    setProvider(settings.provider);
    setApiKey(settings.apiKey || '');
    setBaseUrl(settings.baseUrl || 'https://api.openai.com/v1');
    setModelName(settings.modelName || 'gpt-3.5-turbo');
    setCustomPrompt(settings.customPrompt || '');
  }, []);

  const handleSave = () => {
    saveUserSettings({
      language,
      provider,
      apiKey: apiKey.trim(),
      baseUrl: baseUrl.trim(),
      modelName: modelName.trim(),
      customPrompt: customPrompt.trim()
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
         <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-800 underline">
          &larr; Back
        </button>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-slate-600" />
          Settings
        </h2>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
        
        {/* Language Section */}
        <section className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
              <Globe className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-800">Summary Language</h3>
              <p className="text-sm text-slate-500 mt-1">
                Choose the language for the generated work summaries.
              </p>
              <div className="mt-3 flex flex-col sm:flex-row gap-4">
                <label className={`
                  flex-1 max-w-[200px] cursor-pointer border rounded-lg p-4 flex items-center gap-3 transition-all
                  ${language === 'zh' ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500' : 'border-slate-200 hover:border-purple-300'}
                `}>
                  <input 
                    type="radio" 
                    name="language" 
                    value="zh" 
                    checked={language === 'zh'} 
                    onChange={() => setLanguage('zh')}
                    className="accent-purple-600"
                  />
                  <span className="font-medium text-slate-700">中文 (Chinese)</span>
                </label>

                <label className={`
                  flex-1 max-w-[200px] cursor-pointer border rounded-lg p-4 flex items-center gap-3 transition-all
                  ${language === 'en' ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500' : 'border-slate-200 hover:border-purple-300'}
                `}>
                  <input 
                    type="radio" 
                    name="language" 
                    value="en" 
                    checked={language === 'en'} 
                    onChange={() => setLanguage('en')}
                    className="accent-purple-600"
                  />
                  <span className="font-medium text-slate-700">English</span>
                </label>
              </div>
            </div>
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* API Configuration Section */}
        <section className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-800">Universal API Configuration</h3>
              <p className="text-sm text-slate-500 mt-1 mb-4">
                Configure the AI model provider. You can use Google Gemini or any OpenAI-compatible provider (like DeepSeek, ChatGPT, LocalLLM, etc.).
              </p>
              
              {/* Provider Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">AI Provider</label>
                <div className="flex flex-col sm:flex-row gap-4">
                    <label className={`
                    flex-1 cursor-pointer border rounded-lg p-3 flex items-center gap-2 transition-all
                    ${provider === 'gemini' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 hover:border-blue-300'}
                    `}>
                    <input 
                        type="radio" 
                        name="provider" 
                        value="gemini" 
                        checked={provider === 'gemini'} 
                        onChange={() => setProvider('gemini')}
                        className="accent-blue-600"
                    />
                    <span className="font-medium text-slate-700">Google Gemini</span>
                    </label>

                    <label className={`
                    flex-1 cursor-pointer border rounded-lg p-3 flex items-center gap-2 transition-all
                    ${provider === 'openai' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 hover:border-blue-300'}
                    `}>
                    <input 
                        type="radio" 
                        name="provider" 
                        value="openai" 
                        checked={provider === 'openai'} 
                        onChange={() => setProvider('openai')}
                        className="accent-blue-600"
                    />
                    <span className="font-medium text-slate-700">OpenAI Compatible (ChatGPT/DeepSeek)</span>
                    </label>
                </div>
              </div>

              {/* Dynamic Fields */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
                  {/* API Key (Common) */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                        <Key className="w-4 h-4 text-slate-400" />
                        API Key
                    </label>
                    <div className="relative">
                        <input
                        type={showKey ? "text" : "password"}
                        className="w-full border border-slate-300 rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-sm"
                        placeholder={provider === 'gemini' ? "AIzaSy..." : "sk-..."}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        />
                        <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                        {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {provider === 'gemini' && (
                        <p className="text-xs text-slate-400 mt-1">Leave blank to use default environment key if available.</p>
                    )}
                  </div>

                  {/* OpenAI Specific Fields */}
                  {provider === 'openai' && (
                      <>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                <Server className="w-4 h-4 text-slate-400" />
                                Base URL
                            </label>
                            <input
                                type="text"
                                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-sm"
                                placeholder="https://api.openai.com/v1"
                                value={baseUrl}
                                onChange={(e) => setBaseUrl(e.target.value)}
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                e.g., <code>https://api.deepseek.com</code> or <code>https://api.openai.com/v1</code>
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                <Box className="w-4 h-4 text-slate-400" />
                                Model Name
                            </label>
                            <input
                                type="text"
                                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-sm"
                                placeholder="gpt-3.5-turbo"
                                value={modelName}
                                onChange={(e) => setModelName(e.target.value)}
                            />
                             <p className="text-xs text-slate-500 mt-1">
                                e.g., <code>gpt-4o</code>, <code>deepseek-chat</code>, <code>deepseek-reasoner</code>
                            </p>
                        </div>
                      </>
                  )}
              </div>
            </div>
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* Custom Prompt Section */}
        <section className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-lg text-green-600">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-800">Custom AI Instructions</h3>
              <p className="text-sm text-slate-500 mt-1 mb-2">
                Define exactly how you want your summary to look. If provided, this will override the default templates.
              </p>
              <textarea
                className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:outline-none text-sm leading-relaxed min-h-[120px]"
                placeholder="e.g., 'You are a strict editor. Summarize the work logs into a JSON format containing keys: date, highlights, and issues.' or 'Please summarize using a casual, friendly tone.'"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
              />
              <p className="text-xs text-slate-400 mt-2">
                If left empty, the app will use the default professional summary template in the selected language.
              </p>
            </div>
          </div>
        </section>

        <div className="pt-4">
            <Button onClick={handleSave} className="w-full md:w-auto min-w-[120px]">
                {saved ? 'Saved!' : 'Save Settings'}
                <Save className="w-4 h-4 ml-2" />
            </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
