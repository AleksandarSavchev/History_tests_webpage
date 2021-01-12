document.addEventListener('DOMContentLoaded', () => {
    const rowTemp = (username, score, time, num) => {
        return `
        <th class="r1">${++num}. ${username}</th>
        <th class="r2">${score}</th>
        <th class="r3">${time}</th>`;
    }
    let table = document.getElementById("tabl");
    fetch(`http://localhost:3000/rankings`, {
        method: "GET",
    })
        .then(response => {
            if (!response.ok)
                return Promise.reject(response.json());
            else {
                return Promise.resolve(response.json());
            }
        })
        .then(data => {
            for (i in data.user) {
                let tr = document.createElement('tr');
                tr.innerHTML = rowTemp(data.user[i], data.score[i], data.time[i], i);
                table.appendChild(tr);
            }
            return;
        })
        .catch(err => {
            alert(err);
        });
})