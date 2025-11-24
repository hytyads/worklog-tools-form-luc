import { GoogleGenAI } from "@google/genai";
import { WorkRecord } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateWorkSummary = async (
  records: WorkRecord[],
  startDate: string,
  endDate: string
): Promise<string> => {
  if (records.length === 0) {
    return "No records found for this period.";
  }

  // Group text by date for context
  const groupedText = records.reduce((acc, record) => {
    acc += `- [${record.date}]: ${record.content}\n`;
    return acc;
  }, "");

  const prompt = `
    You are a professional project manager assistant. 
    Below are work logs from ${startDate} to ${endDate}.
    Please generate a concise, professional work summary report in Markdown format.
    Group similar tasks if possible, highlight key achievements, and organize it using bullet points.
    
    Work Logs:
    ${groupedText}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "Failed to generate summary.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "An error occurred while generating the summary. Please check your API key or network connection.";
  }
};