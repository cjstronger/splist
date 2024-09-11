import React, { useEffect, useState } from "react";

export default function HomePage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  function handleSubmit(e) {
    e.preventDefault();
    console.log(email);
    console.log(password);
  }
  useEffect(() => {
    const form = document.getElementById("form");
    console.log(form); // This should log the form element to the console
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        console.log("Form submit event prevented");
      });
    } else {
      console.error("Form element not found");
    }
  }, []);
  return (
    <div>
      <h1>Hello this is home</h1>
      <form onSubmit={handleSubmit} id="form">
        <input
          onChange={(e) => setEmail(e.target.value)}
          className="loginEmail"
          placeholder="email"
        />
        <input
          onChange={(e) => setPassword(e.target.value)}
          className="loginPassword"
          placeholder="password"
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
