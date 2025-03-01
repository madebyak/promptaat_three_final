export default function ResetPasswordRedirectLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Minimal layout for redirecting 
  return (
    <div className="container flex h-screen items-center justify-center">
      {children}
    </div>
  )
}
