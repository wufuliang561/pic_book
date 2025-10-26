import { StoryPage } from "../types";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = "google/gemini-2.5-flash-image";
const REQUEST_TIMEOUT_MS = 5 * 60 * 1000;

const apiKey = (process.env.OPENROUTER_API_KEY ?? "").trim();
const refererHeader = (process.env.OPENROUTER_HTTP_REFERER ?? "").trim();
const siteTitleHeader = (process.env.OPENROUTER_APP_TITLE ?? "").trim();

const DATA_URL_REGEX = /^data:([^;]+);base64,(.+)$/s;
const BASE64_PATTERN = /^[A-Za-z0-9+/]+={0,2}$/;

type UserContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } }
  | { type: "input_image"; image_base64: string; mime_type?: string };

interface OpenRouterMessageContent {
  type?: string;
  text?: string;
  image_url?: { url?: string };
  image?: { base64?: string; mime_type?: string };
  image_base64?: string;
  mime_type?: string;
  b64_json?: string;
  data?: string;
  [key: string]: unknown;
}

interface OpenRouterMessageImage {
  type?: string;
  image_url?: { url?: string };
  image_base64?: string;
  mime_type?: string;
  b64_json?: string;
  data?: string;
  image?: { base64?: string; mime_type?: string };
  [key: string]: unknown;
}

interface OpenRouterMessageEnvelope {
  role?: string;
  content?: Array<OpenRouterMessageContent | string> | string;
  images?: OpenRouterMessageImage[];
  [key: string]: unknown;
}

interface OpenRouterChatCompletion {
  choices?: Array<{
    message?: OpenRouterMessageEnvelope;
  }>;
  error?: { message?: string };
}

/**
 * 校验并规范化 data URL 格式，确保上传图片符合要求。
 */
interface ParsedDataUrl {
  dataUrl: string;
  mimeType: string;
  base64: string;
}

const sanitizeBase64 = (value: string): string => value.replace(/\s+/g, "");

const parseDataUrl = (value: string): ParsedDataUrl => {
  if (!value) {
    throw new Error("未找到上传的图片数据。");
  }
  const match = value.trim().match(DATA_URL_REGEX);
  if (!match) {
    throw new Error("图片数据格式错误，期待 data URL（data:<mime>;base64,...）。");
  }

  const mimeType = match[1];
  const base64Raw = match[2] ?? "";
  const sanitizedBase64 = sanitizeBase64(base64Raw);

  if (!sanitizedBase64 || !BASE64_PATTERN.test(sanitizedBase64)) {
    throw new Error("图片 base64 数据不合法，无法解析。");
  }

  return {
    dataUrl: `data:${mimeType};base64,${sanitizedBase64}`,
    mimeType,
    base64: sanitizedBase64,
  };
};

const normalizeInputDataUrl = (dataUrl: string): string => parseDataUrl(dataUrl).dataUrl;

/**
 * 创建文本内容块，用于向 OpenRouter 描述生成需求。
 */
const createTextPart = (text: string): UserContentPart => ({
  type: "text",
  text,
});

/**
 * 创建图片内容块，将 base64 data URL 注入到消息体。
 */
const createImageParts = (dataUrl: string): UserContentPart[] => {
  const parsed = parseDataUrl(dataUrl);

  return [
    {
      type: "image_url",
      image_url: { url: parsed.dataUrl },
    },
    {
      type: "input_image",
      image_base64: parsed.base64,
      mime_type: parsed.mimeType,
    },
  ];
};

/**
 * 将纯 base64 数据包装成 data URL 方便前端展示。
 */
const buildDataUrl = (base64: string, mimeType: string): string => `data:${mimeType};base64,${sanitizeBase64(base64)}`;

/**
 * 判断字符串是否已经是 data URL。
 */
const isDataUrl = (value: string): boolean => DATA_URL_REGEX.test(value.trim());

/**
 * 判断字符串是否看起来是纯 base64 数据。
 */
const isPureBase64 = (value: string): boolean => BASE64_PATTERN.test(sanitizeBase64(value));

/**
 * 将 Blob 转换成 data URL，便于最终交给前端展示。
 */
