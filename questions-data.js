<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Salesforce Admin 2026 実践ノック</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .option-btn.selected { border-color: #4f46e5; background-color: #eef2ff; }
        .option-btn.correct { border-color: #10b981; background-color: #ecfdf5; color: #065f46; box-shadow: 0 0 0 2px #10b981; }
        .option-btn.wrong { border-color: #ef4444; background-color: #fef2f2; color: #991b1b; }
        .transition-all { transition: all 0.2s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease forwards; }
    </style>
</head>
<body class="bg-slate-50 min-h-screen p-4 md:p-8 text-slate-900 font-sans">
    <div class="max-w-4xl mx-auto space-y-6">
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div class="flex justify-between items-start">
                <div>
                    <h1 class="text-2xl font-black text-indigo-600 tracking-tighter italic">SF Admin 2026 Knock</h1>
                    <div id="weak-categories" class="text-[11px] font-bold text-rose-500 mt-1 uppercase tracking-widest bg-rose-50 px-2 py-0.5 rounded inline-block">弱点: 分析中...</div>
                </div>
                <div id="stats-display" class="text-right font-bold text-slate-500">
                    <div class="text-[10px] uppercase opacity-60">Accuracy</div>
                    <div id="accuracy-rate" class="text-2xl text-indigo-600 leading-none">0%</div>
                    <div id="stat-details" class="text-[10px] mt-1 opacity-70 tracking-tighter text-slate-400 font-mono">OK:0 / TRY:0</div>
                </div>
            </div>
            
            <div class="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                <select id="category-filter" class="border p-2 rounded-lg bg-white text-xs font-bold focus:ring-2 focus:ring-indigo-200 outline-none cursor-pointer"></select>
                <button id="review-mode-btn" class="border px-4 py-2 rounded-lg text-xs bg-white hover:bg-rose-50 text-rose-600 font-black transition-colors shadow-sm">❌ 復習モード: OFF</button>
                <button id="random-btn" class="border px-4 py-2 rounded-lg text-xs bg-white hover:bg-slate-50 font-black shadow-sm">🔄 番号順</button>
                <input type="text" id="search-input" placeholder="検索..." class="border p-2 rounded-lg flex-1 text-xs focus:ring-2 focus:ring-indigo-200 outline-none">
                <button id="reset-stats" class="text-[10px] text-slate-300 hover:text-rose-500 underline transition-colors">リセット</button>
            </div>
        </div>

        <div class="bg-white p-6 md:p-12 rounded-[2.5rem] shadow-2xl border border-slate-200 relative overflow-hidden min-h-[500px]">
            <div class="flex justify-between items-center mb-4">
                <span id="progress-badge" class="bg-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-indigo-200"></span>
                <span id="category-badge" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category Name</span>
            </div>
            
            <div class="w-full bg-slate-100 h-2 rounded-full mb-10 overflow-hidden shadow-inner">
                <div id="progress-fill" class="bg-gradient-to-r from-indigo-500 to-blue-400 h-full transition-all duration-700 ease-out" style="width: 0%"></div>
            </div>
            
            <div class="space-y-8">
                <h2 id="question-text" class="text-xl md:text-2xl font-bold leading-tight text-slate-800 tracking-tight"></h2>
                <div id="options-container" class="grid gap-4"></div>
            </div>

            <div class="mt-12 flex flex-col gap-4">
                <button id="submit-btn" class="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-indigo-700 hover:shadow-indigo-200 transition-all disabled:opacity-20 disabled:cursor-not-allowed transform active:scale-[0.97]">回答を確定する</button>
                
                <div id="explanation-box" class="hidden animate-fadeIn p-8 rounded-3xl border-2 border-emerald-100 bg-emerald-50/50 backdrop-blur-sm">
                    <div class="flex items-center gap-3 mb-3">
                        <div class="bg-emerald-500 text-white p-1 rounded-full text-sm">✓</div>
                        <p class="font-black text-emerald-800 text-sm uppercase tracking-widest">2026 Admin Insight</p>
                    </div>
                    <p id="explanation-text" class="text-emerald-700 leading-relaxed font-medium text-sm md:text-base"></p>
                </div>
            </div>

            <div class="flex justify-between items-center mt-12 pt-8 border-t border-slate-100">
                <button id="prev-btn" class="text-slate-300 font-black hover:text-indigo-600 transition-colors px-6 py-2 disabled:opacity-0">← PREV</button>
                <button id="next-btn" class="bg-slate-900 text-white px-12 py-3 rounded-2xl font-black hover:bg-slate-800 transition-all transform active:scale-95 shadow-xl">NEXT</button>
            </div>
        </div>
        
        <p class="text-center text-slate-400 text-[10px] font-bold tracking-widest uppercase pb-10">Salesforce Certified Administrator 2026 Prep Tool</p>
    </div>

    <script src="questions-data.js"></script>
    <script src="app.js"></script>
</body>
</html>
