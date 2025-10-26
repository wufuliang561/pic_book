import type { StoryPage } from '../types';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

interface OpenRouterMessageContent {
  type: string;
  text?: string;
  image_url?: {
    url: string;
  };
  image_base64?: string;
  mime_type?: string;
}

interface OpenRouterChoice {
  message?: {
    role: string;
    content: string | OpenRouterMessageContent[];
  };
}

interface OpenRouterChatResponse {
  choices?: OpenRouterChoice[];
  error?: {
    message?: string;
  };
}

/**
 * 构建请求 OpenRouter 所需的基础请求头，包含 API Key 与可选的站点信息。
 */
const buildHeaders = () => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('缺少 OpenRouter API Key，请在环境变量中设置 OPENROUTER_API_KEY。');
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  const referer = process.env.OPENROUTER_SITE_URL;
  const title = process.env.OPENROUTER_SITE_NAME;
  if (referer) {
    headers['HTTP-Referer'] = referer;
  }
  if (title) {
    headers['X-Title'] = title;
  }

  return headers;
};

/**
 * 统一封装与 OpenRouter 交互的 POST 请求，失败时抛出带上下文的错误。
 */
const postChatCompletion = async (payload: unknown): Promise<OpenRouterChatResponse> => {
  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });

  const data: OpenRouterChatResponse = await response.json();

  if (!response.ok) {
    const message = data?.error?.message ?? `OpenRouter 请求失败，状态码：${response.status}`;
    throw new Error(message);
  }

  return data;
};

/**
 * 从助手回复的内容中提取图像数据，兼容 base64 与 data URL 返回格式。
 */
const extractImageData = (choice?: OpenRouterChoice): { mimeType: string; base64: string } => {
  const content = choice?.message?.content;
  if (!content) {
    throw new Error('OpenRouter 未返回任何内容。');
  }

  if (typeof content === 'string') {
    const parts = content.match(/^data:(.+);base64,(.+)$/);
    if (parts && parts.length === 3) {
      return {
        mimeType: parts[1],
        base64: parts[2],
      };
    }
    throw new Error('OpenRouter 返回的内容不包含图像数据。');
  }

  for (const item of content) {
    if (item.type === 'image_base64' && item.image_base64) {
      return {
        mimeType: item.mime_type ?? 'image/png',
        base64: item.image_base64,
      };
    }
    if (item.type === 'image_url' && item.image_url?.url) {
      const match = item.image_url.url.match(/^data:(.+);base64,(.+)$/);
      if (match && match.length === 3) {
        return {
          mimeType: match[1],
          base64: match[2],
        };
      }
    }
  }

  throw new Error('未能在 OpenRouter 响应中找到图像内容。');
};

/**
 * 从助手回复中提取文本内容，适配字符串与多模态数组两种返回格式。
 */
const extractTextContent = (choice?: OpenRouterChoice): string => {
  const content = choice?.message?.content;
  if (!content) {
    throw new Error('OpenRouter 未返回任何文本。');
  }

  if (typeof content === 'string') {
    return content;
  }

  for (const item of content) {
    if (item.type === 'output_text' && item.text) {
      return item.text;
    }
    if (item.type === 'text' && item.text) {
      return item.text;
    }
  }

  throw new Error('未能在 OpenRouter 响应中找到文本内容。');
};

/**
 * 清洗模型返回的 JSON 文本，去除围栏与前后噪声，便于后续解析。
 */
const normalizeJsonText = (raw: string): string => {
  let normalized = raw.trim();
  const fenceMatch = normalized.match(/^```(?:json)?\s*([\s\S]*?)```$/i);
  if (fenceMatch && fenceMatch[1]) {
    normalized = fenceMatch[1].trim();
  }
  return normalized;
};

/**
 * 将用户上传的照片转换为卡通头像。
 * @param base64Image data URL 形式的用户原始照片。
 */
export const generateCartoonAvatar = async (base64Image: string): Promise<string> => {
  console.log('调用 OpenRouter 生成卡通头像...');
  const response = await postChatCompletion({
    model: 'google/gemini-2.5-flash-image-preview',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: '将这张照片转换成一个简单、友好的卡通头像，适用于儿童故事书。风格要干净可爱。背景保持透明。',
          },
          {
            type: 'image_url',
            image_url: {
              url: base64Image,
            },
          },
        ],
      },
    ],
  });

  const choice = response.choices?.[0];
  const { mimeType, base64 } = extractImageData(choice);
  console.log('卡通头像生成完毕。');
  return `data:${mimeType};base64,${base64}`;
};

/**
 * 依赖生成的卡通头像，产出四页的故事文本与配图。
 * @param cartoonAvatar data URL 形式的卡通头像。
 */
export const generateStorybook = async (
  cartoonAvatar: string,
): Promise<StoryPage[]> => {
  console.log('调用 OpenRouter 生成故事文本...');
  const storyResponse = await postChatCompletion({
    model: 'google/gemini-2.5-flash',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: cartoonAvatar },
          },
          {
            type: 'text',
            text: "为这个角色创作一个四页的中文儿童冒险故事。故事要简单、温馨、有想象力。请以 JSON 格式返回，包含四页的内容，每一页都有 'story_text'（故事文本）和 'image_prompt'（用于生成图片的英文提示，描述场景和角色动作）。",
          },
        ],
      },
    ],
  });

  const storyChoice = storyResponse.choices?.[0];
  const storyContent = normalizeJsonText(extractTextContent(storyChoice));

  let storyData: Array<{ story_text: string; image_prompt: string }>;
  try {
    const parsed = JSON.parse(storyContent);
    if (Array.isArray(parsed)) {
      storyData = parsed;
    } else if (Array.isArray(parsed.pages)) {
      storyData = parsed.pages;
    } else {
      throw new Error('JSON 结构不符合预期。');
    }
  } catch (error) {
    console.error('解析故事 JSON 失败：', error);
    throw new Error('无法解析 OpenRouter 返回的故事数据。');
  }

  if (storyData.length === 0) {
    throw new Error('OpenRouter 返回的故事数据为空。');
  }

  console.log('逐页生成故事插图...');
  const imageResponses = await Promise.all(
    storyData.map(async (page) => {
      const imageResp = await postChatCompletion({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: cartoonAvatar },
              },
              {
                type: 'text',
                text: `${page.image_prompt}. Style should be a vibrant, friendly, and cute children's storybook illustration.`,
              },
            ],
          },
        ],
      });

      const choice = imageResp.choices?.[0];
      const { mimeType, base64 } = extractImageData(choice);

      const storyPage: StoryPage = {
        image: `data:${mimeType};base64,${base64}`,
        story: page.story_text,
      };
      return storyPage;
    }),
  );

  console.log('故事生成成功。');
  return imageResponses;
};
