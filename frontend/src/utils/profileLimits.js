export const PROFILE_LIMITS = {
  username: 50,
  bio: 500,
  personality_type: 50,
  nearest_city: 100,
  hobbies: 255,
  hobbyItem: 25,
};

export function applyLimit(value = "", max) {
  if (!max || typeof max !== "number") return value ?? "";
  const str = String(value ?? "");
  return str.length > max ? str.slice(0, max) : str;
}
