import { useState } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";
const useSignup = () => {
  const [loading, setLoading] = useState(false);
  const { setAuthUser } = useAuthContext();
  const signup = async ({ email, username, password, confirmPassword }) => {
    const success = handleInputErrors({
      email,
      username,
      password,
      confirmPassword,
    });
    if (!success) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          username,
          password,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      localStorage.setItem("user-info", JSON.stringify(data));
      setAuthUser(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { loading, signup };
};

export default useSignup;

function handleInputErrors({ email, username, password, confirmPassword }) {
  if (!email || !username || !password || !confirmPassword) {
    toast.error("Please fill in all fields");
    return false;
  }
  const email_regex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!email_regex.test(email)) {
    toast.error("Invalid email");
    return false;
  }
  if (password !== confirmPassword) {
    toast.error("Passwords do not match");
    return false;
  }
  if (password.length < 1) {
    toast.error("Password too short");
    return false;
  }
  if (password.length > 20) {
    toast.error("Password too long");
    return false;
  }
  const username_regex = /^[a-zA-Z0-9_ඞ]+$/;
  if (!username_regex.test(username)) {
    toast.error("Username has invalid characters");
    return false;
  }
  if (username.length < 1) {
    toast.error("Username too short");
    return false;
  }
  if (username.length > 15) {
    toast.error("Username too long");
    return false;
  }
  return true;
}

// #[validate(email)]
// pub email: &'r str,
// #[validate(length(min = 1, max = 15), regex(path = *ALPHA_NUM))]
// pub username: &'r str,
// #[validate(length(min = 1, max = 20))]
// pub password: &'r str,
// #[validate(length(min = 1, max = 20))]
// pub confirm_password: &'r str,
