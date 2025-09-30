document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const form = e.target;

    try {
        const res = await fetch("http://localhost:4000/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fullName: form.elements.fullName.value,
                user: form.elements.user.value,
                email: form.elements.email.value,
                password: form.elements.password.value,
                confirmPassword: form.elements.confirm_password.value
            })
        });

        const data = await res.json();
        console.log(data);

    } catch (err) {
        console.error("Error:", err);
    }
});
