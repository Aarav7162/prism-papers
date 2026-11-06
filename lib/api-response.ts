import { NextResponse } from "next/server";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}

export function apiSuccess<T>(
  data: T,
  status = 200,
  headers?: Record<string, string>
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    {
      status,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    }
  );
}

export function apiError(
  error: string,
  status = 400,
  details?: unknown
): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    {
      success: false,
      error,
      ...(details !== undefined ? { details } : {}),
    },
    {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

