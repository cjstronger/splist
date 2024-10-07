import axios from "axios";

export async function login(email, password) {
  console.log(email, password);
  let error = false;
  let data;
  try {
    const res = await axios.post("/api/auth/login", {
      data: {
        email,
        password,
      },
    });
    if (res.data.status === "success") location.assign("/");
    return { error };
  } catch (err) {
    console.log(err);
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
      data: {
        email,
        password,
        confirmPassword,
      },
    });
    if (res.data.status === "success") location.assign("/");
    return { error };
  } catch (err) {
    error = err.response.data.message;
    return { error };
  }
}
