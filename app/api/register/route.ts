import { NextResponse } from "next/server"
import { registerUserService } from "@/lib/services/authService"
import { headers } from "next/headers"
import { z } from "zod"
import { enforceRateLimit, rateLimitExceededResponse } from '@/lib/enforceRateLimit'

export async function POST(request: Request) {
  try {
    const ip = (await headers()).get("x-forwarded-for") ?? "127.0.0.1"
    const rl = await enforceRateLimit(ip, 5, 60, 'register')
    if (!rl.success) return rateLimitExceededResponse(undefined, rl.reset)

    const body = await request.json()
    const result = await registerUserService(body)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Registration error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.issues[0].message }, { status: 400 })
    }
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Hiba történt a regisztráció során." },
      { status: 500 }
    )
  }
}

