import { NextResponse } from "next/server";
import { createUricAcidRecord, getUricAcidRecords } from "@/lib/supabase";
import { CreateUricAcidRecordRequest } from "@/lib/supabase";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_id, value, measurement_date, notes } = body;

    if (!user_id || !value) {
      return NextResponse.json(
        { message: "用户ID和尿酸值不能为空" },
        { status: 400 }
      );
    }

    if (typeof value !== 'number' || value <= 0) {
      return NextResponse.json(
        { message: "尿酸值必须是大于0的数字" },
        { status: 400 }
      );
    }

    if (value > 2000) {
      return NextResponse.json(
        { message: "尿酸值不能超过2000 μmol/L" },
        { status: 400 }
      );
    }

    const recordData: CreateUricAcidRecordRequest = {
      value,
      measurement_date,
      notes
    };

    const record = await createUricAcidRecord(user_id, recordData);

    return NextResponse.json({
      message: "尿酸记录创建成功",
      record: {
        id: record.id,
        user_id: record.user_id,
        value: record.value,
        measurement_date: record.measurement_date,
        notes: record.notes,
        created_at: record.created_at
      }
    });

  } catch (error) {
    console.error("创建尿酸记录错误:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message || "创建尿酸记录失败" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "服务器内部错误" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!user_id) {
      return NextResponse.json(
        { message: "用户ID不能为空" },
        { status: 400 }
      );
    }

    const records = await getUricAcidRecords(user_id, limit);

    return NextResponse.json({
      message: "获取尿酸记录成功",
      records: records.map(record => ({
        id: record.id,
        user_id: record.user_id,
        value: record.value,
        measurement_date: record.measurement_date,
        notes: record.notes,
        created_at: record.created_at
      }))
    });

  } catch (error) {
    console.error("获取尿酸记录错误:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message || "获取尿酸记录失败" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "服务器内部错误" },
      { status: 500 }
    );
  }
}