const blobToDataUrl = (blob: Blob): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onloadend = () => {
    const result = typeof reader.result === "string" ? reader.result : null;
    if (!result) {
      reject(new Error("读取图片数据失败"));
      return;
    }
    resolve(result);
  };
  reader.onerror = () => reject(new Error("图片转 base64 时发生错误"));
  reader.readAsDataURL(blob);
});

/**
 * 将远程图片 URL 拉取为 base64，保证前端统一使用 data URL。
 */
const fetchImageAsDataUrl = async (url: string): Promise<string> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`拉取图片失败，状态码：${response.status}`);
    }
    const blob = await response.blob();
    return await blobToDataUrl(blob);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("从 OpenRouter 下载图片超时，请稍后再试。");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * 统一整理 OpenRouter 返回的图片引用，转成 data URL。
 */
const normalizeOutputImageReference = async (value: string, fallbackMimeType = "image/png"): Promise<string> => {
  const trimmed = value.trim();
  if (isDataUrl(trimmed)) {
    return parseDataUrl(trimmed).dataUrl;
  }
  if (isPureBase64(trimmed)) {
    return buildDataUrl(trimmed, fallbackMimeType);
  }
  if (trimmed.startsWith("http")) {
    return await fetchImageAsDataUrl(trimmed);
  }
  throw new Error("OpenRouter 返回的图片格式未知，无法解析。");
};

/**
 * 从 Chat Completions 响应中提取第一张图片的 data URL。
 */
const extractImageDataUrl = async (completion: OpenRouterChatCompletion): Promise<string> => {
  const firstChoice = completion.choices?.[0];
  const message = firstChoice?.message;

  if (!message) {
    throw new Error("OpenRouter 响应中没有返回图片内容。");
  }

  const messageImages = Array.isArray(message.images) ? message.images : [];
  for (const imageItem of messageImages) {
    if (!imageItem) {
      continue;
    }

    const url = imageItem.image_url?.url;
    if (typeof url === "string" && url.trim()) {
      return await normalizeOutputImageReference(url);
    }

    const base64 =
      (typeof imageItem.image_base64 === "string" && sanitizeBase64(imageItem.image_base64)) ||
      (typeof imageItem.b64_json === "string" && sanitizeBase64(imageItem.b64_json)) ||
      (typeof imageItem.data === "string" && sanitizeBase64(imageItem.data)) ||
      (typeof imageItem.image?.base64 === "string" && sanitizeBase64(imageItem.image.base64));

    if (base64) {
      const mimeType =
        (typeof imageItem.mime_type === "string" && imageItem.mime_type) ||
        (imageItem.image && typeof imageItem.image.mime_type === "string" && imageItem.image.mime_type) ||
        "image/png";
      return buildDataUrl(base64, mimeType);
    }
  }

  const content = Array.isArray(message.content) ? message.content : undefined;

  if (!content || content.length === 0) {
    throw new Error("OpenRouter 响应中没有返回图片内容。");
  }

  for (const item of content) {
    if (typeof item === "string") {
      if (isDataUrl(item)) {
        return parseDataUrl(item).dataUrl;
      }
      if (isPureBase64(item)) {
        return buildDataUrl(item, "image/png");
      }
      continue;
    }

    if (!item) {
      continue;
    }

    const itemType = typeof item.type === "string" ? item.type : undefined;

    if (itemType === "output_image" || itemType === "image") {
      const base64 =
        (typeof item.image_base64 === "string" && sanitizeBase64(item.image_base64)) ||
        (typeof item.b64_json === "string" && sanitizeBase64(item.b64_json)) ||
        (typeof item.data === "string" && sanitizeBase64(item.data)) ||
        (typeof item.image?.base64 === "string" && sanitizeBase64(item.image.base64));
      if (base64) {
        const mimeType =
          (typeof item.mime_type === "string" && item.mime_type) ||
          (item.image && typeof item.image.mime_type === "string" && item.image.mime_type) ||
          "image/png";
        return buildDataUrl(base64, mimeType);
      }
    }

    if (itemType === "output_text") {
      continue;
    }

    if (typeof item.text === "string") {
      const text = item.text.trim();
      if (isDataUrl(text)) {
        return parseDataUrl(text).dataUrl;
      }
      if (isPureBase64(text)) {
        return buildDataUrl(text, "image/png");
      }
    }

    const url = item.image_url?.url;
    if (typeof url === "string" && url) {
      return await normalizeOutputImageReference(url);
    }

    const base64 = item.image?.base64;
    if (typeof base64 === "string" && base64) {
      const mimeType = item.image?.mime_type && typeof item.image.mime_type === "string"
        ? item.image.mime_type
        : "image/png";
      return buildDataUrl(base64, mimeType);
    }
  }

  const messageJson = JSON.stringify(message);
  const dataUrlMatch = messageJson.match(/data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=\s-]+/);
  if (dataUrlMatch && dataUrlMatch[0]) {
    return parseDataUrl(dataUrlMatch[0]).dataUrl;
  }

  throw new Error("OpenRouter 响应中没有找到有效的图片数据。");
};

