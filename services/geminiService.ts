import { GoogleGenAI, Modality, Type } from "@google/genai";
import { StoryPage } from "../types";

// Initialize the Gemini AI client.
// The API key is automatically sourced from the `process.env.API_KEY` environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Converts a data URL string to a GenAI-compatible part object.
 * @param dataUrl The base64 encoded data URL (e.g., "data:image/jpeg;base64,...").
 * @returns An object with `inlineData` containing the mimeType and base64 data.
 */
const dataUrlToGenaiPart = (dataUrl: string) => {
  const parts = dataUrl.split(',');
  if (parts.length !== 2) {
      throw new Error("Invalid data URL format");
  }
  const mimeTypePart = parts[0];
  const data = parts[1];
  
  const mimeTypeMatch = mimeTypePart.match(/:(.*?);/);
  if (!mimeTypeMatch || mimeTypeMatch.length < 2) {
      throw new Error("Could not parse mime type from data URL");
  }
  const mimeType = mimeTypeMatch[1];
  
  return {
      inlineData: {
          mimeType,
          data,
      },
  };
};


/**
 * Converts a user's photo to a cartoon avatar using the Gemini API.
 * @param base64Image The base64 encoded image from the user.
 * @returns A promise that resolves to a base64 data URL of the cartoon avatar.
 */
export const generateCartoonAvatar = async (base64Image: string): Promise<string> => {
  console.log("Generating cartoon avatar for image...");

  const imagePart = dataUrlToGenaiPart(base64Image);

  // Request the model to convert the user's photo into a cartoon avatar.
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        imagePart,
        {
          text: "将这张照片转换成一个简单、友好的卡通头像，适用于儿童故事书。风格要干净可爱。背景应该是透明的。",
        },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE], // We expect an image as output.
    },
  });

  // Extract the generated image data from the response.
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      const base64ImageBytes: string = part.inlineData.data;
      const mimeType = part.inlineData.mimeType;
      console.log("Avatar generated.");
      return `data:${mimeType};base64,${base64ImageBytes}`;
    }
  }

  throw new Error("Could not generate cartoon avatar from the API response.");
};

/**
 * Generates a 4-page storybook with text and images.
 * @param cartoonAvatar The base64 data URL of the generated cartoon avatar.
 * @returns A promise that resolves to an array of StoryPage objects.
 */
export const generateStorybook = async (cartoonAvatar: string): Promise<StoryPage[]> => {
  console.log("Generating storybook text and images...");
  const avatarPart = dataUrlToGenaiPart(cartoonAvatar);

  // 1. Generate the story text and image prompts in one go as a JSON object.
  const storyGenerationResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        avatarPart,
        { text: "为这个角色创作一个四页的中文儿童冒险故事。故事要简单、温馨、有想象力。请以JSON格式返回，包含四页的内容，每一页都有'story_text'（故事文本）和'image_prompt'（用于生成图片的英文提示，描述场景和角色动作）。" }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            story_text: {
              type: Type.STRING,
              description: '该页的中文故事文本。',
            },
            image_prompt: {
              type: Type.STRING,
              description: '用于生成该页图片的详细英文提示。例如: A vibrant storybook illustration of the character exploring a magical forest.',
            },
          },
          required: ["story_text", "image_prompt"]
        }
      }
    }
  });

  const storyData = JSON.parse(storyGenerationResponse.text);

  if (!Array.isArray(storyData) || storyData.length === 0) {
      throw new Error("Failed to generate valid story data.");
  }

  // 2. Generate an image for each page using the generated prompts.
  const imageGenerationPromises = storyData.map(pageData => {
    return ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          avatarPart,
          // The prompt for image generation includes the style and the specific scene.
          { text: `${pageData.image_prompt}. Style should be a vibrant, friendly, and cute children's storybook illustration.` },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });
  });

  const imageResponses = await Promise.all(imageGenerationPromises);

  // 3. Combine the story text with the generated images.
  const storyPages: StoryPage[] = imageResponses.map((response, index) => {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        const mimeType = part.inlineData.mimeType;
        return {
          image: `data:${mimeType};base64,${base64ImageBytes}`,
          story: storyData[index].story_text, // Get the story text from the first API call.
        };
      }
    }
    throw new Error(`Could not generate image for page ${index + 1}.`);
  });

  console.log("Storybook generated successfully.");
  return storyPages;
};