import { createHash } from "crypto";

const DEFAULT_ENDPOINT = "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation";
const TIMEOUT_MS = 30000; // 30秒超时
const MAX_RETRIES = 2; // 最大重试次数

export type IdentifyResult = {
  foodName: string;
  rawText?: string;
  raw?: unknown;
  fingerprint?: string;
  label?: string;
};

class AliVlError extends Error {
  constructor(message: string, public status?: number, public details?: unknown) {
    super(message);
    this.name = "AliVlError";
  }
}

export async function identifyFood(imageBuffer: Buffer): Promise<IdentifyResult> {
  const apiKey = process.env.ALIYUN_API_KEY;
  const endpoint = process.env.ALIYUN_VL_ENDPOINT ?? DEFAULT_ENDPOINT;

  if (!apiKey) {
    throw new AliVlError("缺少通义千问 API Key，请在环境变量中配置 ALIYUN_API_KEY。");
  }

  const base64 = imageBuffer.toString("base64");
  const imageHash = createHash("md5").update(imageBuffer).digest("hex");

  const payload = {
    model: "qwen-vl-max",
    input: {
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "请仔细识别图片中的主要食物，仅输出食物的中文名称，不要描述背景或形容词。例如：烤鸡翅、白米饭、苹果。"
            },
            { type: "image", image: `data:image/jpeg;base64,${base64}` }
          ]
        }
      ]
    }
  };

  // 重试机制
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    try {
      console.log(`阿里云 API 调用尝试 ${attempt}/${MAX_RETRIES + 1}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await safeJson(response);
        throw new AliVlError(
          `通义千问识别失败（${response.status}）`,
          response.status,
          errorBody
        );
      }

      const data = await response.json();
      const rawText = collectRawText(data);

      console.log(`API返回的原始文本: "${rawText}"`);
      console.log(`API使用情况:`, data?.usage);

      const foodName = extractFoodName(rawText);
      console.log(`提取的食物名称: "${foodName}"`);

      if (!foodName) {
        console.log(`食物名称提取失败，原始文本: "${rawText}"`);
        console.log("模型原始输出片段:", JSON.stringify(data?.output ?? {}, null, 2));
        throw new AliVlError("未能识别出明确的食物名称，请尝试更换图片角度或光线。", response.status, data);
      }

      console.log(`识别成功: ${foodName} (尝试 ${attempt})`);
      return {
        foodName,
        label: foodName,
        rawText,
        raw: data,
        fingerprint: imageHash
      };

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`尝试 ${attempt} 失败:`, lastError.message);

      // 如果是网络错误或超时，且还有重试机会，则等待后重试
      if (attempt <= MAX_RETRIES &&
          (lastError.message.includes("fetch") ||
           lastError.message.includes("timeout") ||
           lastError.message.includes("网络") ||
           lastError.message.includes("AbortError"))) {

        const waitTime = attempt * 1000; // 递增等待时间
        console.log(`等待 ${waitTime}ms 后重试...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        break; // 不再重试
      }
    }
  }

  // 所有重试都失败
  throw lastError || new AliVlError("识别服务暂时不可用，请稍后再试");
}

function collectRawText(data: any): string {
  const candidateTexts: string[] = [];

  const content = data?.output?.choices?.[0]?.message?.content;
  if (Array.isArray(content)) {
    for (const item of content) {
      if (typeof item?.text === "string" && item.text.trim()) {
        candidateTexts.push(item.text);
      }
    }
  }

  const messageText = data?.output?.choices?.[0]?.message?.text;
  if (typeof messageText === "string" && messageText.trim()) {
    candidateTexts.push(messageText);
  }

  const outputText = data?.output?.text;
  if (typeof outputText === "string" && outputText.trim()) {
    candidateTexts.push(outputText);
  }

  const choiceText = data?.output?.choices?.[0]?.text;
  if (typeof choiceText === "string" && choiceText.trim()) {
    candidateTexts.push(choiceText);
  }

  const deduped = candidateTexts.filter((value, index, self) => self.indexOf(value) === index);
  return deduped.length > 0 ? deduped[deduped.length - 1] : "";
}

function extractFoodName(rawText: string): string {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return "";
  }

  // 拆分常见分隔符，只取第一个片段
  const primary = trimmed.split(/[，。！？,.!;；\n]/)[0]?.trim() ?? "";

  // 提取中文食物名称（2~6个汉字）
  const chineseMatch = primary.match(/([\u4e00-\u9fa5]{2,6})(?:[\u4e00-\u9fa5]{0,2})?/);
  if (chineseMatch?.[1]) {
    return chineseMatch[1];
  }

  // 若存在“的”结构，取“的”前面的词组
  if (primary.includes("的")) {
    const beforeDe = primary.split("的")[0]?.trim();
    if (beforeDe && beforeDe.length <= 6) {
      const cleaned = beforeDe.replace(/[^\u4e00-\u9fa5]/g, "");
      if (cleaned.length >= 2) {
        return cleaned;
      }
    }
  }

  // 提取英文单词，返回首个单词
  const latinMatch = primary.match(/([A-Za-z][A-Za-z\s]{1,20})/);
  if (latinMatch?.[1]) {
    return latinMatch[1].trim();
  }

  return primary.slice(0, 10);
}

async function safeJson(response: Response) {
  try {
    return await response.json();
  } catch (error) {
    return { error: "Failed to parse JSON", raw: await response.text() };
  }
}
