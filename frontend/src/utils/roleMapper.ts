// Frontend roles (lowercase)
export type FrontendRole = "student" | "instructor" | "admin";

// Backend roles (uppercase)
export type BackendRole = "STUDENT" | "INSTRUCTOR" | "ADMIN";

// Convert backend → frontend
export const toFrontendRole = (role: BackendRole): FrontendRole => {
  switch (role) {
    case "STUDENT":
      return "student";
    case "INSTRUCTOR":
      return "instructor";
    case "ADMIN":
      return "admin";
    default:
      throw new Error("Invalid backend role");
  }
};

// Convert frontend → backend
export const toBackendRole = (role: FrontendRole): BackendRole => {
  switch (role) {
    case "student":
      return "STUDENT";
    case "instructor":
      return "INSTRUCTOR";
    case "admin":
      return "ADMIN";
    default:
      throw new Error("Invalid frontend role");
  }
};
