import { NextResponse } from "next/server";
import { loginUser } from "@/lib/supabase";
import { LoginRequest } from "@/lib/supabase";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "邮箱和密码不能为空" },
        { status: 400 }
      );
    }

    const loginData: LoginRequest = {
      email,
      password
    };

    const user = await loginUser(loginData);

    return NextResponse.json({
      message: "登录成功",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        phone: user.phone,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error("用户登录错误:", error);

    if (error instanceof Error) {
      if (error.message === "邮箱或密码错误") {
        return NextResponse.json(
          { message: error.message },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { message: error.message || "登录失败" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "服务器内部错误" },
      { status: 500 }
    );
  }
}