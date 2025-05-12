import { NextResponse } from 'next/server';

export async function GET() {
  const API_URL = "https://tbt-backend.onrender.com/logs/cleanup-old-records";

  try {
    const response = await fetch(API_URL, {
      method: "DELETE"
    });

    const data = await response.json();

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error calling cleanup API:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
