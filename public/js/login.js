import axios from "axios";

export async function login(email, password) {
  let error = false;
  try {
    const res = await axios.post("/api/auth/login", {
      email,
      password,
    });
    if (res.data.status === "success") location.assign("/");
    return { error };
  } catch (err) {
    error = err.response.data.message;
    return { error };
  }
}

export async function logout() {
  try {
    const res = await axios.post("/api/auth/logout");
    if (res.data.status === "success") location.assign("/");
  } catch (err) {
    return err;
  }
}

export async function signUp(email, password, confirmPassword) {
  let error = false;
  try {
    const res = await axios.post("/api/auth/signup", {
      email,
      password,
      confirmPassword,
    });
    if (res.data.status === "success") location.assign("/thank-you");
    return { error };
  } catch (err) {
    error = err.response.data.message;
    return { error };
  }
}

export async function forgotPassword(email) {
  let error = false;
  try {
    const { data } = await axios.post("/api/auth/forgot-password", {
      email,
    });
    if (data.status === "success") return { error };
  } catch (err) {
    error = err.response.data.message;
    return { error };
  }
}

export async function resetPassword(password, confirmPassword, token) {
  let error = false;
  try {
    const { data } = await axios.patch(`/api/auth/reset-password/${token}`, {
      password,
      confirmPassword,
    });
    if (data.status === "success") return { error };
  } catch (err) {
    error = err.response.data.message;
    return { error };
  }
}
