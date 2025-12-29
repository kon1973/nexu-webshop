import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { CheckCircle, XCircle } from "lucide-react"

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { token } = await searchParams

  if (!token || typeof token !== 'string') {
    return <ErrorState message="Hiányzó ellenőrző kód." />
  }

  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  })

  if (!verificationToken) {
    return <ErrorState message="Érvénytelen vagy lejárt ellenőrző kód." />
  }

  if (new Date() > verificationToken.expires) {
    return <ErrorState message="Az ellenőrző kód lejárt." />
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: verificationToken.identifier },
  })

  if (!existingUser) {
    return <ErrorState message="A felhasználó nem található." />
  }

  await prisma.user.update({
    where: { id: existingUser.id },
    data: { emailVerified: new Date() },
  })

  await prisma.verificationToken.delete({
    where: { token },
  })

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4 font-sans">
      <div className="bg-[#121212] border border-white/10 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <h1 className="text-2xl font-bold mb-4">Sikeres aktiválás!</h1>
        <p className="text-gray-400 mb-8">
          Az email címedet sikeresen megerősítettük. Most már bejelentkezhetsz a fiókodba.
        </p>
        <Link
          href="/login"
          className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-colors"
        >
          Bejelentkezés
        </Link>
      </div>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4 font-sans">
      <div className="bg-[#121212] border border-white/10 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle size={40} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-bold mb-4">Hiba történt</h1>
        <p className="text-gray-400 mb-8">{message}</p>
        <Link
          href="/"
          className="block w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-colors"
        >
          Vissza a főoldalra
        </Link>
      </div>
    </div>
  )
}
