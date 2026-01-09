import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"

// Get Google credentials - support both naming conventions
const googleClientId = process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET

// Debug logging
if (process.env.NODE_ENV === 'development' || process.env.VERCEL) {
  console.log('[Auth] Google Client ID exists:', !!googleClientId)
  console.log('[Auth] Google Client Secret exists:', !!googleClientSecret)
  console.log('[Auth] AUTH_SECRET exists:', !!process.env.AUTH_SECRET)
}

// Build providers array dynamically
const providers: any[] = []

// Only add Google provider if credentials are available AND valid
if (googleClientId && googleClientSecret && googleClientId.length > 10 && googleClientSecret.length > 10) {
  providers.push(
    Google({
      clientId: googleClientId.trim(),
      clientSecret: googleClientSecret.trim(),
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  )
  console.log('[Auth] Google provider added')
} else {
  console.log('[Auth] Google provider skipped - missing or invalid credentials')
}

// Always add Credentials provider
providers.push(
  Credentials({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null

      const user = await prisma.user.findUnique({
        where: { email: credentials.email as string },
      })

      if (!user || !user.password) return null

      if (!user.emailVerified) {
        throw new Error("EmailNotVerified")
      }

      if (user.isBanned) {
        throw new Error("UserBanned")
      }

      const isValid = await bcrypt.compare(credentials.password as string, user.password)

      if (!isValid) return null

      return user
    },
  })
)

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },
  trustHost: true, // Required for Vercel deployment
  debug: process.env.NODE_ENV === 'development', // Enable debug in dev
  secret: process.env.AUTH_SECRET,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider !== 'credentials' && user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        })
        if (existingUser?.isBanned) {
          return false
        }
      }
      return true
    },
  },
  providers,
})
