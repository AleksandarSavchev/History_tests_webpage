document.getElementById("submit").addEventListener("click", function (event) {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const data = { username: username, password: password };
    fetch(`http://localhost:3000/login`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
              },
            body: JSON.stringify(data),
        })
        .then(response => {
            if (!response.ok)
                return Promise.reject(response.json());
        })
        .then(() => {
            window.location.href = "http://localhost:3000/index";
        })
        .catch((err) => err.then(errData => {
            const errEl = document.getElementById("err");
            errEl.style.display = "block";
            errEl.innerHTML = errData.message;
        }));
});