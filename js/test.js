document.addEventListener('DOMContentLoaded', () => {
    const questionTemplate = (question, num) => {
        let text = `<div class="question">
        <p class="qtext" id="${"q" + num}">${num + ". " + question.q_text}</p>`;
        let sym = ['а', 'б', 'в', ' г'];
        for (i in question.q_ans) {
            text += `<input type="radio" id="${"opt" + num + (parseInt(i) + 1)}" name="${"q" + num}" class="option" value="${i}">
            <label for="${"opt" + num + (parseInt(i) + 1)}" class="label">
            ${sym[i]}) ${question.q_ans[i]}
            </label>`
        }
        return text;
    }
    let form = document.getElementById("quiz");
    fetch(`http://localhost:3000/questions`, {
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
            let question = {}
            for (let i = 0; i < 10; i++) {
                question = {
                    q_text: data.q_text[i],
                    q_ans: data.q_ans[i]
                }
                let div = document.createElement('div');
                div.innerHTML = questionTemplate(question, i + 1);
                form.appendChild(div);
            }
            return;
        })
        .catch(err => {
            alert(err);
        });
})

let end = false;
document.getElementById("submit").addEventListener("click", function(event) {
    event.preventDefault;
    const tipTemplate = (question) => {
        return `<div class="info">
        <span >${" " + question.q_text}</span><br><br>
        Кратка подсказка: ${question.q_expl}<br><br>
    </div>`
    }
    let form = document.getElementById('quiz');
    let ans = [];
    for (let i = 1; i <= 10; i++) {
        ans.push(form["q" + i].value);
    }
    let data = { q_ans: ans };
    fetch(`http://localhost:3000/grade`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => {
            if (!response.ok)
                return Promise.reject(response.json());
            else
                return Promise.resolve(response.json());
        })
        .then((res) => {
            console.log(res);
            let cont = document.getElementById("end");
            let question = {}
            for (i in res.q_text) {
                question = {
                    q_text: res.q_text[i],
                    q_expl: res.q_expl[i]
                }
                let div = document.createElement('div');
                div.innerHTML = tipTemplate(question);
                cont.appendChild(div);
            }
            let elScore = document.getElementById("score");
            elScore.innerHTML = `Точки: ${res.score} от ${res.max_score}`;
            if (res.score == 10)
                document.getElementById("endt").innerHTML = "";
            end = true;

            form.style.display = "none";
            cont.style.display = "block";
        })
        .catch((err) => {
            alert(err);
        });
});

window.setInterval(timer, 1000)

function timer() {
    if (end) {
        return false;
    }
    let sec = document.getElementById("sec").innerHTML;
    let min = document.getElementById("min").innerHTML;
    if (sec == 59) {
        sec = "00";
        min++;
        document.getElementById("min").innerHTML = min;
        document.getElementById("sec").innerHTML = sec;
    } else {
        sec++;
        if (sec / 10 < 1) {
            sec = "0" + sec;
        }
        document.getElementById("sec").innerHTML = sec;
    }
}