/**
 * 调用 OpenRouter Chat Completions 接口，返回完整响应体。
 */
const callOpenRouter = async (content: UserContentPart[]): Promise<OpenRouterChatCompletion> => {
  if (!apiKey) {
    throw new Error("请先在环境变量中配置 OPENROUTER_API_KEY。");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  if (refererHeader) {
    headers["HTTP-Referer"] = refererHeader;
  }
  if (siteTitleHeader) {
    headers["X-Title"] = siteTitleHeader;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          {
            role: "user",
            content,
          },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error("OpenRouter 请求失败:", response.status, errorText);
      throw new Error(`OpenRouter 请求失败，状态码：${response.status}`);
    }

    const payload = (await response.json()) as OpenRouterChatCompletion;
    if (payload.error?.message) {
      throw new Error(`OpenRouter 返回错误：${payload.error.message}`);
    }

    return payload;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("调用 OpenRouter 超时（5 分钟），请稍后重试。");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * 统一封装图片生成请求，方便复用错误处理逻辑。
 */
const requestImageGeneration = async (content: UserContentPart[]): Promise<string> => {
  const completion = await callOpenRouter(content);
  return await extractImageDataUrl(completion);
};

/**
 * 将用户头像转换成小青龙的水彩漫画风格。
 */
export const generateCartoonAvatar = async (base64Image: string): Promise<string> => {
  console.log("Generating Little Green Dragon avatar via OpenRouter...");
  const normalizedImage = normalizeInputDataUrl(base64Image);

  const avatarPrompt = "将此真人头像转换为一只可爱的小青龙形象的奇幻水彩漫画风格插画。请高度保留上传头像的脸部特征和辨识度，但将其风格化为柔和的色彩、蓬松的头发和富有表现力的眼睛。角色应穿着或融入小青龙的元素，具有日本奇幻动画角色设计风格，类似于儿童奇幻插画";

  const content: UserContentPart[] = [
    ...createImageParts(normalizedImage),
    createTextPart(avatarPrompt),
  ];

  return await requestImageGeneration(content);
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
    includesAvatar: false,
  },
  {
    story: "哇！我不是一个人在战斗！兄弟们，冲啊！",
    prompt: "A fantasy watercolor manga style illustration. The cute little green dragon (user's avatar) is no longer alone. It confidently leads a diverse 'Dragon Legion' of dragons that have come to life from paper flying out of a sky rift. Villagers on both sides watch with joy. The storm is receding and the sky is clearing.",
    includesAvatar: true,
  },
];

/**
 * 生成“小青龙军团”绘本的每一页图片与文案。
 */
export const generateStorybook = async (cartoonAvatar: string): Promise<StoryPage[]> => {
  console.log("Generating 'Dragon Legion' storybook via OpenRouter...");
  const normalizedAvatar = normalizeInputDataUrl(cartoonAvatar);

  const imageGenerationPromises = storyContent.map(async (page, index) => {
    const content: UserContentPart[] = [];
    if (page.includesAvatar) {
      content.push(...createImageParts(normalizedAvatar));
    }
    content.push(createTextPart(page.prompt));

    try {
      const image = await requestImageGeneration(content);
      return {
        image,
        story: page.story,
      } satisfies StoryPage;
    } catch (error) {
      console.error(`生成第 ${index + 1} 页失败:`, error);
      throw error;
    }
  });

  return await Promise.all(imageGenerationPromises);
};
