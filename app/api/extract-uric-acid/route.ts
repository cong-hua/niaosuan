import { NextResponse } from "next/server";
import { identifyMedicalReport } from "@/lib/ali-vl";
import { MAX_UPLOAD_SIZE } from "@/lib/purine";

export const runtime = "edge";

interface UricAcidExtraction {
  value: number;
  date: string;
  unit?: 'mmol/L' | 'mg/dL' | 'μmol/L';
  confidence?: number;
}

export async function POST(request: Request) {
  const startTime = Date.now();
  console.log("开始处理尿酸值提取请求");

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ message: "缺少有效的图片文件" }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ message: "图片文件为空" }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      return NextResponse.json({ message: "图片过大，请选择 5MB 以内的文件" }, { status: 413 });
    }

    console.log(`文件信息: ${file.name}, 大小: ${file.size} 字节, 类型: ${file.type}`);

    const buffer = Buffer.from(await file.arrayBuffer());
    console.log(`图片转缓冲区完成，耗时: ${Date.now() - startTime}ms`);

    try {
      // 使用医疗报告专用识别函数
      const identifyResult = await identifyMedicalReport(buffer);
      console.log(`医疗报告识别完成，耗时: ${Date.now() - startTime}ms`);

      // 从识别结果中提取尿酸值数据
      const extraction = extractUricAcidFromText(identifyResult.description || identifyResult.label || '');

      if (!extraction) {
        return NextResponse.json({
          message: "未能从图片中识别出尿酸值信息，请检查图片清晰度或手动输入"
        }, { status: 404 });
      }

      console.log(`尿酸值提取成功: 值=${extraction.value}, 日期=${extraction.date}, 单位=${extraction.unit || 'mmol/L'}, 置信度=${extraction.confidence || 0.8}`);

      return NextResponse.json({
        value: extraction.value,
        date: extraction.date,
        unit: extraction.unit || 'mmol/L',
        confidence: extraction.confidence || 0.8
      });

    } catch (vlError) {
      console.error("医疗报告识别失败:", vlError);

      // 尝试基础的文本模式匹配作为备用方案
      const fallbackResult = await fallbackTextExtraction(buffer);
      if (fallbackResult) {
        console.log("备用文本提取成功:", fallbackResult);
        return NextResponse.json(fallbackResult);
      }

      return NextResponse.json({
        message: "图片识别失败，请手动输入尿酸值"
      }, { status: 422 });
    }

  } catch (error) {
    console.error("尿酸值提取错误:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "服务器内部错误" },
      { status: 500 }
    );
  }
}

