import api, { ensureCsrf } from "./api";

// Shapes per backend/docs: backend/docs/Users.md
// GET /api/users -> { user: { ...fields } }
export async function getCurrentUser() {
  const res = await api.get("/users");
  return res.data?.user;
}

// PUT /api/users -> { user: { ...fields } }
// Accepts a partial payload; only send fields to change to avoid overwrites
export async function updateCurrentUser(patch = {}) {
  try {
    await ensureCsrf();
    // whitelist only permitted fields to avoid accidental overwrite
    const allowed = [
      "username",
      "display_name",
      "profile_picture_url",
      "bio",
      "personality_type",
      "nearest_city",
      "hobbies", // now array of strings
    ];
    const body = Object.fromEntries(
      Object.entries(patch).filter(
        ([k, v]) => allowed.includes(k) && v !== undefined
      )
    );
    if (Array.isArray(body.hobbies)) {
      // client-side sanitization: trim, remove empties, enforce limits
      const cleaned = body.hobbies
        .map((h) => (typeof h === "string" ? h.trim() : ""))
        .filter((h) => h.length > 0)
        .slice(0, 4)
        .map((h) => (h.length > 25 ? h.slice(0, 25) : h));
      body.hobbies = cleaned;
    }
    const res = await api.put("/users", body);
    return res.data?.user;
  } catch (err) {
    const status = err?.response?.status;
    const message =
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      "Update failed";
    if (status === 400 && /Username already in use/i.test(message)) {
      throw Object.assign(new Error("Username already in use"), {
        code: "USERNAME_TAKEN",
        message: "Username already in use",
      });
    }
    if (status === 401) {
      throw Object.assign(new Error("Unauthorized"), {
        code: "UNAUTHORIZED",
        message: "Unauthorized",
      });
    }
    throw Object.assign(new Error(message), { code: "UNKNOWN" });
  }
}

// DELETE /api/users -> 204 No Content
export async function deleteAccount() {
  try {
    await ensureCsrf();
    await api.delete("/users");
    return true;
  } catch (err) {
    const status = err?.response?.status;
    const message =
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      "Delete failed";
    if (status === 401) {
      throw Object.assign(new Error("Unauthorized"), {
        code: "UNAUTHORIZED",
        message: "Unauthorized",
      });
    }
    throw Object.assign(new Error(message), { code: "UNKNOWN" });
  }
}
