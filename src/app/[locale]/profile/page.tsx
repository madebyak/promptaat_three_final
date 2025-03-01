import { getTranslations } from "next-intl/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ProfilePage() {
  const t = await getTranslations("Profile")
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    // redirect("/auth/login")
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">{t("name")}</h3>
              <p>{session?.user?.name}</p>
            </div>
            <div>
              <h3 className="font-medium">{t("email")}</h3>
              <p>{session?.user?.email}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
