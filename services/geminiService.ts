import { GoogleGenAI, Modality } from "@google/genai";
import { StoryPage } from "../types";

// Initialize the Gemini AI client.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Converts a data URL string to a GenAI-compatible part object.
 */
const dataUrlToGenaiPart = (dataUrl: string) => {
  const parts = dataUrl.split(',');
  if (parts.length !== 2) throw new Error("Invalid data URL format");
  
  const mimeTypeMatch = parts[0].match(/:(.*?);/);
  if (!mimeTypeMatch) throw new Error("Could not parse mime type from data URL");
  
  return {
      inlineData: {
          mimeType: mimeTypeMatch[1],
          data: parts[1],
      },
  };
};

/**
 * Converts a user's photo to a "Little Green Dragon" cartoon avatar.
 */
export const generateCartoonAvatar = async (base64Image: string): Promise<string> => {
  console.log("Generating Little Green Dragon avatar...");
  const imagePart = dataUrlToGenaiPart(base64Image);

  // New, more detailed prompt for avatar generation
  const avatarPrompt = "将此真人头像转换为一只可爱的小青龙形象的奇幻水彩漫画风格插画。请高度保留上传头像的脸部特征和辨识度，但将其风格化为柔和的色彩、蓬松的头发和富有表现力的眼睛。角色应穿着或融入小青龙的元素，具有日本奇幻动画角色设计风格，类似于儿童奇幻插画";

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        imagePart,
        { text: avatarPrompt },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  const firstCandidate = response?.candidates?.[0];

  if (!firstCandidate || !firstCandidate.content?.parts?.length) {
    console.error("Avatar generation failed. Response:", JSON.stringify(response, null, 2));
    throw new Error("抱歉，无法生成您的头像。内容可能被安全过滤器阻止。");
  }

  for (const part of firstCandidate.content.parts) {
    if (part.inlineData) {
      const { data, mimeType } = part.inlineData;
      console.log("Avatar generated.");
      return `data:${mimeType};base64,${data}`;
    }
  }

  console.error("Avatar generation failed, no image data found in parts. Response:", JSON.stringify(response, null, 2));
  throw new Error("抱歉，生成头像时收到了无效的响应。");
};


// --- New Story Data ---
const storyContent = [
    {
        story: "山洪与飓风，暴雨与海水席卷这里 ！ 我...我一个人快顶不住了！",
        prompt: "A fantasy watercolor manga style illustration. In the sky of ancient Longgang, there are dark clouds, thunder, and lightning. Below is a stormy sea with a huge hurricane approaching simple thatched houses. A cute little green dragon (user's avatar) is seen from the back, looking small and helpless against the massive storm, creating a strong sense of oppression.",
        includesAvatar: true,
    },
    {
        story: "我需要支援！十万火急！",
        prompt: "A fantasy watercolor manga style illustration. Close-up on the cute little green dragon (user's avatar) in the storm. It has a determined look, raising both hands towards the sky. A firm beam of light shoots from its hands, connecting to a swirling space-time vortex in the sky.",
        includesAvatar: true,
    },
    {
        story: "收到！‘龙之军团’正在从纸上‘活’过来！米塑龙、竹子龙、烫金龙、像素龙…全体出动！",
        prompt: "A fantasy watercolor manga style illustration. Inside a modern, clean, high-tech 'China Printing City' factory. A huge, futuristic printing press is running at high speed. Thousands of pieces of paper, each with a different dragon printed on it, are flying out of the machine and into a rift in the sky.",
        includesAvatar: false, // This page does not include the user's avatar
    },
    {
        story: "哇！我不是一个人在战斗！兄弟们，冲啊！",
        prompt: "A fantasy watercolor manga style illustration. The cute little green dragon (user's avatar) is no longer alone. It confidently leads a diverse 'Dragon Legion' of dragons that have come to life from paper flying out of a sky rift. Villagers on both sides watch with joy. The storm is receding and the sky is clearing.",
        includesAvatar: true,
    }
];


/**
 * Generates the new "Dragon Legion" storybook.
 */
export const generateStorybook = async (cartoonAvatar: string): Promise<StoryPage[]> => {
  console.log("Generating new 'Dragon Legion' storybook...");
  const avatarPart = dataUrlToGenaiPart(cartoonAvatar);

  const imageGenerationPromises = storyContent.map((page) => {
    const parts = [];
    if (page.includesAvatar) {
      parts.push(avatarPart);
    }
    parts.push({ text: page.prompt });

    return ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });
  });

  const responses = await Promise.all(imageGenerationPromises);

  const storyPages: StoryPage[] = responses.map((response, index) => {
    const content = storyContent[index];
    const firstCandidate = response?.candidates?.[0];

    if (!firstCandidate || !firstCandidate.content?.parts?.length) {
      console.error(`Image generation failed for page ${index + 1}. Response:`, JSON.stringify(response, null, 2));
      throw new Error(`无法生成故事第 ${index + 1} 页的图片。内容可能已被阻止。`);
    }

    for (const part of firstCandidate.content.parts) {
      if (part.inlineData) {
        const { data, mimeType } = part.inlineData;
        return {
          image: `data:${mimeType};base64,${data}`,
          story: content.story,
        };
      }
    }
    
    console.error(`No image data found for page ${index + 1}. Response:`, JSON.stringify(response, null, 2));
    throw new Error(`无法从响应中找到第 ${index + 1} 页的图片数据。`);
  });

  console.log("Storybook generated successfully.");
  return storyPages;
};