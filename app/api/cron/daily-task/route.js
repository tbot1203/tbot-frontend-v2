import { NextResponse } from 'next/server';

export async function GET() {
  const BASE_URL = "https://tbt-backend.onrender.com/api";

  try {
    const refreshResponse = await fetch(`${BASE_URL}/account/refresh-all-profiles`, {
      method: "POST"
    });
    const refreshData = await refreshResponse.json();

    const emailResponse = await fetch(`${BASE_URL}/usage/email-today`, {
      method: "POST"
    });
    const emailData = await emailResponse.json();

    return NextResponse.json({
      success: true,
      refresh_result: refreshData,
      email_result: emailData
    });
  } catch (error) {
    console.error("Error calling APIs:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
