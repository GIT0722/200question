class SalesforceQuizApp {
    constructor() {
        // 初期状態
        this.questions = [...QUESTIONS_DATA];
        this.filteredQuestions = [...this.questions];
        this.currentIndex = 0;
        this.selectedOptions = new Set();
        
        // 統計データのロード
        this.stats = JSON.parse(localStorage.getItem('sf_admin_stats_2026')) || {
            solved: 0,
            correct: 0,
            wrongQuestions: [] // 間違えた問題のIDリスト
        };
        
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
        if (!q) {
            document.getElementById('question-text').innerText = "問題が見つかりません。条件を変えてください。";
            document.getElementById('options-container').innerHTML = '';
            return;
        }

        // 初期化
        this.selectedOptions.clear();
        document.getElementById('explanation-box').classList.add('hidden');
        document.getElementById('submit-btn').disabled = true;
        document.getElementById('submit-btn').innerText = "回答を確定する";
        
        // メタデータ
        const progress = ((this.currentIndex + 1) / this.filteredQuestions.length) * 100;
        document.getElementById('progress-fill').style.width = `${progress}%`;
        document.getElementById('progress-badge').innerText = `Question ${this.currentIndex + 1} / ${this.filteredQuestions.length}`;
        document.getElementById('category-badge').innerText = q.category;
        
        // テキスト表示
        let questionTitle = q.question;
        if(q.correctAnswer.length > 1) {
            questionTitle += ` <span class="text-indigo-500 text-sm font-black">[ ${q.correctAnswer.length}つ選択 ]</span>`;
        }
        document.getElementById('question-text').innerHTML = questionTitle;
        
        // 選択肢生成
        const container = document.getElementById('options-container');
        container.innerHTML = '';
        q.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn transition-all text-left p-5 rounded-2xl border-2 border-slate-100 hover:border-indigo-300 font-bold text-sm md:text-base flex gap-4 animate-fadeIn';
            btn.innerHTML = `<span class="bg-slate-50 text-slate-400 w-8 h-8 flex items-center justify-center rounded-lg text-xs font-black">${opt.id}</span> <span class="flex-1 pt-0.5">${opt.text}</span>`;
            btn.onclick = () => this.handleOptionClick(opt.id, btn);
            container.appendChild(btn);
        });

        // ナビゲーション制御
        document.getElementById('prev-btn').disabled = this.currentIndex === 0;
        document.getElementById('next-btn').innerText = (this.currentIndex === this.filteredQuestions.length - 1) ? "FINISH" : "NEXT →";
    }

    handleOptionClick(id, btn) {
        const q = this.filteredQuestions[this.currentIndex];
        
        // 単一選択の場合の挙動
        if (q.correctAnswer.length === 1) {
            this.selectedOptions.clear();
            document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
        }
        
        // トグル処理
        if (this.selectedOptions.has(id)) {
            this.selectedOptions.delete(id);
            btn.classList.remove('selected');
        } else {
            if (this.selectedOptions.size < q.correctAnswer.length) {
                this.selectedOptions.add(id);
                btn.classList.add('selected');
            }
        }

        // 確定ボタンの活性化
        document.getElementById('submit-btn').disabled = this.selectedOptions.size !== q.correctAnswer.length;
    }

    checkAnswer() {
        const q = this.filteredQuestions[this.currentIndex];
        const selectedArr = Array.from(this.selectedOptions).sort();
        const correctArr = [...q.correctAnswer].sort();
        const isCorrect = JSON.stringify(selectedArr) === JSON.stringify(correctArr);

        // フィードバック表示
        document.querySelectorAll('.option-btn').forEach(btn => {
            const optId = btn.querySelector('span').innerText;
            btn.onclick = null; // クリック無効化
            if (correctArr.includes(optId)) {
                btn.classList.add('correct');
            } else if (selectedArr.includes(optId)) {
                btn.classList.add('wrong');
            }
        });

        // 統計更新
        this.stats.solved++;
        if (isCorrect) {
            this.stats.correct++;
            // 正解したら「間違えたリスト」から削除
            this.stats.wrongQuestions = this.stats.wrongQuestions.filter(id => id !== q.id);
            document.getElementById('submit-btn').innerText = "正解です！";
        } else {
            // 間違えたらリストに追加（重複なし）
            if (!this.stats.wrongQuestions.includes(q.id)) {
                this.stats.wrongQuestions.push(q.id);
            }
            document.getElementById('submit-btn').innerText = "不正解です";
            document.getElementById('submit-btn').classList.replace('bg-indigo-600', 'bg-rose-500');
            setTimeout(() => document.getElementById('submit-btn').classList.replace('bg-rose-500', 'bg-indigo-600'), 1000);
        }
        
        this.saveStats();
        this.showExplanation(q.explanation);
    }

    showExplanation(text) {
        document.getElementById('explanation-text').innerText = text;
        document.getElementById('explanation-box').classList.remove('hidden');
        document.getElementById('submit-btn').disabled = true;
    }

    navigate(step) {
        const newIndex = this.currentIndex + step;
        if (newIndex >= 0 && newIndex < this.filteredQuestions.length) {
            this.currentIndex = newIndex;
            this.loadQuestion();
        } else if (newIndex >= this.filteredQuestions.length) {
            alert("お疲れ様でした！すべての問題を解き終えました。");
        }
    }

    // --- ユーティリティ機能 ---

    renderCategoryFilter() {
        const cats = ["ALL", ...new Set(this.questions.map(q => q.category))];
        const select = document.getElementById('category-filter');
        select.innerHTML = cats.map(c => `<option value="${c}">${c}</option>`).join('');
    }

    filterByCategory(cat) {
        this.isReviewMode = false; // フィルタ時は復習モード解除
        this.updateReviewButtonUI();
        this.filteredQuestions = cat === "ALL" ? [...this.questions] : this.questions.filter(q => q.category === cat);
        this.currentIndex = 0;
        this.loadQuestion();
    }

    toggleRandom(e) {
        this.isRandom = !this.isRandom;
        e.target.innerText = this.isRandom ? "🔄 シャッフル順" : "🔄 番号順";
        if (this.isRandom) {
            this.filteredQuestions.sort(() => Math.random() - 0.5);
        } else {
            this.filteredQuestions.sort((a, b) => a.id - b.id);
        }
        this.currentIndex = 0;
        this.loadQuestion();
    }

    toggleReviewMode(e) {
        this.isReviewMode = !this.isReviewMode;
        if (this.isReviewMode) {
            const wrongSet = this.questions.filter(q => this.stats.wrongQuestions.includes(q.id));
            if (wrongSet.length === 0) {
                alert("復習が必要な問題（間違えた問題）はありません！");
                this.isReviewMode = false;
                return;
            }
            this.filteredQuestions = wrongSet;
        } else {
            this.filteredQuestions = [...this.questions];
        }
        this.updateReviewButtonUI();
        this.currentIndex = 0;
        this.loadQuestion();
    }

    updateReviewButtonUI() {
        const btn = document.getElementById('review-mode-btn');
        if (this.isReviewMode) {
            btn.innerText = "🔥 復習モード: ON";
            btn.classList.add('bg-rose-600', 'text-white');
            btn.classList.remove('bg-white', 'text-rose-600');
        } else {
            btn.innerText = "❌ 復習モード: OFF";
            btn.classList.remove('bg-rose-600', 'text-white');
            btn.classList.add('bg-white', 'text-rose-600');
        }
    }

    searchQuestions(term) {
        this.filteredQuestions = this.questions.filter(q => 
            q.question.includes(term) || q.explanation.includes(term)
        );
        this.currentIndex = 0;
        this.loadQuestion();
    }

    updateStatsDisplay() {
        const rate = this.stats.solved === 0 ? 0 : Math.round((this.stats.correct / this.stats.solved) * 100);
        document.getElementById('accuracy-rate').innerText = `${rate}%`;
        document.getElementById('stat-details').innerText = `OK:${this.stats.correct} / TRY:${this.stats.solved}`;
        
        // 弱点分析
        const wrongCats = this.questions
            .filter(q => this.stats.wrongQuestions.includes(q.id))
            .map(q => q.category);
        const counts = {};
        wrongCats.forEach(c => counts[c] = (counts[c] || 0) + 1);
        const sorted = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
        
        document.getElementById('weak-categories').innerText = sorted.length > 0 
            ? `強化分野: ${sorted[0]} / ${sorted[1] || ''}` 
            : `弱点: 分析中...`;
    }

    saveStats() {
        localStorage.setItem('sf_admin_stats_2026', JSON.stringify(this.stats));
        this.updateStatsDisplay();
    }

    resetStats() {
        if (confirm("統計データをすべてリセットしますか？")) {
            localStorage.removeItem('sf_admin_stats_2026');
            location.reload();
        }
    }
}

// アプリケーション起動
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SalesforceQuizApp();
});
