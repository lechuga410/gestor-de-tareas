document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: form.elements.fullName.value,
        password: form.elements.password.value
      })
    });

    const data = await res.json();

    if (data.ok) {
      window.location.href = "/inicio.html"; // redirige
    } else {
      console.log("Login fallido"); // o mostrar un div discreto
      document.querySelector(".error").classList.remove("escondido");
    }
  } catch (err) {
    console.error("Error:", err);
  }
});
