// src/utils/roleRedirect.ts

export type UserRole = "student" | "instructor" | "admin"

export const roleRedirect = (role: UserRole): string => {
  switch (role) {
    case "student":
      return "/student"
    case "instructor":
      return "/instructor"
    case "admin":
      return "/admin"
    default:
      return "/login"
  }
}
