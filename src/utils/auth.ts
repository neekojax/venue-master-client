// utils/auth.ts
export const checkLogin = () => {
  const userId = localStorage.getItem("user_id");

  if (!userId && window.location.pathname != "/login") {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/login";
  }
};
