# 🔐 Authentication & Role-Based Access Control (RBAC)

This service implements **JWT-based authentication** with **Role-Based Access Control (RBAC)** to control access for different user types.

---

## 👥 Supported Roles

The application supports the following roles:

* **Student**
* **Instructor**
* **Admin**

Each user is assigned a role at registration. The role is stored in the database and included in the JWT payload during login.

---

## 🔑 Authentication

### Public Routes

These routes are publicly accessible and do not require authentication.

| Method | Endpoint         | Description                      |
| ------ | ---------------- | -------------------------------- |
| POST   | `/auth/register` | Register a new user              |
| POST   | `/auth/login`    | Authenticate user and return JWT |

---

## 🔒 Authorization (RBAC)

All private routes require:

* A valid JWT token
* A role authorized to access the route

Authorization is enforced using middleware and applied at the **routing level**.

---

## 🛡️ Private Routes (RBAC-Protected)

### Student Routes

```
GET /student/dashboard
```

Accessible only by users with the **Student** role.

---

### Instructor Routes

```
GET /instructor/dashboard
```

Accessible only by users with the **Instructor** role.

---

### Admin Routes

```
GET /admin/dashboard
```

Accessible only by users with the **Admin** role.

Unauthorized users will receive a **403 Forbidden** response.

---

## 🧱 RBAC Design

RBAC is implemented using middleware with clear separation of responsibilities:

* **Authentication Middleware**
  Verifies JWT and attaches the authenticated user to the request.

* **Authorization Middleware**
  Validates whether the user’s role is allowed to access the route.

* **Routes**
  Apply role restrictions declaratively per route group.

Business logic and controllers remain free of authentication and authorization checks.

---

## 🔄 Future Scope

These role-specific dashboard routes serve as the foundation for future features such as:

* User Profile
* Course Access
* Course Management
* Admin Controls

The RBAC implementation is designed to scale without requiring structural changes.

---

## ✅ Summary

* JWT-based authentication implemented
* Role-based access enforced at the routing layer
* Clear separation of public and private routes
* Scalable RBAC architecture

---

