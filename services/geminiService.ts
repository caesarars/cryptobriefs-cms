import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY is not set. Please set the environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateBlogPost = async (
  topic: string,
  tone: string,
  length: string,
  targetAudience: string
): Promise<string> => {
  if (!API_KEY) {
    return Promise.resolve("Error: API key not configured. Please contact support.");
  }

  const prompt = `
    You are an expert financial writer specializing in cryptocurrency and blockchain technology for a blog called "Crypto Briefs".
    
    Your task is to write a blog post about the following topic: "${topic}".
    
    Please adhere to the following parameters for the article:
    - **Tone**: ${tone}
    - **Target Audience**: ${targetAudience}
    - **Length**: ${length}

    The post should be well-structured and formatted in Markdown.
    Use markdown for structure, including headings (e.g., '## Subheading'), bulleted lists (e.g., '- List item'), and bold text (e.g., '**bold**').
    Do not include a main title (H1, or '# Title') in the output, as the user has already provided it.
    Make sure is compatible with ReactMarkdown library
    And make sure it has escape string because it will be copied into Postman
    Start directly with the main content of the article.
    AND PLEASE DO NOT WRAP it by DOUBLE QUOTES
    `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 1,
        topK: 32,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating blog post:", error);
    return "An error occurred while generating the blog post. Please try again.";
  }
};

export const generateOptimizedTitle = async (currentTitle: string): Promise<string> => {
  if (!API_KEY) {
    return Promise.resolve("Error: API key not configured.");
  }

  const prompt = `
    You are an expert copywriter and SEO specialist. Your task is to take a blog post title and make it more compelling, engaging, and SEO-friendly.
    Keep the core topic the same, but improve the wording to attract more readers.
    Do not add quotes or any extra explanatory text around your response. Only return the improved title as a single line of plain text.
    Make sure the optimized title is not too long
    Original Title: "${currentTitle}"

    Optimized Title:
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
       config: {
        temperature: 0.8,
      }
    });
    // Clean up response to remove potential quotes
    return response.text.replace(/"/g, '').trim();
  } catch (error) {
    console.error("Error generating optimized title:", error);
    return "Failed to generate title.";
  }
};

export const generateIdeas = async (): Promise<string> => {
  try {
    const prompt = `
      You are an expert SEO strategist and crypto researcher.
      First, review the latest macro trends in crypto, blockchain, and web3 from the past 90 days: institutional Bitcoin flows & ETFs, ETH restaking/L2 expansion, AI-integrated tokens, real-world asset tokenization, Web3 gaming, and regulatory shifts in US/EU/Asia.
      Extract the 3–4 most promising topics based on traction + low competition long-tail keywords.
      For each topic, craft 2–3 concise headline ideas targeting niche audiences (builders, founders, retail traders, DAO contributors, etc.).
      Requirements:
      - 10 total titles, numbered 1-10 (plain text, no markdown bulleting).
      - Each title <= 14 words, highlight action or insight.
      - Include a specific hook (data point, timeframe, region, protocol, or narrative).
      - Mix tones: analytical, experimental, regulatory, community-focused.
    `
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
       config: {
        temperature: 0.8,
      }
    });

    return response.text.replace(/"/g, '').trim();
  } catch (error) {
    console.error("Error generating ideas title:", error);
    return "Failed to generate title.";
  }
}

const compressBase64Image = async (
  base64ImageBytes: string,
  options: { maxWidth?: number; maxHeight?: number; quality?: number } = {}
): Promise<string> => {
  const { maxWidth = 1280, maxHeight = 720, quality = 0.75 } = options;

  if (typeof document === "undefined") {
    // Server-side fallback when canvas APIs are not available.
    return Promise.resolve(base64ImageBytes);
  }

  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      let { width, height } = image;
      const aspectRatio = width / height;

      if (width > maxWidth) {
        width = maxWidth;
        height = Math.round(width / aspectRatio);
      }

      if (height > maxHeight) {
        height = maxHeight;
        width = Math.round(height * aspectRatio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");
      if (!context) {
        resolve(base64ImageBytes);
        return;
      }

      context.drawImage(image, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      const compressedBase64 = dataUrl.split(",")[1];
      resolve(compressedBase64 || base64ImageBytes);
    };

    image.onerror = () => resolve(base64ImageBytes);
    image.src = `data:image/jpeg;base64,${base64ImageBytes}`;
  });
};

export const generateImage = async (title: string, tone: string) => {
  if (!API_KEY) {
    return Promise.resolve("Error: API key not configured.");
  }

  const prompt = `
    help me to generate an image for my image cover in medium.com for my artitle titled: ${title} with tone: ${tone}
  `;

  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-preview-06-06',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '16:9',
      },
    });

    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    const compressedBase64 = await compressBase64Image(base64ImageBytes);
    const responseImage = {
      previewImage:`data:image/jpeg;base64,${compressedBase64}`,
      base64:compressedBase64
    }
    return responseImage;
  } catch (error) {
    console.error("Error generating image:", error);
    return "An error occurred while generating the image. Please try again.";
  }
};
