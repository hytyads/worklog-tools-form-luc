
import { GoogleGenAI } from "@google/genai";
import { WorkRecord, UserSettings } from "../types";

export const generateWorkSummary = async (
  records: WorkRecord[],
  startDate: string,
  endDate: string,
  settings: UserSettings
): Promise<string> => {
  const { language, provider, apiKey, baseUrl, modelName, customPrompt } = settings;

  if (records.length === 0) {
    return language === 'zh' ? "该时间段内没有记录。" : "No records found for this period.";
  }

  // Group text by date for context
  const groupedText = records.reduce((acc, record) => {
    acc += `- [${record.date}]: ${record.content}\n`;
    return acc;
  }, "");

  let systemPrompt = "";
  let userPrompt = "";

  // If a custom prompt is provided, use it as the system instruction and keep the data separate.
  if (customPrompt && customPrompt.trim().length > 0) {
    systemPrompt = customPrompt.trim();
    userPrompt = `
      Time Range: ${startDate} to ${endDate}
      
      Work Logs:
      ${groupedText}
    `;
  } else {
    // Default logic
    if (language === 'zh') {
      systemPrompt = "你是一个专业的项目管理助手。请生成一份简洁、专业的工作周报/总结，使用 Markdown 格式。";
      userPrompt = `
        时间范围: ${startDate} 到 ${endDate}
        要求：
        1. 使用中文回答。
        2. 将相似的任务进行归类。
        3. 突出主要成就。
        4. 使用无序列表（Bullet points）组织内容。
        
        工作日志:
        ${groupedText}
      `;
    } else {
      systemPrompt = "You are a professional project manager assistant. Please generate a concise, professional work summary report in Markdown format.";
      userPrompt = `
        Time Range: ${startDate} to ${endDate}
        Requirements:
        1. Respond in English.
        2. Group similar tasks if possible.
        3. Highlight key achievements.
        4. Organize it using bullet points.
        
        Work Logs:
        ${groupedText}
      `;
    }
  }

  try {
    // ---------------------------------------------------------
    // Provider: Google Gemini (Official SDK)
    // ---------------------------------------------------------
    if (provider === 'gemini') {
      const key = apiKey || process.env.API_KEY;
      
      if (!key) {
        throw new Error(language === 'zh' 
          ? "未找到 Google API Key。请在设置中配置。" 
          : "Google API Key not found. Please configure it in Settings.");
      }

      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `${systemPrompt}\n\n${userPrompt}`,
      });
      
      return response.text || (language === 'zh' ? "未能生成总结。" : "Failed to generate summary.");
    } 
    
    // ---------------------------------------------------------
    // Provider: OpenAI Compatible (ChatGPT, DeepSeek, etc.)
    // ---------------------------------------------------------
    else if (provider === 'openai') {
      if (!apiKey) {
        throw new Error(language === 'zh' ? "未找到 API Key。" : "API Key is required.");
      }
      if (!baseUrl) {
        throw new Error(language === 'zh' ? "未配置 Base URL。" : "Base URL is required.");
      }

      // Ensure proper endpoint format. 
      // User might enter "https://api.deepseek.com" or "https://api.deepseek.com/chat/completions"
      // Standard OpenAI libs take base url like "https://api.deepseek.com/v1" and append "/chat/completions"
      // We will normalize simple cases.
      let endpoint = baseUrl.trim();
      if (!endpoint.endsWith('/chat/completions')) {
         // If it ends with slash, remove it before appending
         if (endpoint.endsWith('/')) endpoint = endpoint.slice(0, -1);
         endpoint = `${endpoint}/chat/completions`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: modelName || 'gpt-3.5-turbo',
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(`API Error ${response.status}: ${errData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      return content || (language === 'zh' ? "API 返回内容为空。" : "API returned empty content.");
    }

    throw new Error("Unknown provider");

  } catch (error) {
    console.error("AI Generation Error:", error);
    const msg = (error as Error).message;
    return language === 'zh'
      ? `生成总结时发生错误: ${msg}`
      : `An error occurred while generating the summary: ${msg}`;
  }
};
