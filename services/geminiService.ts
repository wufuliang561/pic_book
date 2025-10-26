import { GoogleGenAI, Modality } from "@google/genai";
import { StoryPage } from "../types";
import { staticStoryImage3 } from "../static/images";

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

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        imagePart,
        {
          text: "将这张照片转换成一个Q版“小青龙”卡通头像，适用于儿童故事书。风格要干净可爱，有英雄气概。背景应该是透明的。",
        },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      const { data, mimeType } = part.inlineData;
      console.log("Avatar generated.");
      return `data:${mimeType};base64,${data}`;
    }
  }
  throw new Error("Could not generate cartoon avatar.");
};


// --- Story Data ---
const storyContent = [
    {
        story: "山洪与飓风，暴雨与海水席卷这里 ！ 我...我一个人快顶不住了！",
        prompt: "A Q-version little green dragon (user's avatar), exhausted, resisting a huge hurricane and monstrous waves. Below is the ancient Dragon Harbor with thatched huts, dark clouds overhead. The little dragon looks tiny and helpless. Anime illustration style, high contrast.",
    },
    {
        story: "未来的‘中国印刷城’！我需要支援！十万火急！",
        prompt: "Close-up on the Q-version little green dragon (user's avatar), roaring towards the sky. A signal beam of light shoots from its mouth into a space-time vortex in the sky. It has a determined look. Epic illustration style during a storm.",
    },
    {
        story: "收到！‘龙之军团’正在从纸上‘活’过来！米塑龙、竹子龙、烫金龙、像素龙…全体出动！",
        isStatic: true,
    },
    {
        story: "哇！我不是一个人在战斗！兄弟们，冲啊！尝尝‘中国印刷城’量产的厉害！",
        prompt: "The Q-version little green dragon (user's avatar) leads the 'Dragon Legion' (rice-plastic dragon, bamboo dragon, hot-stamped gold dragon, pixel dragon). They are fighting together to defeat the disaster. The sky is clearing. Joyful, epic, Q-version illustration style.",
    }
];


/**
 * Generates the "Dragon Legion" storybook.
 */
export const generateStorybook = async (cartoonAvatar: string): Promise<StoryPage[]> => {
  console.log("Generating 'Dragon Legion' storybook...");
  const avatarPart = dataUrlToGenaiPart(cartoonAvatar);

  const imageGenerationPromises = storyContent.map((page, index) => {
    // Page 3 is static and does not require generation.
    if (page.isStatic) {
        return Promise.resolve(null);
    }

    return ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          avatarPart,
          { text: page.prompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });
  });

  const responses = await Promise.all(imageGenerationPromises);

  const storyPages: StoryPage[] = responses.map((response, index) => {
    const content = storyContent[index];
    
    // Handle the static page 3
    if (content.isStatic) {
        return {
            image: staticStoryImage3,
            story: content.story,
        };
    }
    
    // Handle dynamically generated pages
    if (response) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const { data, mimeType } = part.inlineData;
          return {
            image: `data:${mimeType};base64,${data}`,
            story: content.story,
          };
        }
      }
    }
    throw new Error(`Could not generate image for page ${index + 1}.`);
  });

  console.log("Storybook generated successfully.");
  return storyPages;
};