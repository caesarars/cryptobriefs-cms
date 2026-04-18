import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;
const IMAGE_MODEL = "imagen-4.0-generate-001";

if (!API_KEY) {
  console.error("API_KEY is not set. Please set the environment variable.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

type GeneratedImageResult = {
  previewImage: string;
  base64: string;
};

export const generateBlogPost = async (
  topic: string,
  tone: string,
  length: string,
  targetAudience: string
): Promise<string> => {
  if (!ai) {
    return Promise.resolve("Error: API key not configured. Please contact support.");
  }

  const prompt = `
    You are an expert crypto content strategist, SEO writer, and financial editor writing for "Crypto Briefs".

    Create a Markdown-formatted SEO content brief followed by a structured blog article for this topic:
    "${topic}"

    Writing requirements:
    - Tone: ${tone}
    - Target Audience: ${targetAudience}
    - Length Preference: ${length}
    - Niche: cryptocurrency, blockchain, web3, digital assets, and related market or protocol analysis

    Return the response in valid Markdown only.
    Do not wrap the entire response in quotes, JSON, or code fences.
    Keep the output easy to render in React Markdown.

    The response must start with this exact Markdown pattern:
    **Title:** {SEO-optimized title with primary keyword}
    **Primary Keyword:** {keyword} (target density: 1-2%)
    **Secondary Keywords:** {kw1}, {kw2}
    **Search Intent:** {informational | transactional | navigational}
    **Target Word Count:** {count}

    ### Structure
    1. Introduction (hook + problem statement + what they will learn)
    2. {H2 Section 1} - {keyword angle}
    3. {H2 Section 2} - {keyword angle}
    4. {H2 Section 3} - {keyword angle}
    5. {H2 Section 4 - optional} - {keyword angle}
    6. Conclusion (summary + CTA)

    After that structure block, write the full article in Markdown.

    Article rules:
    - Use the generated Title as an H1 heading.
    - Follow the declared structure closely.
    - Before drafting, use Google Search to verify the latest prices, protocol updates, regulatory actions, and news tied to the topic so the article reflects current reality. Prefer recent reputable sources (CoinDesk, Cointelegraph, The Block, Messari, official project blogs, regulator statements).
    - Include an engaging introduction, clear H2 sections, and a conclusion with a concise CTA.
    - Naturally use the primary keyword throughout the article.
    - Use secondary keywords where relevant without keyword stuffing.
    - Include short paragraphs, occasional bullet lists where useful, and practical examples or insights when appropriate.
    - Keep claims measured and credible. Do not fabricate precise data — only cite figures, dates, or quotes that appear in live search results.
    - Avoid filler, vague hype, and repetitive phrasing.
    - Make the article useful for search intent and readable for humans.
    `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 1,
        topK: 32,
        tools: [{ googleSearch: {} }],
      }
    });
    return response.text ?? "No content generated.";
  } catch (error) {
    console.error("Error generating blog post:", error);
    return "An error occurred while generating the blog post. Please try again.";
  }
};

export const generateOptimizedTitle = async (currentTitle: string): Promise<string> => {
  if (!ai) {
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
      model: 'gemini-2.5-pro',
      contents: prompt,
       config: {
        temperature: 0.8,
      }
    });
    // Clean up response to remove potential quotes
    return (response.text ?? "Failed to generate title.").replace(/"/g, '').trim();
  } catch (error) {
    console.error("Error generating optimized title:", error);
    return "Failed to generate title.";
  }
};

export const generateIdeas = async (): Promise<string> => {
  if (!ai) {
    return Promise.resolve("Error: API key not configured.");
  }
  try {
    const prompt = `
      You are an expert SEO strategist and crypto researcher.
      Use Google Search to review the latest macro trends in crypto, blockchain, and web3 from the past 90 days: institutional Bitcoin flows & ETFs, ETH restaking/L2 expansion, AI-integrated tokens, real-world asset tokenization, Web3 gaming, and regulatory shifts in US/EU/Asia. Cite only verifiable developments surfaced in live search results — do not invent data.
      Extract the 3–4 most promising topics based on traction + low competition long-tail keywords.
      For each topic, craft 2–3 concise headline ideas targeting niche audiences (builders, founders, retail traders, DAO contributors, etc.).
      Requirements:
      - 10 total titles, numbered 1-10 (plain text, no markdown bulleting).
      - Each title <= 14 words, highlight action or insight.
      - Include a specific hook (data point, timeframe, region, protocol, or narrative).
      - Mix tones: analytical, experimental, regulatory, community-focused.
    `
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
       config: {
        temperature: 0.8,
        tools: [{ googleSearch: {} }],
      }
    });

    return (response.text ?? "Failed to generate title.").replace(/"/g, '').trim();
  } catch (error) {
    console.error("Error generating ideas title:", error);
    return "Failed to generate title.";
  }
}


