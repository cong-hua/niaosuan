import { NextResponse } from "next/server";
import { createUser } from "@/lib/supabase";
import { CreateUserRequest } from "@/lib/supabase";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, username, phone } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "邮箱和密码不能为空" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "密码长度至少6位" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "邮箱格式不正确" },
        { status: 400 }
      );
    }

    const userData: CreateUserRequest = {
      email,
      password,
      username,
      phone
    };

    const user = await createUser(userData);

    return NextResponse.json({
      message: "注册成功",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        phone: user.phone,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error("用户注册错误:", error);

    if (error instanceof Error) {
      if (error.message === "邮箱已被注册") {
        return NextResponse.json(
          { message: error.message },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { message: error.message || "注册失败" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "服务器内部错误" },
      { status: 500 }
    );
  }
}