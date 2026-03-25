<!-- 3. Center Canvas: Strategy Workflow -->
      <section id="canvas-container" class="absolute inset-0 z-10 bg-[#F8F7FB] dark:bg-dark-bg overflow-y-auto overflow-x-hidden cursor-default transition-colors duration-300">
        <div id="canvas-content" class="canvas-safe-area relative left-0 top-0 w-full min-h-full flex flex-col items-center p-8 transition-opacity duration-300" style="padding-left: calc(2rem + var(--canvas-left-safe-area)); padding-right: calc(2rem + var(--canvas-right-safe-area));">
        
        <!-- ================= EMPTY STATE CONTAINER ================= -->
        <div id="empty-state-view" class="hidden flex-col w-full max-w-4xl mx-auto opacity-0 transition-opacity duration-500 relative min-h-[calc(100vh-140px)] pb-40">
          
          <!-- Welcome Header -->
          <div id="discover-welcome-header" class="text-center pt-8 md:pt-[18vh] pb-10 transition-all duration-700 opacity-100">
            <div id="discover-mode-tag" class="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold tracking-wider uppercase bg-slate-900 text-white dark:bg-white dark:text-slate-900 mb-5 shadow-sm">
              <i data-lucide="compass" class="w-3.5 h-3.5 mr-1.5 flex-shrink-0"></i> Guided Discover
            </div>
            <h2 class="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 mb-5">Start with what you've noticed.</h2>
            <p class="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed transition-opacity duration-300">Upload charts, notes, code, videos, or rough ideas. AI will help shape them into a clearer trading edge.</p>
          </div>

          <div id="discover-boards-container" class="w-full mb-4 relative overflow-visible transition-all duration-500 opacity-0 pointer-events-none">
            <div class="fixed top-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-3xl rounded-2xl border border-slate-200/90 dark:border-dark-border bg-white/90 dark:bg-slate-900/70 backdrop-blur shadow-sm px-4 py-3 hover:shadow-md transition-shadow">
              <div class="flex items-center justify-between gap-3">
                <p id="discover-premise-title" class="text-sm sm:text-[15px] font-semibold text-slate-800 dark:text-slate-100 leading-snug flex items-center">
                  <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 mr-2 text-slate-500 dark:text-slate-300">
                    <i data-lucide="lightbulb" class="w-3 h-3"></i>
                  </span>
                  <span id="discover-premise-text-content">
                    No clear premise captured yet <span class="font-normal text-slate-500 dark:text-slate-400">— describe what you noticed</span>
                  </span>
                </p>
                <span id="discover-completion-pill" class="shrink-0 rounded-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">Needs input</span>
              </div>
              <div id="discover-ai-summary" class="hidden mt-3 mb-1 px-3 py-2 bg-purple-50/50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-800/30">
                <div class="flex items-start gap-2">
                   <i data-lucide="sparkles" class="w-3.5 h-3.5 text-purple-500 mt-0.5 shrink-0"></i>
                   <p class="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">waiting for enough context...</p>
                </div>
              </div>
              <div class="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-slate-600 dark:text-slate-300">
                <div id="discover-state-observation" class="inline-flex items-center gap-1.5 text-xs">
                  <span class="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>Observation
                </div>
                <div id="discover-state-context" class="inline-flex items-center gap-1.5 text-xs">
                  <span class="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>Context
                </div>
                <div id="discover-state-outcome" class="inline-flex items-center gap-1.5 text-xs">
                  <span class="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>Outcome
                </div>
                <div id="discover-state-logic" class="inline-flex items-center gap-1.5 text-xs">
                  <span class="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>Logic
                </div>
                <div id="discover-state-failure" class="inline-flex items-center gap-1.5 text-xs">
                  <span class="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>Failure
                </div>
                <span id="discover-completion-pill-small" class="ml-auto rounded-full border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-800/50 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">0/5</span>
                <span id="discover-attachment-count-small" class="hidden">0</span>
              </div>
            </div>
          </div>

          <div id="discover-thread-wrap" class="hidden w-full relative mt-32">
            <div class="flex items-center gap-3 mb-6 justify-center">
              <div class="h-px bg-slate-200 dark:bg-dark-border flex-1"></div>
              <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Conversation started</span>
              <div class="h-px bg-slate-200 dark:bg-dark-border flex-1"></div>
            </div>
            
            <div id="discover-thread" class="space-y-6"></div>
          </div>

          <!-- Composer area -->
          <div id="discover-input-container" class="fixed bottom-[35%] left-1/2 -translate-x-1/2 z-50 pointer-events-none w-full max-w-4xl transition-all duration-700">
            <div id="discover-input-bg" class="w-full px-4 transition-all duration-700">
              <div class="pointer-events-auto relative">
                
                <!-- Quick Guides / Hints (Floats right above input) -->
                <div id="discover-guidance-wrap" class="hidden absolute bottom-[100%] left-0 w-full mb-3 flex flex-wrap justify-center gap-2 items-center">
                  <div id="discover-guidance-actions" class="flex flex-wrap justify-center gap-2"></div>
                </div>

                <!-- Chat Box -->
                <div id="discover-chat-box" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-dark-border shadow-[0_8px_40px_rgba(0,0,0,0.08)] dark:shadow-none rounded-3xl overflow-hidden focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-400 transition-all relative">
                  
                  <textarea id="discover-input" rows="1" placeholder="Message to discover your edge..." class="w-full min-h-[56px] bg-transparent pl-5 pr-14 py-4 text-[15px] leading-relaxed text-slate-700 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-none max-h-[240px] overflow-y-auto block"></textarea>
                  
                  <!-- Absolute Send Button for minimal state -->
                  <div id="discover-minimal-send" class="absolute right-2 bottom-2 flex items-center gap-2">
                    <button id="discover-enter-structure-btn-minimal" onclick="enterStructureFromDiscover()" class="hidden items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md transition-colors">
                      Structure <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
                    </button>
                    <button onclick="handleStrategySubmit()" class="p-2 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 transition-opacity flex items-center justify-center w-8 h-8 shadow-sm">
                      <i data-lucide="arrow-up" class="w-4 h-4"></i>
                    </button>
                  </div>

                  <div id="discover-chat-toolbar" class="hidden flex-col">
                    <div class="h-px w-full bg-slate-100 dark:bg-slate-800/50 mb-2"></div>
                    <div class="flex justify-between items-center px-4 pb-3">
                      <div class="flex items-center gap-1">
                        <label for="discover-upload-input" class="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer" title="Upload Evidence (All)">
                          <i data-lucide="paperclip" class="w-5 h-5"></i>
                        </label>
                        <input id="discover-upload-input" type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.json" class="hidden" onchange="handleDiscoverAttachmentFiles(this.files)" />

                        <!-- Specialized Upload Buttons removed -->
                      </div>

                      <div class="flex items-center gap-2">
                        <button id="discover-enter-structure-btn" onclick="enterStructureFromDiscover()" class="hidden items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 transition-colors">
                          Structure <i data-lucide="arrow-right" class="w-4 h-4"></i>
                        </button>

                        <button onclick="handleStrategySubmit()" class="p-2 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition-opacity flex items-center justify-center w-10 h-10 shadow-md">
                          <i data-lucide="arrow-up" class="w-5 h-5"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div id="discover-empty-hint" class="mt-2 text-center text-[10.5px] text-slate-400 dark:text-slate-500 mb-1 transition-all duration-500 opacity-100 translate-y-0 max-h-10 overflow-hidden">
                  AI synthesis depends on clear empirical evidence. Make sure your observations have boundaries.
                </div>
              </div>
            </div>
          </div>

        </div>
        <!-- ================= END EMPTY STATE ================= -->


        <!-- ================= ACTIVE WORKFLOW CONTAINER ================= -->
        <div id="workflow-view" class="w-full flex-col items-center flex transition-opacity duration-300">
        
        <!-- Title -->
        <div class="text-center mb-8 mt-10">
          <h2 class="text-2xl font-semibold text-slate-800 dark:text-slate-100">Strategy Workflow</h2>
          <p class="text-sm text-purple-500 dark:text-purple-400 mt-1 flex items-center justify-center">
            <i data-lucide="sparkles" class="w-3 h-3 mr-1"></i>
            Auto-generated based on your input
          </p>
        </div>

        <!-- Nodes Container -->
        <div class="w-full max-w-4xl flex flex-col items-center space-y-4 relative">
          
          <!-- Node 1: Strategy Identity -->
          <div class="w-[500px] bg-white dark:bg-dark-card rounded-xl shadow-sm border border-emerald-200 dark:border-emerald-800 p-4 hover:shadow-lg transition-all cursor-pointer group">
            <div class="flex justify-between items-center mb-3">
              <div class="flex items-center font-medium text-slate-800 dark:text-slate-100">
                <i data-lucide="badge-check" class="w-4 h-4 text-emerald-500 mr-2"></i>
                Strategy Identity
              </div>
              <span class="text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded font-medium border border-emerald-100 dark:border-emerald-800">CONFIRMED</span>
            </div>
            <div class="flex flex-wrap gap-2 text-xs">
              <span class="bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-dark-border px-2 py-1.5 rounded text-slate-600 dark:text-slate-300 flex items-center group-hover:border-emerald-200 dark:group-hover:border-emerald-700 transition-colors">
                <i data-lucide="coins" class="w-3 h-3 mr-1"></i> Gold (XAU/USD)
              </span>
              <span class="bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-dark-border px-2 py-1.5 rounded text-slate-600 dark:text-slate-300 flex items-center group-hover:border-emerald-200 dark:group-hover:border-emerald-700 transition-colors">
                <i data-lucide="clock" class="w-3 h-3 mr-1"></i> 1H Timeframe
              </span>
              <span class="bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-dark-border px-2 py-1.5 rounded text-slate-600 dark:text-slate-300 flex items-center group-hover:border-emerald-200 dark:group-hover:border-emerald-700 transition-colors">
                <i data-lucide="trending-up" class="w-3 h-3 mr-1"></i> Breakout Strategy
              </span>
            </div>
          </div>

          <!-- Connection Line -->
          <div class="w-px h-8 bg-gradient-to-b from-emerald-300 dark:from-emerald-600 to-purple-300 dark:to-purple-600"></div>

          <!-- Node 2: Premise / Edge -->
          <div class="w-[500px] bg-white dark:bg-dark-card rounded-xl shadow-sm border-2 border-purple-200 dark:border-purple-700 p-4 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden">
            <div class="absolute top-0 right-0 w-20 h-20 bg-purple-50 dark:bg-purple-900/20 rounded-bl-full opacity-50"></div>
            <div class="relative">
              <div class="flex justify-between items-center mb-2">
                <div class="flex items-center font-medium text-purple-700 dark:text-purple-400">
                  <i data-lucide="lightbulb" class="w-4 h-4 mr-2"></i> Premise / Edge
                </div>
                <span class="text-xs text-orange-500 dark:text-orange-400 font-medium flex items-center">
                  <i data-lucide="sparkles" class="w-3 h-3 mr-1"></i> Drafted by AI
                </span>
              </div>
              <p class="text-sm text-slate-600 dark:text-slate-300 pl-6">Breakout from low volatility consolidation</p>
            </div>
          </div>

          <!-- Connection Lines to Bottom Nodes -->
          <div class="relative w-full max-w-3xl h-8 flex justify-center">
            <svg class="absolute w-full h-full" viewBox="0 0 800 32">
              <!-- Center line splitting into three -->
              <path d="M 400 0 L 400 16" stroke="#a855f7" stroke-width="2" fill="none"/>
              <path d="M 400 16 C 400 24, 267 24, 267 32" stroke="#a855f7" stroke-width="2" fill="none"/>
              <path d="M 400 16 L 400 32" stroke="#a855f7" stroke-width="2" fill="none"/>
              <path d="M 400 16 C 400 24, 533 24, 533 32" stroke="#a855f7" stroke-width="2" fill="none"/>
            </svg>
          </div>

          <!-- Bottom Three Columns Container -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl pt-2 relative items-start">
            
            <!-- Column 1: Market & Regime + Execution -->
            <div class="flex flex-col gap-6 w-full">
              <!-- Logic Node 1: Market & Regime -->
              <div class="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-slate-200 dark:border-dark-border p-4 hover:shadow-lg transition-all cursor-pointer group relative">
                <div class="absolute top-0 left-0 w-full h-1 bg-purple-400 rounded-t-xl"></div>
                <div class="flex justify-between items-start mb-4 mt-1">
                  <h4 class="font-semibold text-sm flex items-center text-slate-800 dark:text-slate-100">
                    <i data-lucide="bar-chart-2" class="w-4 h-4 text-purple-500 mr-2"></i>
                    Market & Regime
                  </h4>
                  <button class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors opacity-0 group-hover:opacity-100"><i data-lucide="more-horizontal" class="w-4 h-4"></i></button>
                </div>
                
                <ul class="space-y-4">
                  <li class="relative pl-5">
                    <div class="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-purple-500"></div>
                    <div class="flex justify-between items-center mb-1.5">
                      <span class="text-slate-700 dark:text-slate-200 text-sm font-medium">Volatility Filter</span>
                      <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-500"></i>
                    </div>
                    <div>
                      <span class="bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs px-2 py-1 rounded font-medium border border-rose-100 dark:border-rose-800">ATR(14) &lt; Threshold</span>
                    </div>
                  </li>
                  <li class="relative pl-5">
                    <div class="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-emerald-500"></div>
                    <div class="flex justify-between items-center mb-1.5">
                      <span class="text-slate-700 dark:text-slate-200 text-sm font-medium">Trend Filter</span>
                      <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-500"></i>
                    </div>
                    <div>
                      <span class="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs px-2 py-1 rounded font-medium border border-emerald-100 dark:border-emerald-800">Above SMA(200)</span>
                    </div>
                  </li>
                </ul>
              </div>

              <!-- Logic Node 4: Execution -->
              <div class="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-slate-200 dark:border-dark-border p-4 hover:shadow-lg transition-all cursor-pointer group relative">
                <div class="absolute top-0 left-0 w-full h-1 bg-orange-400 rounded-t-xl"></div>
                <div class="flex justify-between items-start mb-4 mt-1">
                  <h4 class="font-semibold text-sm flex items-center text-slate-800 dark:text-slate-100">
                    <i data-lucide="zap" class="w-4 h-4 text-orange-500 mr-2"></i>
                    Execution
                  </h4>
                  <button class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors opacity-0 group-hover:opacity-100"><i data-lucide="more-horizontal" class="w-4 h-4"></i></button>
                </div>
                
                <ul class="space-y-4">
                  <li class="relative pl-5">
                    <div class="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-purple-500"></div>
                    <div class="flex justify-between items-center mb-1.5">
                      <span class="text-slate-700 dark:text-slate-200 text-sm font-medium">Trading Session</span>
                      <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-500"></i>
                    </div>
                    <div>
                      <span class="bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs px-2 py-1 rounded font-medium border border-slate-200 dark:border-slate-600">London + NY</span>
                    </div>
                  </li>
                  <li class="relative pl-5">
                    <div class="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-emerald-500"></div>
                    <div class="flex justify-between items-center mb-1.5">
                      <span class="text-slate-700 dark:text-slate-200 text-sm font-medium">Max Spread</span>
                      <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-500"></i>
                    </div>
                    <div>
                      <span class="bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs px-2 py-1 rounded font-medium border border-slate-200 dark:border-slate-600">&lt; 2.0 pips</span>
                    </div>
                  </li>
                  <li class="relative pl-5">
                    <div class="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-orange-400"></div>
                    <div class="flex justify-between items-center mb-1.5">
                      <span class="text-slate-700 dark:text-slate-200 text-sm font-medium">News Filter</span>
                    </div>
                    <div>
                      <span class="bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs px-2 py-1 rounded font-medium border border-slate-200 dark:border-slate-600">High Impact Filter</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Column 2: Signal Logic + Data Dependencies -->
            <div class="flex flex-col gap-6 w-full">
              <!-- Logic Node 2: Signal Logic -->
              <div class="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-slate-200 dark:border-dark-border p-4 hover:shadow-lg transition-all cursor-pointer group relative">
                <div class="absolute top-0 left-0 w-full h-1 bg-blue-400 rounded-t-xl"></div>
                <div class="flex justify-between items-start mb-4 mt-1">
                  <h4 class="font-semibold text-sm flex items-center text-slate-800 dark:text-slate-100">
                    <i data-lucide="activity" class="w-4 h-4 text-blue-500 mr-2"></i>
                    Signal Logic
                  </h4>
                  <button class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors opacity-0 group-hover:opacity-100"><i data-lucide="x" class="w-4 h-4"></i></button>
                </div>
                
                <ul class="space-y-4">
                  <li class="relative pl-4 border-l-2 border-slate-100 dark:border-slate-700 ml-1 pb-2">
                    <div class="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-blue-500"></div>
                    <div class="flex justify-between items-center mb-1">
                      <span class="text-slate-700 dark:text-slate-200 text-sm font-semibold pl-2">Setup</span>
                    </div>
                    <div class="text-slate-600 dark:text-slate-400 text-xs pl-2 font-medium">Price in Consolidation</div>
                  </li>
                  <li class="relative pl-4 border-l-2 border-slate-100 dark:border-slate-700 ml-1 pb-2">
                    <div class="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-emerald-500"></div>
                    <div class="flex justify-between items-center mb-1.5">
                      <span class="text-slate-700 dark:text-slate-200 text-sm font-semibold pl-2">Entry Trigger</span>
                      <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-500"></i>
                    </div>
                    <div class="pl-2">
                      <span class="bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs px-2 py-1 rounded font-medium border border-orange-100 dark:border-orange-800">Breakout Above High</span>
                    </div>
                  </li>
                  <li class="relative pl-4 border-l-2 border-slate-100 dark:border-slate-700 ml-1 pb-2">
                    <div class="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-emerald-500"></div>
                    <div class="flex justify-between items-center mb-1.5">
                      <span class="text-slate-700 dark:text-slate-200 text-sm font-semibold pl-2">Confirmation</span>
                      <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-500"></i>
                    </div>
                    <div class="pl-2">
                      <span class="bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs px-2 py-1 rounded font-medium border border-slate-200 dark:border-slate-600">Volume &gt; SMA(20)</span>
                    </div>
                  </li>
                  <li class="relative pl-4 ml-1">
                    <div class="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-orange-400"></div>
                    <div class="flex justify-between items-center mb-1.5">
                      <span class="text-slate-700 dark:text-slate-200 text-sm font-semibold pl-2">Invalidation</span>
                      <i data-lucide="check-circle-2" class="w-4 h-4 text-orange-400"></i>
                    </div>
                    <div class="pl-2">
                      <span class="bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs px-2 py-1 rounded font-medium border border-orange-100 dark:border-orange-800">Breakdown Below Range</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Column 3: Risk & Money + Connect Data -->
            <div class="flex flex-col gap-6 w-full">
              <!-- Logic Node 3: Risk & Money -->
              <div class="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-slate-200 dark:border-dark-border p-4 hover:shadow-lg transition-all cursor-pointer group relative">
                <div class="absolute top-0 left-0 w-full h-1 bg-emerald-400 rounded-t-xl"></div>
                <div class="flex justify-between items-start mb-4 mt-1">
                  <h4 class="font-semibold text-sm flex items-center text-slate-800 dark:text-slate-100">
                    <i data-lucide="shield" class="w-4 h-4 text-emerald-500 mr-2"></i>
                    Risk & Money
                  </h4>
                  <button class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors opacity-0 group-hover:opacity-100"><i data-lucide="more-horizontal" class="w-4 h-4"></i></button>
                </div>
                
                <ul class="space-y-4">
                  <li class="relative pl-5">
                    <i data-lucide="triangle" class="w-3 h-3 absolute left-0 top-1 text-emerald-500 fill-emerald-500"></i>
                    <div class="flex justify-between items-center mb-1">
                      <span class="text-slate-700 dark:text-slate-200 text-sm font-medium">Position Size</span>
                      <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-500"></i>
                    </div>
                    <div class="text-slate-500 dark:text-slate-400 text-xs font-medium">1% Risk / Trade</div>
                  </li>
                  <li class="relative pl-5">
                    <div class="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-orange-400"></div>
                    <div class="flex justify-between items-center mb-1.5">
                      <span class="text-slate-700 dark:text-slate-200 text-sm font-medium">Stop Loss</span>
                      <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-500"></i>
                    </div>
                    <div>
                      <span class="bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs px-2 py-1 rounded font-medium border border-slate-200 dark:border-slate-600">1.5 * ATR</span>
                    </div>
                  </li>
                  <li class="relative pl-5">
                    <i data-lucide="circle-dashed" class="w-3 h-3 absolute left-0 top-1 text-orange-400"></i>
                    <div class="flex justify-between items-start mb-1.5">
                      <span class="text-slate-700 dark:text-slate-200 text-sm font-medium">Take Profit</span>
                      <div class="flex flex-col items-end leading-none">
                        <span class="text-[10px] text-red-500 font-semibold mb-0.5">Incomplete</span>
                        <span class="text-[10px] text-slate-400">needs attention</span>
                      </div>
                    </div>
                    <div>
                      <span class="bg-[#F8F7FB] dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs px-2 py-1 rounded font-medium border border-slate-200 dark:border-slate-700">Optional</span>
                    </div>
                  </li>
                </ul>
              </div>

              <!-- Connect Data (Optimized) -->
              <div class="bg-indigo-50/70 dark:bg-indigo-900/20 rounded-xl shadow-sm border border-indigo-200 dark:border-indigo-800 p-4 relative group cursor-pointer hover:shadow-md transition-all">
                <div class="absolute top-0 left-0 w-full h-1 bg-indigo-500 rounded-t-xl opacity-80"></div>
                <h4 class="font-semibold text-sm flex items-center mb-3 mt-1 text-indigo-700 dark:text-indigo-400">
                  <i data-lucide="plug" class="w-4 h-4 mr-2"></i> Data Connection
                  <span class="ml-auto text-[10px] bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-full font-medium">Auto-Sync</span>
                </h4>
                
                <div class="bg-white/80 dark:bg-slate-800/80 rounded-lg p-3 border border-indigo-100 dark:border-indigo-800/50 text-xs">
                  <div class="flex items-start mb-2">
                    <i data-lucide="info" class="w-3.5 h-3.5 text-indigo-500 mt-0.5 mr-2 shrink-0"></i>
                    <p class="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                      Timezone & Overlap Handling
                    </p>
                  </div>
                  <p class="text-slate-500 dark:text-slate-400 pl-5.5 leading-relaxed">
                    London + NY session data is automatically synchronized and stitched for backtesting.
                  </p>
                </div>
                
                <button class="w-full mt-3 flex items-center justify-center text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 rounded-md py-1.5 transition-colors group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30">
                  View Data Source <i data-lucide="arrow-right" class="w-3 h-3 ml-1"></i>
                </button>
              </div>
            </div>
            
          </div>

        </div>
        </div>
        <!-- ================= END ACTIVE WORKFLOW ================= -->
        
        </div>
      </section>
