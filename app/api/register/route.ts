import { NextResponse } from "next/server"
import { registerUserService } from "@/lib/services/authService"
import { checkRateLimit } from "@/lib/ratelimit"
import { headers } from "next/headers"
import { z } from "zod"

export async function POST(request: Request) {
  try {
    const ip = (await headers()).get("x-forwarded-for") ?? "127.0.0.1"
    const { success } = await checkRateLimit(ip)
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Túl sok kérés. Kérjük, próbáld újra később." },
        { status: 429 }
      )
    }

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

