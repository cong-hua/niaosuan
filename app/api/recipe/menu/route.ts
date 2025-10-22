import { NextResponse } from "next/server";
import { generateDailyMenu } from "@/lib/ai-recipe";
import type { RecipeGenerationRequest } from "@/lib/recipe";

// export const runtime = "edge"; // Disabled for compatibility

export async function POST(request: Request) {
  const startTime = Date.now();
  console.log("开始处理每日菜单生成请求");

  try {
    const body: RecipeGenerationRequest = await request.json();

    // 验证必要字段
    if (!body.userLevel) {
      return NextResponse.json(
        { message: "缺少用户尿酸水平信息" },
        { status: 400 }
      );
    }

    console.log(`每日菜单生成参数:`, {
      userLevel: body.userLevel,
      gender: body.gender,
      preferences: body.preferences,
      allergies: body.allergies,
      calorieTarget: body.calorieTarget
    });

    const dailyMenu = await generateDailyMenu(body);
    console.log(`每日菜单生成成功, 总耗时: ${Date.now() - startTime}ms`);

    return NextResponse.json(dailyMenu);
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`每日菜单生成失败，总耗时: ${totalTime}ms`, error);

    let status = 500;
    let message = "每日菜单生成失败，请稍后再试";

    if (error instanceof Error) {
      message = error.message;

      // 根据错误类型返回不同的状态码
      if (message.includes("API Key")) {
        status = 503; // 服务不可用
      } else if (message.includes("网络") || message.includes("fetch") || message.includes("timeout")) {
        status = 502; // 网关错误
      } else if (message.includes("参数") || message.includes("缺少")) {
        status = 400; // 请求参数错误
      }
    }

    return NextResponse.json({
      message,
      timestamp: new Date().toISOString(),
      duration: totalTime
    }, { status });
  }
}