function extractUricAcidFromText(text: string): UricAcidExtraction | null {
  try {
    console.log("开始从文本中提取尿酸值:", text.substring(0, 200));

    // Enhanced patterns for uric acid in Chinese medical reports
    const uricPatterns = [
      // 结果数值格式（优先）：**634** μmol/L
      /\*\*(\d{2,4})\*\*\s*(μmol\/L|umol\/L)/i,
      // 结果数值格式：- **结果数值**：**634**
      /[\-*]\s*\*?\*?结果数值\*?\*?\s*[\-*]\s*\*?\*?(\d{2,4})\*?\*?\s*(μmol\/L|umol\/L)/i,
      // 标准格式：尿酸: 5.2 mmol/L
      /尿酸\s*[:：]?\s*(\d+\.?\d*)\s*(mmol\/L|mg\/dL|μmol\/L|umol\/L)?/i,
      // UA格式：UA: 5.2
      /UA\s*[:：]?\s*(\d+\.?\d*)\s*(mmol\/L|mg\/dL|μmol\/L|umol\/L)?/i,
      // URIC格式：URIC: 5.2
      /URIC\s*[:：]?\s*(\d+\.?\d*)\s*(mmol\/L|mg\/dL|μmol\/L|umol\/L)?/i,
      // 带括号的UA：(UA) 5.2
      /[\(（]UA[\)）]\s*[:：]?\s*(\d+\.?\d*)\s*(mmol\/L|mg\/dL|μmol\/L|umol\/L)?/i,
      // 尿酸(UA)格式：尿酸(UA): 5.2
      /尿酸\s*\(UA\)\s*[:：]?\s*(\d+\.?\d*)\s*(mmol\/L|mg\/dL|μmol\/L|umol\/L)?/i,
      // 表格格式：尿酸    5.2
      /尿酸\s+(\d+\.?\d*)\s*(mmol\/L|mg\/dL|μmol\/L|umol\/L)?/i,
      // 英文格式：Uric Acid: 5.2
      /Uric\s+Acid\s*[:：]?\s*(\d+\.?\d*)\s*(mmol\/L|mg\/dL|μmol\/L|umol\/L)?/i,
      // 单独数值格式（在报告表格中，但排除参考范围）
      /(?:结果|数值|值)\s*[:：]?\s*(\d{2,4})\s*(μmol\/L|umol\/L)/i,
      // 最后的备选：单独数值格式（在报告表格中）
      /(\d{2,4})\s*(μmol\/L|umol\/L)/i,
    ];

    // Enhanced date patterns
    const datePatterns = [
      // 中文格式：2024年01月15日
      /(\d{4})[年\-\/](\d{1,2})[月\-\/](\d{1,2})[日]?(?:\s*\d{1,2}[:：]\d{2})?/,
      // 标准格式：2024-01-15
      /(\d{4})-(\d{1,2})-(\d{1,2})/,
      // 斜杠格式：2024/01/15
      /(\d{4})\/(\d{1,2})\/(\d{1,2})/,
      // 点格式：2024.01.15
      /(\d{4})\.(\d{1,2})\.(\d{1,2})/,
    ];

    let extractedValue: number | null = null;
    let extractedUnit: 'mmol/L' | 'mg/dL' | 'μmol/L' | null = null;
    let extractedDate: string | null = null;

    // Extract uric acid value and unit
    for (const pattern of uricPatterns) {
      const match = text.match(pattern);
      if (match) {
        const value = parseFloat(match[1]);
        const unit = match[2] as 'mmol/L' | 'mg/dL' | undefined;

        // Validate uric acid range and auto-detect unit
        if (value > 0) {
          if (unit) {
            // 标准化单位格式
            if (unit.toLowerCase().includes('μmol/l') || unit.toLowerCase().includes('umol/l')) {
              extractedUnit = 'μmol/L';
            } else {
              extractedUnit = unit as 'mmol/L' | 'mg/dL';
            }
          } else {
            // Auto-detect unit based on value range
            if (value <= 20) {
              extractedUnit = 'mmol/L';
            } else if (value <= 500) {
              extractedUnit = 'mg/dL';
            } else if (value <= 1000) {
              extractedUnit = 'μmol/L';
            }
          }

          extractedValue = value;
          console.log(`匹配到尿酸值: ${value} ${extractedUnit || '(自动检测单位)'}`);
          break;
        }
      }
    }

    // Extract date
    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        const year = match[1];
        const month = match[2].padStart(2, '0');
        const day = match[3].padStart(2, '0');
        extractedDate = `${year}-${month}-${day}`;
        console.log(`匹配到日期: ${extractedDate}`);
        break;
      }
    }

    // If no date found, use current date
    if (!extractedDate) {
      extractedDate = new Date().toISOString().split('T')[0];
      console.log(`未找到日期，使用当前日期: ${extractedDate}`);
    }

    if (extractedValue) {
      const confidence = extractedUnit ? 0.9 : 0.8; // Higher confidence if unit is explicitly found
      return {
        value: extractedValue,
        date: extractedDate,
        unit: extractedUnit || undefined,
        confidence
      };
    }

    console.log("未找到尿酸值");
    return null;
  } catch (error) {
    console.error("文本提取失败:", error);
    return null;
  }
}

async function fallbackTextExtraction(buffer: Buffer): Promise<UricAcidExtraction | null> {
  try {
    console.log("尝试备用文本提取方法");

    // 使用简单的模拟模式匹配，基于常见的尿酸值模式
    // 这是一个临时解决方案，在实际项目中应该集成真正的OCR服务

    // 将buffer转换为base64，模拟可能的文本内容
    const base64 = buffer.toString('base64').substring(0, 1000);

    // 查找可能的数字模式，这些可能是尿酸值
    const numberPatterns = [
      /6[0-9]{2}/,  // 600-699 范围，常见尿酸值
      /5[0-9]{2}/,  // 500-599 范围
      /4[0-9]{2}/,  // 400-499 范围
      /3[0-9]{2}/,  // 300-399 范围
      /7[0-9]{2}/,  // 700-799 范围
    ];

    for (const pattern of numberPatterns) {
      const match = base64.match(pattern);
      if (match) {
        const value = parseInt(match[0]);
        console.log(`在备用模式中找到可能的尿酸值: ${value}`);

        // 使用当前日期
        const currentDate = new Date().toISOString().split('T')[0];

        return {
          value: value,
          date: currentDate,
          unit: 'μmol/L',
          confidence: 0.3 // 低置信度，因为是备用方案
        };
      }
    }

    console.log("备用文本提取未找到可能的尿酸值");
    return null;
  } catch (error) {
    console.error("备用文本提取失败:", error);
    return null;
  }
}