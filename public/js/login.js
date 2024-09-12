import axios from "axios";

export async function login(email, password) {
  let error = false;
  let data;
  try {
    const res = await axios({
      method: "POST",
      url: "http://127.0.0.1:3000/api/auth/login",
      data: {
        email,
        password,
      },
    });
    if (res.data.status === "success") location.assign("/");
    return { error };
  } catch (err) {
    error = err.response.data.message;
    return { error };
  }
}
