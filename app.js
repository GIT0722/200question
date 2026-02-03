class SalesforceQuizApp {
    constructor() {
        if (typeof QUESTIONS_DATA === 'undefined') {
            console.error("QUESTIONS_DATA is not defined. Make sure questions-data.js is loaded correctly.");
            return;
        }
        this.questions = [...QUESTIONS_DATA];
        this.filteredQuestions = [...this.questions];
        this.currentIndex = 0;
        this.selectedOptions = new Set();
        this.stats = JSON.parse(localStorage.getItem('sf_admin_stats_2026')) || { solved: 0, correct: 0, wrongQuestions: [] };
        this.isRandom = false;
        this.isReviewMode = false;
        this.init();
    }
    init() {
        this.renderCategoryFilter();
        this.setupEventListeners();
        this.updateStatsDisplay();
        this.loadQuestion();
    }
    setupEventListeners() {
        document.getElementById('submit-btn').addEventListener('click', () => this.checkAnswer());
        document.getElementById('next-btn').addEventListener('click', () => this.navigate(1));
        document.getElementById('prev-btn').addEventListener('click', () => this.navigate(-1));
        document.getElementById('random-btn').addEventListener('click', (e) => this.toggleRandom(e));
        document.getElementById('review-mode-btn').addEventListener('click', (e) => this.toggleReviewMode(e));
        document.getElementById('category-filter').addEventListener('change', (e) => this.filterByCategory(e.target.value));
        document.getElementById('reset-stats').addEventListener('click', () => this.resetStats());
        document.getElementById('search-input').addEventListener('input', (e) => this.searchQuestions(e.target.value));
    }
    loadQuestion() {
        const q = this.filteredQuestions[this.currentIndex];
        if (!q) return;
        this.selectedOptions.clear();
        document.getElementById('explanation-box').classList.add('hidden');
        document.getElementById('submit-btn').disabled = true;
        document.getElementById('submit-btn').innerText = "回答を確定する";
        const progress = ((this.currentIndex + 1) / this.filteredQuestions.length) * 100;
        document.getElementById('progress-fill').style.width = `${progress}%`;
        document.getElementById('progress-badge').innerText = `Q${this.currentIndex + 1} / ${this.filteredQuestions.length}`;
        document.getElementById('category-badge').innerText = q.category;
        document.getElementById('question-text').innerHTML = q.question + (q.correctAnswer.length > 1 ? ` <span class='text-indigo-500 text-sm'>[${q.correctAnswer.length}つ選択]</span>` : "");
        const container = document.getElementById('options-container');
        container.innerHTML = '';
        q.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn transition-all text-left p-5 rounded-2xl border-2 border-slate-100 flex gap-4 animate-fadeIn';
            btn.innerHTML = `<span class='bg-slate-50 w-8 h-8 flex items-center justify-center rounded-lg text-xs font-black'>${opt.id}</span> <span class='flex-1'>${opt.text}</span>`;
            btn.onclick = () => this.handleOptionClick(opt.id, btn);
            container.appendChild(btn);
        });
        document.getElementById('prev-btn').disabled = this.currentIndex === 0;
    }
    handleOptionClick(id, btn) {
        const q = this.filteredQuestions[this.currentIndex];
        if (q.correctAnswer.length === 1) {
            this.selectedOptions.clear();
            document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
        }
        if (this.selectedOptions.has(id)) {
            this.selectedOptions.delete(id);
            btn.classList.remove('selected');
        } else if (this.selectedOptions.size < q.correctAnswer.length) {
            this.selectedOptions.add(id);
            btn.classList.add('selected');
        }
        document.getElementById('submit-btn').disabled = this.selectedOptions.size !== q.correctAnswer.length;
    }
    checkAnswer() {
        const q = this.filteredQuestions[this.currentIndex];
        const selectedArr = Array.from(this.selectedOptions).sort();
        const correctArr = [...q.correctAnswer].sort();
        const isCorrect = JSON.stringify(selectedArr) === JSON.stringify(correctArr);
        document.querySelectorAll('.option-btn').forEach(btn => {
            const optId = btn.querySelector('span').innerText;
            btn.onclick = null;
            if (correctArr.includes(optId)) btn.classList.add('correct');
            else if (selectedArr.includes(optId)) btn.classList.add('wrong');
        });
        this.stats.solved++;
        if (isCorrect) {
            this.stats.correct++;
            this.stats.wrongQuestions = this.stats.wrongQuestions.filter(id => id !== q.id);
        } else if (!this.stats.wrongQuestions.includes(q.id)) {
            this.stats.wrongQuestions.push(q.id);
        }
        this.saveStats();
        document.getElementById('explanation-text').innerText = q.explanation;
        document.getElementById('explanation-box').classList.remove('hidden');
        document.getElementById('submit-btn').disabled = true;
    }
    navigate(step) {
        const newIndex = this.currentIndex + step;
        if (newIndex >= 0 && newIndex < this.filteredQuestions.length) {
            this.currentIndex = newIndex;
            this.loadQuestion();
        }
    }
    saveStats() {
        localStorage.setItem('sf_admin_stats_2026', JSON.stringify(this.stats));
        this.updateStatsDisplay();
    }
    updateStatsDisplay() {
        const rate = this.stats.solved === 0 ? 0 : Math.round((this.stats.correct / this.stats.solved) * 100);
        document.getElementById('accuracy-rate').innerText = `${rate}%`;
        document.getElementById('stat-details').innerText = `OK:${this.stats.correct} / TRY:${this.stats.solved}`;
        const counts = {};
        this.questions.filter(q => this.stats.wrongQuestions.includes(q.id)).forEach(q => counts[q.category] = (counts[q.category] || 0) + 1);
        const sorted = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
        document.getElementById('weak-categories').innerText = sorted.length > 0 ? `弱点: ${sorted[0]}` : "弱点: 分析中...";
    }
    renderCategoryFilter() {
        const cats = ["ALL", ...new Set(this.questions.map(q => q.category))];
        document.getElementById('category-filter').innerHTML = cats.map(c => `<option value="${c}">${c}</option>`).join('');
    }
    filterByCategory(cat) {
        this.filteredQuestions = cat === "ALL" ? [...this.questions] : this.questions.filter(q => q.category === cat);
        this.currentIndex = 0;
        this.loadQuestion();
    }
    toggleRandom(e) {
        this.isRandom = !this.isRandom;
        e.target.innerText = this.isRandom ? "🔄 シャッフル順" : "🔄 番号順";
        this.filteredQuestions.sort(() => this.isRandom ? Math.random() - 0.5 : 0);
        this.currentIndex = 0;
        this.loadQuestion();
    }
    toggleReviewMode(e) {
        this.isReviewMode = !this.isReviewMode;
        if (this.isReviewMode) {
            const wrongSet = this.questions.filter(q => this.stats.wrongQuestions.includes(q.id));
            if (wrongSet.length === 0) { alert("復習なし！"); this.isReviewMode = false; return; }
            this.filteredQuestions = wrongSet;
        } else this.filteredQuestions = [...this.questions];
        this.currentIndex = 0;
        this.loadQuestion();
    }
    searchQuestions(term) {
        this.filteredQuestions = this.questions.filter(q => q.question.includes(term));
        this.currentIndex = 0;
        this.loadQuestion();
    }
    resetStats() { localStorage.removeItem('sf_admin_stats_2026'); location.reload(); }
}
document.addEventListener('DOMContentLoaded', () => new SalesforceQuizApp());
