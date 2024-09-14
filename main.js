let global_controller = {}

async function startQuiz(e) {
    let topic;
    if (! e.target.classList.contains("topic")) {
        if (! e.target.parentNode.classList.contains("topic")) {
            topic = e.target.parentNode.parentNode.querySelector("p").textContent;
        }
        else {
            topic = e.target.parentNode.querySelector("p").textContent;
        }
    }
    else {
        topic = e.target.querySelector("p").textContent;
    }
    
    let question = document.querySelector(".question");
    question.querySelector("h1").remove();
    let questionSlot = question.querySelector("p");

    let curr_number_question = document.querySelector(".curr_question_number");
    curr_number_question.classList.remove("hidden");
    let curr_number = document.querySelector(".current_number");
    
    let progressBar = document.querySelector(".progress_bar");
    progressBar.removeAttribute("data-initial");
    progressBar.querySelector("p").remove();
    let bar = document.querySelector(".bar");
    bar.classList.remove("hidden");
    let progress = document.querySelector(".current_bar");

    let topics = document.querySelector(".topics");
    topics.classList.add("hidden");

    let answers = document.querySelector(".answers");
    answers.classList.remove("hidden");

    let {quizzes} = await fetch("data.json").then((resp) => resp.json());
    let selected = quizzes.filter((quiz) => {
        return quiz.title === topic;
    })[0];

    global_controller.questionNumber = curr_number;
    global_controller.questionSlot = questionSlot;
    global_controller.progress = progress;
    global_controller.currNumber = 0;
    global_controller.questions = selected.questions;
    global_controller.score = 0;

    selectTopic(topic, selected.icon);
    updateQuiz(curr_number, questionSlot, progress, 0, selected.questions, 0);
}


function selectTopic(topic, url) {
    let colors = {
        "HTML" : "hsla(0, 82%, 63%, 0.2)",
        "CSS" : "hsla(151, 70%, 50%, 0.2)",
        "JavaScript" : "hsla(216, 47%, 78%, 0.3)", 
        "Accessibility" : "hsla(277, 91%, 56%, 0.2)"
    }
    
    let box = document.querySelector(".selected_topic");
    let image = document.createElement("img");
    image.src = url;
    let image_box = box.querySelector(".img_selected");
    image_box.appendChild(image);
    image_box.style.backgroundColor = colors[topic];
    box.querySelector("p").textContent = topic;
}

function updateQuiz(questionNumber, question, bar, curr_number, questions, curr_score) {
    if (curr_number == 10) {
        showResult();
        return;
    }
    updateQuestionNumber(questionNumber, curr_number + 1);
    updateQuestion(question, questions[curr_number]);
    updateBar(bar, String((curr_number + 1) * 10) + "%");
}

function updateQuestionNumber(slot, number) {
    slot.textContent = number;
}

function updateQuestion(slot, question_object) {
    slot.textContent = question_object.question;
    let answers = document.querySelectorAll(".answer");
    for (i = 0; i < question_object.options.length; i++) {
        let curr_ans = answers[i].querySelector(".choice p:nth-child(2)");
        curr_ans.textContent = question_object.options[i];
    }
}

function updateBar(slot, percentage) {
    slot.style.width = percentage;
}

let topics = document.querySelectorAll(".topics");
topics.forEach((el) => {
    el.addEventListener("click", startQuiz);
})

let answers = document.querySelectorAll(".answer");
answers.forEach((el) => {
    el.addEventListener("click", selectAnswer);
})


function selectAnswer(e) {
    let chosen;
    if (! e.target.classList.contains("answer")) {
        if (! e.target.parentNode.classList.contains("answer")) {
            chosen = e.target.parentNode.parentNode.querySelector(".choice p:nth-child(2)");
        }
        else {
            chosen = e.target;
        }
    }
    else {
        chosen = e.target.querySelector(".choice p:nth-child(2)");
    }

    document.querySelectorAll(".answer").forEach((el) => {
        el.removeAttribute("data-selected");
    })

    let curr_ans;

    if (chosen.classList.contains("choice")) {
        chosen.parentNode.dataset.selected = true;
        curr_ans = chosen.querySelector("p:nth-child(2)").textContent;
    }
    else {
        chosen.parentNode.parentNode.dataset.selected = true;
        curr_ans = chosen.parentNode.parentNode.querySelector("p:nth-child(2)").textContent;
    }
    global_controller.currAns = curr_ans;

}

let submit_button = document.querySelector(".submit");
submit_button.addEventListener("click", checkAnswer);

function checkAnswer(e) {
    if (e.target.textContent == "Submit answer") {
        let chosen = document.querySelector("[data-selected]");
        if (chosen === null) {
            showError();
            return;
        }
        let ans = global_controller.questions[global_controller.currNumber].answer;
        let curr_ans = global_controller.currAns;

        updateScore(ans, curr_ans);
        e.target.textContent = "Next Question";
        return;
    }
    updateQuiz(global_controller.questionNumber, global_controller.questionSlot,
        global_controller.progress, global_controller.currNumber,
        global_controller.questions, global_controller.score);
    document.querySelector(".submit").textContent = "Submit answer";
    document.querySelectorAll(".result").forEach((el) => {
        el.childNodes.forEach((ch) => {
            ch.remove();
        });
    });

    document.querySelectorAll(".answer").forEach((el) => {
        el.classList.remove("green_border");
        el.classList.remove("red_border");
        el.querySelector(".choice p:first-child").classList.remove("green_background");
        el.querySelector(".choice p:first-child").classList.remove("red_background");
        el.removeAttribute("data-selected");
    })
    document.querySelector(".error").classList.add("hidden");
}

function showError() {
    document.querySelector(".error").classList.remove("hidden");
}

function updateScore(ans, curr_ans) {
    let selected = document.querySelector("[data-selected]");
    let correct_icon = document.createElement("img");
    correct_icon.src = "./assets/images/icon-correct.svg";
    let error_icon = document.createElement("img");
    error_icon.src = "./assets/images/icon-error.svg";
    let iconSlot = selected.querySelector(".result");
    if (ans == curr_ans) {
        selected.classList.add("green_border");
        selected.querySelector(".choice p:first-child").classList.add("green_background");
        global_controller.score = global_controller.score + 1;
        iconSlot.appendChild(correct_icon);
    }
    else {
        selected.classList.add("red_border");
        selected.querySelector(".choice p:first-child").classList.add("red_background");
        iconSlot.appendChild(error_icon);
        let correct_slot;
        let answers = document.querySelectorAll(".answer");
        answers.forEach((el) => {
            if (el.querySelector(".choice p:nth-child(2)").textContent == ans) {
                correct_slot = el;
            }
        })
        correct_slot.querySelector(".result").appendChild(correct_icon);
    }
    global_controller.currNumber = global_controller.currNumber + 1;

}

function showResult() {
    let question = document.querySelector(".question_box");
    let answers = document.querySelector(".answers");
    let result = document.querySelector(".result_container");

    question.classList.add("hidden");
    answers.classList.add("hidden");

    result.classList.remove("hidden");
    let topic = document.querySelector(".selected_topic").cloneNode(true);
    let score_container = document.querySelector(".result_score");
    let score = document.querySelector(".score");
    score.textContent = global_controller.score;
    score_container.insertBefore(topic, score);
}

document.querySelector(".reset").addEventListener("click", (e) => {
    e.target.querySelector("a").click();
})