export const generateIdeasTrends = async (): Promise<string> => {
  if (!ai) {
    return Promise.resolve("Error: API key not configured.");
  }
  try {
    const prompt = `
      You are an expert SEO strategist and crypto researcher.
      Use Google Search to aggregate the most viral crypto stories from the past 24 hours across CoinDesk, Cointelegraph, The Block, Messari intel, X trending threads, Telegram alpha chats, Discord NFT servers, and other reputable aggregators. Ground every headline in a real story surfaced via live search — no speculation or fabricated figures.
      Prioritize news that is exploding in social mentions, whale wallet movements, volume spikes, governance votes, exploits, regulatory actions, or funding announcements touching BTC, ETH, and emerging tokens.
      Extract the 3–4 most promising topics based on traction + low competition long-tail keywords.
      For each topic, craft 2–3 concise headline ideas targeting niche audiences (builders, founders, retail traders, DAO contributors, etc.).
      Requirements:
      - 10 total titles, numbered 1-10 (plain text, no markdown bulleting).
      - Each title <= 14 words, highlight action or insight.
      - Include a specific hook (data point, timeframe, region, protocol, or narrative).
      - Mix tones: analytical, experimental, regulatory, community-focused.
    `
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
       config: {
        temperature: 0.8,
        tools: [{ googleSearch: {} }],
      }
    });

    return (response.text ?? "Failed to generate title.").replace(/"/g, '').trim();
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

export type SectionIllustration = {
  heading: string;
  base64: string;
  previewImage: string;
};

const SECTION_SKIP_KEYWORDS = ['introduction', 'conclusion', 'summary', 'cta', 'call to action'];

const parseH2Sections = (markdown: string): { heading: string; bodyPreview: string }[] => {
  const lines = markdown.split('\n');
  const sections: { heading: string; bodyPreview: string }[] = [];
  let currentHeading = '';
  let currentBody: string[] = [];

  const flush = () => {
    if (currentHeading) {
      sections.push({
        heading: currentHeading,
        bodyPreview: currentBody.join(' ').replace(/\s+/g, ' ').trim().slice(0, 400),
      });
    }
  };

  for (const line of lines) {
    if (/^##\s+/.test(line) && !/^###\s+/.test(line)) {
      flush();
      currentHeading = line.replace(/^##\s+/, '').trim();
      currentBody = [];
    } else if (currentHeading) {
      currentBody.push(line);
    }
  }
  flush();
  return sections;
};

export const generateSectionIllustrations = async (
  markdown: string,
  options: { max?: number; skipKeywords?: string[] } = {}
): Promise<SectionIllustration[]> => {
  if (!ai) {
    return [];
  }
  const { max = 4, skipKeywords = SECTION_SKIP_KEYWORDS } = options;

  const eligible = parseH2Sections(markdown)
    .filter((s) => !skipKeywords.some((kw) => s.heading.toLowerCase().includes(kw.toLowerCase())))
    .slice(0, max);

  if (eligible.length === 0) {
    return [];
  }

  const results = await Promise.all(
    eligible.map(async (section) => {
      const prompt = `Editorial illustration for a crypto / web3 / blockchain article section titled "${section.heading}". Context: ${section.bodyPreview || 'No additional context.'}. Style: modern, clean, tech magazine illustration, abstract conceptual visuals, no text overlays, no watermarks.`;
      try {
        const response = await ai!.models.generateImages({
          model: IMAGE_MODEL,
          prompt,
          config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '16:9',
          },
        });
        const bytes = response.generatedImages?.[0]?.image?.imageBytes;
        if (!bytes) return null;
        const compressed = await compressBase64Image(bytes);
        return {
          heading: section.heading,
          base64: compressed,
          previewImage: `data:image/jpeg;base64,${compressed}`,
        } satisfies SectionIllustration;
      } catch (err) {
        console.error(`Error generating illustration for section "${section.heading}":`, err);
        return null;
      }
    })
  );

  return results.filter((r): r is SectionIllustration => r !== null);
};

export const generateImage = async (title: string, tone: string): Promise<GeneratedImageResult | string> => {
  if (!ai) {
    return Promise.resolve("Error: API key not configured.");
  }

  const prompt = `
    help me to generate an image for my image cover in medium.com for my artitle titled: ${title} with tone: ${tone}
  `;

  try {
    const response = await ai.models.generateImages({
      model: IMAGE_MODEL,
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '16:9',
      },
    });

    const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (!base64ImageBytes) {
      return "No image was generated. Please try again.";
    }
    const compressedBase64 = await compressBase64Image(base64ImageBytes);
    const responseImage = {
      previewImage:`data:image/jpeg;base64,${compressedBase64}`,
      base64:compressedBase64
    }
    return responseImage;
  } catch (error) {
    console.error("Error generating image:", error);
    if (error instanceof Error && error.message.includes("NOT_FOUND")) {
      return `Image generation model "${IMAGE_MODEL}" is unavailable for this API key/project. Verify enabled Gemini image models in Google AI Studio.`;
    }
    return "An error occurred while generating the image. Please try again.";
  }
};
