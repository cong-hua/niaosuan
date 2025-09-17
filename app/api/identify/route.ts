import { NextResponse } from "next/server";
import { identifyFood } from "@/lib/ali-vl";
import { MAX_UPLOAD_SIZE } from "@/lib/purine";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const startTime = Date.now();
  console.log("开始处理图片识别请求");

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

    const result = await identifyFood(buffer);
    console.log(`识别成功: ${result.foodName}, 总耗时: ${Date.now() - startTime}ms`);

    return NextResponse.json({ foodName: result.foodName, label: result.label ?? result.foodName });
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`识别失败，总耗时: ${totalTime}ms`, error);

    let status = 500;
    let message = "识别失败，请稍后再试";

    if (error instanceof Error) {
      message = error.message;

      // 根据错误类型返回不同的状态码
      if (message.includes("API Key")) {
        status = 503; // 服务不可用
      } else if (message.includes("网络") || message.includes("fetch") || message.includes("timeout")) {
        status = 502; // 网关错误
      } else if (message.includes("未能识别") || message.includes("图片")) {
        status = 422; // 无法处理的实体
      } else if (message.includes("图片过大")) {
        status = 413; // 实体过大
      }
    }

    return NextResponse.json({
      message,
      timestamp: new Date().toISOString(),
      duration: totalTime
    }, { status });
  }
}
