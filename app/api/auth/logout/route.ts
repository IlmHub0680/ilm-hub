import { NextResponse } from "next/server";
import { clearLoginSession } from "@/lib/auth";

export async function POST() {
  try {
    await clearLoginSession();

    return NextResponse.json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    console.error("Logout error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to complete logout.",
      },
      { status: 500 }
    );
  }
}
