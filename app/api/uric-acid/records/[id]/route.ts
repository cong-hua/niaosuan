import { NextResponse } from "next/server";
import { updateUricAcidRecord, deleteUricAcidRecord, UpdateUricAcidRecordRequest } from "@/lib/supabase";

export const runtime = "edge";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const record = await updateUricAcidRecord(params.id, {
      value,
      measurement_date,
      notes
    });

    return NextResponse.json({
      message: "尿酸记录更新成功",
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
    console.error("更新尿酸记录错误:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message || "更新尿酸记录失败" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "服务器内部错误" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteUricAcidRecord(params.id);

    return NextResponse.json({
      message: "尿酸记录删除成功"
    });

  } catch (error) {
    console.error("删除尿酸记录错误:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message || "删除尿酸记录失败" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "服务器内部错误" },
      { status: 500 }
    );
  }
}