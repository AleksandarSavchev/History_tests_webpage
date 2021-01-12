document.getElementById("link").addEventListener("click", function (event) {
    event.preventDefault();
    fetch(`http://localhost:3000/logout`, {
            method: "POST",
        })
        .then(response => {
            console.log(response.ok);
            if (!response.ok)
                return Promise.reject(response.json());
        })
        .then(() => {
            window.location.href = "http://localhost:3000/login";
        })
        .catch((err) => {
            alert(err);
        });
});