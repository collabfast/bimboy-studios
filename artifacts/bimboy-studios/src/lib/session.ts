const KEY = "bimboy_user_id";

export function getUserId(): string {
  if (typeof window === "undefined") return "u_anon";
  let id = window.localStorage.getItem(KEY);
  if (!id) {
    id = "u_" + Math.random().toString(36).slice(2, 10);
    window.localStorage.setItem(KEY, id);
  }
  return id;
}
