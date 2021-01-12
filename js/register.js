document.getElementById("submit").addEventListener("click", function (event) {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const password2 = document.getElementById("password2").value;
    const data = { username: username, password: password, password2: password2};
    fetch(`http://localhost:3000/register`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
              },
            body: JSON.stringify(data),
        })
        .then(response => {
            console.log(response.ok);
            if (!response.ok)
                return Promise.reject(response.json());
        })
        .then(() => {
            window.location.href = "http://localhost:3000/login";
        })
        .catch((err) => err.then(errData => {
            const errEl = document.getElementById("err");
            errEl.style.display = "block";
            errEl.innerHTML = errData.message;
        }));
});