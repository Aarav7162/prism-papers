import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Check DB connection
    let dbStatus = "connected";
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (e: any) {
      dbStatus = `disconnected (${e.message || "error"})`;
    }

    return NextResponse.json({
      status: "healthy",
      service: "PRISM Backend API",
      timestamp: new Date().toISOString(),
      database: dbStatus,
      uptime: process.uptime(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "unhealthy", error: error.message },
      { status: 500 }
    );
  }
}

