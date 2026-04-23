document.addEventListener('DOMContentLoaded', () => {

    let quizData = null;
    let currentQuestionIndex = 0;
    let isQuizSubmitted = false;
    let userSelect = [];

    const titleElem = document.getElementById("questionTitle");
    const formElem = document.getElementById("questionsForm");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const submitBtn = document.getElementById("submitBtn");
    const buttonsContainer = document.querySelector(".buttons");

    async function loadQuestions() {
        try {
            const response = await fetch('questions.json');

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            quizData = await response.json();
            userSelect = new Array(quizData.questions.length).fill(null);

            renderQuestion();
        } catch (error) {
            titleElem.innerHTML = "Chyba při načítání kvízu (Běží přes Live Server?)";
            console.error(error);
        }
    }

    function renderQuestion() {
        if (!quizData) return;

        formElem.innerHTML = "";
        if (isQuizSubmitted) {
            titleElem.innerHTML = "Výsledky kvízu";
            if (buttonsContainer) {
                buttonsContainer.style.display = "none";
            }

            quizData.questions.forEach((q, qIndex) => {
                const questionBlock = document.createElement('div');
                questionBlock.className = "summary-block";

                const qTitle = document.createElement('h3');
                qTitle.innerText = `${qIndex + 1}. ${q.questionText}`;
                questionBlock.appendChild(qTitle);

                q.answers.forEach((answer, aIndex) => {
                    const div = document.createElement('div');
                    div.className = "answer-item";

                    const isSelected = userSelect[qIndex] === aIndex;

                    if (isSelected) {
                        if (answer.isCorrect) {
                            div.classList.add('correct');
                        } else {
                            div.classList.add('incorrect');
                        }
                    } else if (answer.isCorrect) {
                        div.style.border = "2px solid #16a34a";
                    }

                    const radio = document.createElement('input');
                    radio.type = 'radio';
                    radio.disabled = true;
                    radio.checked = isSelected;

                    const label = document.createElement('label');
                    label.innerText = answer.text;

                    div.appendChild(radio);
                    div.appendChild(label);
                    questionBlock.appendChild(div);
                });

                formElem.appendChild(questionBlock);
            });

        }
        else {
            const currentQuestion = quizData.questions[currentQuestionIndex];
            titleElem.innerHTML = currentQuestion.questionText;

            currentQuestion.answers.forEach((answer, index) => {
                const div = document.createElement('div');
                div.className = "answer-item";

                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = 'quiz-answer';
                radio.value = index;
                radio.id = `ans-${index}`;

                if (userSelect[currentQuestionIndex] === index) radio.checked = true;

                radio.addEventListener('change', () => {
                    userSelect[currentQuestionIndex] = index;
                });

                const label = document.createElement('label');
                label.htmlFor = `ans-${index}`;
                label.innerText = answer.text;

                div.appendChild(radio);
                div.appendChild(label);
                formElem.appendChild(div);
            });

            prevBtn.disabled = currentQuestionIndex === 0;

            if (currentQuestionIndex === quizData.questions.length - 1) {
                nextBtn.style.display = "none";
                submitBtn.style.display = "block";
            } else {
                nextBtn.style.display = "block";
                submitBtn.style.display = "none";
            }
        }
    }

    submitBtn.addEventListener('click', () => {
        const unansweredIndex = userSelect.findIndex(val => val === null);

        if (unansweredIndex !== -1) {
            alert(`Nemáte vyplněnou otázku číslo ${unansweredIndex + 1}!`);
            currentQuestionIndex = unansweredIndex;
            renderQuestion();
            return;
        }

        isQuizSubmitted = true;
        renderQuestion();
    });

    prevBtn.addEventListener('click', () => {
        currentQuestionIndex--;
        renderQuestion();
    });

    nextBtn.addEventListener('click', () => {
        currentQuestionIndex++;
        renderQuestion();
    });

    loadQuestions();
});