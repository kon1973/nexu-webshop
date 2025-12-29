import { auth } from "@/lib/auth"
import { getUserAddressesService } from "@/lib/services/userService"
import { redirect } from "next/navigation"
import AddressManager from "./AddressManager"

export default async function AddressesPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const addresses = await getUserAddressesService(session.user.id)

  return <AddressManager initialAddresses={addresses} />
}
