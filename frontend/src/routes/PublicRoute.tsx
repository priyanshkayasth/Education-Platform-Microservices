import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import type { JSX } from "react"
import { roleRedirect } from "../utils/roleCheck"

export default function PublicRoute({
  children,
}: {
  children: JSX.Element
}) {
  const { user, loading, isLoggingOut } = useAuth()

  if (loading || isLoggingOut) {
    return <div>Loading...</div>
  }

  if (user) {
    return <Navigate to={roleRedirect(user.role)} replace />
  }

  return children
}
