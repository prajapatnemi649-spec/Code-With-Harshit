````javascript
// ============================================================
// CODE WITH HARSHIT — COMPLETE APP.JS
// Stable Button + Login + AI + ID + Matrix + SFX System
// ============================================================

"use strict";

// ============================================================
// 1. GLOBAL STATE
// ============================================================

let customApiKey = localStorage.getItem("harshit_ai_key") || "";
let audioCtx = null;
let sfxEnabled = localStorage.getItem("cwh_sfx") !== "off";

let currentStudent = {
    name: localStorage.getItem("cwh_student_name") || "Student Coder",
    email: localStorage.getItem("cwh_student_email") || "student@gmail.com",
    avatar: localStorage.getItem("cwh_student_avatar") || ""
};


// ============================================================
// 2. SAFE DOM HELPER
// ============================================================

function $(id) {
    return document.getElementById(id);
}


// ============================================================
// 3. HTML ESCAPE
// ============================================================

function escapeHTML(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ============================================================
// 4. PLASMA CURSOR
// ============================================================

function initCursor() {

    const dot = $("cursor-dot");
    const ring = $("cursor-ring");

    if (!dot && !ring) return;

    document.addEventListener("mousemove", function (e) {

        if (dot) {
            dot.style.left = e.clientX + "px";
            dot.style.top = e.clientY + "px";
        }

        if (ring) {
            ring.style.left = e.clientX + "px";
            ring.style.top = e.clientY + "px";
        }
    });

    document.addEventListener("mouseleave", function () {

        if (dot) dot.style.opacity = "0";
        if (ring) ring.style.opacity = "0";

    });

    document.addEventListener("mouseenter", function () {

        if (dot) dot.style.opacity = "1";
        if (ring) ring.style.opacity = "1";

    });
}


// ============================================================
// 5. MATRIX MODE
// ============================================================

function toggleMatrixMode() {

    document.body.classList.toggle("matrix-mode");

    const enabled =
        document.body.classList.contains("matrix-mode");

    localStorage.setItem(
        "cwh_matrix_mode",
        enabled ? "on" : "off"
    );

    playSFX("beep");

    showCWHToast(
        enabled
            ? "MATRIX MODE: ONLINE"
            : "MATRIX MODE: OFF",
        "info"
    );
}


// Keyboard H
function initKeyboardShortcuts() {

    document.addEventListener("keydown", function (e) {

        // Don't trigger while typing
        const tag = document.activeElement
            ? document.activeElement.tagName
            : "";

        if (
            tag === "INPUT" ||
            tag === "TEXTAREA"
        ) {
            return;
        }

        if (e.key.toLowerCase() === "h") {
            toggleMatrixMode();
        }

        if (e.key === "Escape") {
            closeLoginModal();
            closeCyberIDModal();
            closeWorkspace();
        }
    });
}


// ============================================================
// 6. AUDIO / SFX
// ============================================================

function playSFX(type = "beep") {

    if (!sfxEnabled) return;

    try {

        if (!audioCtx) {

            const AudioContext =
                window.AudioContext ||
                window.webkitAudioContext;

            if (!AudioContext) return;

            audioCtx = new AudioContext();
        }

        if (audioCtx.state === "suspended") {
            audioCtx.resume();
        }

        const oscillator =
            audioCtx.createOscillator();

        const gain =
            audioCtx.createGain();

        oscillator.connect(gain);
        gain.connect(audioCtx.destination);

        const now =
            audioCtx.currentTime;

        if (type === "beep") {

            oscillator.type = "sine";

            oscillator.frequency.setValueAtTime(
                700,
                now
            );

            oscillator.frequency.exponentialRampToValueAtTime(
                1300,
                now + 0.08
            );

            gain.gain.setValueAtTime(
                0.12,
                now
            );

            gain.gain.exponentialRampToValueAtTime(
                0.001,
                now + 0.09
            );

            oscillator.start(now);
            oscillator.stop(now + 0.1);
        }

        else if (type === "warp") {

            oscillator.type = "sawtooth";

            oscillator.frequency.setValueAtTime(
                100,
                now
            );

            oscillator.frequency.exponentialRampToValueAtTime(
                1600,
                now + 0.7
            );

            gain.gain.setValueAtTime(
                0.16,
                now
            );

            gain.gain.exponentialRampToValueAtTime(
                0.001,
                now + 0.7
            );

            oscillator.start(now);
            oscillator.stop(now + 0.7);
        }

        else if (type === "success") {

            oscillator.type = "sine";

            oscillator.frequency.setValueAtTime(
                500,
                now
            );

            oscillator.frequency.setValueAtTime(
                800,
                now + 0.08
            );

            oscillator.frequency.setValueAtTime(
                1100,
                now + 0.16
            );

            gain.gain.setValueAtTime(
                0.12,
                now
            );

            gain.gain.exponentialRampToValueAtTime(
                0.001,
                now + 0.25
            );

            oscillator.start(now);
            oscillator.stop(now + 0.27);
        }

    } catch (error) {

        console.warn(
            "Audio unavailable:",
            error
        );
    }
}


// ============================================================
// 7. AUDIO TOGGLE
// ============================================================

function toggleAudio() {

    sfxEnabled = !sfxEnabled;

    localStorage.setItem(
        "cwh_sfx",
        sfxEnabled ? "on" : "off"
    );

    const status = $("sfx-status");

    if (status) {
        status.innerText =
            sfxEnabled
                ? "SFX ON"
                : "SFX MUTED";
    }

    const button = $("audio-toggle");

    if (button) {

        button.setAttribute(
            "aria-label",
            sfxEnabled
                ? "Mute sound"
                : "Enable sound"
        );
    }

    if (sfxEnabled) {

        playSFX("success");

        showCWHToast(
            "SFX ENABLED",
            "success"
        );

    } else {

        showCWHToast(
            "SFX MUTED",
            "info"
        );
    }
}


// ============================================================
// 8. API KEY CONFIGURATION
// ============================================================

function configureApiKey() {

    const existing =
        $("cwh-api-modal");

    if (existing) {
        existing.remove();
    }

    const modal =
        document.createElement("div");

    modal.id =
        "cwh-api-modal";

    modal.style.cssText = `
        position:fixed;
        inset:0;
        z-index:999999;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:20px;
        background:rgba(0,0,0,.82);
        backdrop-filter:blur(10px);
    `;

    modal.innerHTML = `

        <div style="
            width:min(480px,95vw);
            background:#030712;
            border:1px solid rgba(34,211,238,.5);
            border-radius:24px;
            padding:26px;
            box-shadow:0 0 50px rgba(6,182,212,.2);
            color:white;
            font-family:monospace;
        ">

            <div style="
                color:#22d3ee;
                font-size:12px;
                letter-spacing:3px;
                margin-bottom:10px;
            ">
                HARSHIT AI // CONFIG
            </div>

            <h2 style="
                margin:0 0 8px;
                font-size:22px;
            ">
                ⚙️ AI API Key
            </h2>

            <p style="
                color:#94a3b8;
                font-size:11px;
                line-height:1.6;
            ">
                Optional setting. Normally your backend should keep
                the AI API key inside server environment variables.
            </p>

            <input
                id="cwh-api-input"
                type="password"
                value="${escapeHTML(customApiKey)}"
                placeholder="Paste API key if your backend supports it..."
                style="
                    width:100%;
                    box-sizing:border-box;
                    margin-top:16px;
                    padding:13px;
                    border-radius:12px;
                    border:1px solid rgba(34,211,238,.3);
                    background:#020617;
                    color:white;
                    outline:none;
                    font-family:monospace;
                "
            >

            <div style="
                display:flex;
                gap:10px;
                margin-top:16px;
            ">

                <button
                    id="cwh-api-save"
                    style="
                        flex:1;
                        padding:12px;
                        border:0;
                        border-radius:12px;
                        background:linear-gradient(90deg,#22d3ee,#3b82f6);
                        color:#000;
                        font-weight:bold;
                        cursor:pointer;
                    "
                >
                    SAVE
                </button>

                <button
                    id="cwh-api-close"
                    style="
                        flex:1;
                        padding:12px;
                        border:1px solid #334155;
                        border-radius:12px;
                        background:transparent;
                        color:#cbd5e1;
                        cursor:pointer;
                    "
                >
                    CLOSE
                </button>

            </div>

            <p style="
                color:#64748b;
                font-size:9px;
                margin-top:14px;
            ">
                Security tip: production API keys should stay on the server.
            </p>

        </div>
    `;

    document.body.appendChild(modal);

    $("cwh-api-close").onclick =
        function () {
            modal.remove();
        };

    $("cwh-api-save").onclick =
        function () {

            const input =
                $("cwh-api-input");

            customApiKey =
                input
                    ? input.value.trim()
                    : "";

            if (customApiKey) {

                localStorage.setItem(
                    "harshit_ai_key",
                    customApiKey
                );

                showCWHToast(
                    "API key saved locally.",
                    "success"
                );

            } else {

                localStorage.removeItem(
                    "harshit_ai_key"
                );

                showCWHToast(
                    "API key removed.",
                    "info"
                );
            }

            modal.remove();
        };

    modal.addEventListener(
        "click",
        function (e) {

            if (e.target === modal) {
                modal.remove();
            }
        }
    );
}


// ============================================================
// 9. LOGIN MODAL
// ============================================================

function openLoginModal() {

    const modal =
        $("login-modal");

    if (!modal) {

        console.error(
            "login-modal not found in HTML"
        );

        return;
    }

    modal.classList.remove("hidden");

    document.body.classList.add(
        "overflow-hidden"
    );

    setTimeout(function () {

        const name =
            $("student-input-name");

        if (name) {
            name.focus();
        }

    }, 100);

    playSFX("beep");
}


function closeLoginModal() {

    const modal =
        $("login-modal");

    if (modal) {
        modal.classList.add("hidden");
    }

    document.body.classList.remove(
        "overflow-hidden"
    );
}


// ============================================================
// 10. STUDENT LOGIN
// ============================================================

function handleStudentLogin(event) {

    if (event) {
        event.preventDefault();
    }

    const nameField =
        $("student-input-name");

    const emailField =
        $("student-input-email");

    if (!nameField || !emailField) {

        showCWHToast(
            "Login form not found.",
            "error"
        );

        return false;
    }

    const name =
        nameField.value.trim();

    const email =
        emailField.value.trim();

    if (!name || !email) {

        showCWHToast(
            "Naam aur Gmail dono bharo.",
            "error"
        );

        return false;
    }

    currentStudent.name =
        name;

    currentStudent.email =
        email;

    currentStudent.avatar =
        "https://api.dicebear.com/7.x/bottts/svg?seed=" +
        encodeURIComponent(name);

    localStorage.setItem(
        "cwh_student_name",
        name
    );

    localStorage.setItem(
        "cwh_student_email",
        email
    );

    localStorage.setItem(
        "cwh_student_avatar",
        currentStudent.avatar
    );

    closeLoginModal();

    playSFX("warp");

    showWarpScreen();

    return false;
}


// ============================================================
// 11. WARP SCREEN
// ============================================================

function showWarpScreen() {

    const old =
        $("cwh-warp-screen");

    if (old) {
        old.remove();
    }

    const warp =
        document.createElement("div");

    warp.id =
        "cwh-warp-screen";

    warp.style.cssText = `
        position:fixed;
        inset:0;
        z-index:999999;
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        background:#22d3ee;
        color:#000;
        opacity:1;
        transition:opacity .7s ease;
    `;

    warp.innerHTML = `

        <div style="
            font-family:Orbitron, sans-serif;
            font-size:clamp(32px,8vw,80px);
            font-weight:900;
            letter-spacing:5px;
            text-align:center;
        ">
            WARP SPEED 💥
        </div>

        <div style="
            font-family:monospace;
            font-size:12px;
            font-weight:bold;
            margin-top:15px;
            letter-spacing:2px;
            text-align:center;
        ">
            AUTHENTICATED:
            ${escapeHTML(currentStudent.name.toUpperCase())}
        </div>
    `;

    document.body.appendChild(warp);

    setTimeout(function () {

        updateStudentUI();

        warp.style.opacity =
            "0";

        setTimeout(function () {

            warp.remove();

            openWorkspace();

        }, 700);

    }, 900);
}


// ============================================================
// 12. UPDATE STUDENT UI
// ============================================================

function updateStudentUI() {

    const displayName =
        $("user-display-name");

    const displayEmail =
        $("user-email-display");

    const avatar =
        $("user-avatar");

    if (displayName) {
        displayName.innerText =
            currentStudent.name;
    }

    if (displayEmail) {
        displayEmail.innerText =
            currentStudent.email;
    }

    if (avatar) {
        avatar.src =
            currentStudent.avatar;
    }
}


// ============================================================
// 13. OPEN WORKSPACE
// ============================================================

function openWorkspace() {

    const workspace =
        $("ai-workspace");

    if (!workspace) {

        showCWHToast(
            "AI Workspace HTML nahi mila.",
            "error"
        );

        return;
    }

    updateStudentUI();

    workspace.classList.remove(
        "hidden"
    );

    document.body.classList.add(
        "overflow-hidden"
    );

    initInputBoxStars();

    setTimeout(function () {

        const input =
            $("workspace-query");

        if (input) {
            input.focus();
        }

    }, 150);

    showCWHToast(
        "AI Workspace ONLINE 🚀",
        "success"
    );
}


// ============================================================
// 14. CLOSE WORKSPACE
// ============================================================

function closeWorkspace() {

    const workspace =
        $("ai-workspace");

    if (workspace) {

        workspace.classList.add(
            "hidden"
        );
    }

    document.body.classList.remove(
        "overflow-hidden"
    );

    playSFX("beep");
}


// ============================================================
// 15. FORMAT AI RESPONSE
// ============================================================

function formatAIResponse(rawText) {

    if (!rawText) {
        return "";
    }

    let text =
        String(rawText);

    const codeBlocks = [];

    // Extract fenced code blocks first
    text = text.replace(
        /```(?:[a-zA-Z0-9_+#.-]+)?\s*([\s\S]*?)```/g,
        function (match, code) {

            const index =
                codeBlocks.length;

            codeBlocks.push(`
                <pre style="
                    background:#020617;
                    border:1px solid rgba(34,211,238,.3);
                    border-radius:12px;
                    padding:14px;
                    margin:12px 0;
                    overflow-x:auto;
                    color:#67e8f9;
                    font-size:11px;
                    line-height:1.6;
                    white-space:pre;
                "><code>${escapeHTML(code.trim())}</code></pre>
            `);

            return `___CWH_CODE_${index}___`;
        }
    );

    text =
        escapeHTML(text);

    // Bold
    text =
        text.replace(
            /\*\*(.*?)\*\*/g,
            '<strong style="color:#22d3ee;font-weight:800;">$1</strong>'
        );

    // Inline code
    text =
        text.replace(
            /`([^`]+)`/g,
            '<code style="background:#083344;color:#67e8f9;padding:2px 6px;border-radius:5px;font-family:monospace;">$1</code>'
        );

    // Bullets
    text =
        text.replace(
            /^\s*[-*]\s+(.*)$/gm,
            '<div style="margin:5px 0 5px 12px;">• $1</div>'
        );

    // Numbered lists
    text =
        text.replace(
            /^\s*(\d+)\.\s+(.*)$/gm,
            '<div style="margin:5px 0 5px 12px;"><b style="color:#22d3ee;">$1.</b> $2</div>'
        );

    text =
        text.replace(
            /\n/g,
            "<br>"
        );

    // Restore code
    codeBlocks.forEach(
        function (block, index) {

            text =
                text.replace(
                    `___CWH_CODE_${index}___`,
                    block
                );
        }
    );

    return text;
}


// ============================================================
// 16. AI CHAT
// ============================================================

async function sendWorkspaceQuery() {

    const input =
        $("workspace-query");

    const stream =
        $("chat-stream");

    const status =
        $("hologram-status");

    if (!input) {

        console.error(
            "workspace-query not found"
        );

        return;
    }

    const prompt =
        input.value.trim();

    if (!prompt) {

        showCWHToast(
            "Pehle kuch likho bhai 😄",
            "info"
        );

        input.focus();

        return;
    }

    input.value = "";

    // User message
    if (stream) {

        const userMessage =
            document.createElement("div");

        userMessage.className =
            "flex justify-end my-2";

        userMessage.innerHTML = `
            <div class="
                bg-cyan-950/80
                border
                border-cyan-500/40
                px-4
                py-2.5
                rounded-2xl
                max-w-xl
                text-xs
                sm:text-sm
                text-cyan-200
            ">
                ${escapeHTML(prompt)}
            </div>
        `;

        stream.appendChild(
            userMessage
        );

        stream.scrollTop =
            stream.scrollHeight;
    }

    if (status) {

        status.innerText =
            "STATUS: GENERATING // NEURAL";
    }

    const loader =
        document.createElement("div");

    loader.className =
        "text-xs text-slate-500 italic p-2";

    loader.innerText =
        "⚡ Harshit AI generating response...";

    if (stream) {

        stream.appendChild(
            loader
        );

        stream.scrollTop =
            stream.scrollHeight;
    }

    try {

        const controller =
            new AbortController();

        const timeout =
            setTimeout(
                function () {
                    controller.abort();
                },
                30000
            );

        const headers = {
            "Content-Type":
                "application/json"
        };

        // Optional custom API key.
        // Backend must explicitly support this header.
        if (customApiKey) {

            headers[
                "x-api-key"
            ] = customApiKey;
        }

        const response =
            await fetch(
                "/api/chat",
                {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify({
                        message: prompt,
                        studentName:
                            currentStudent.name
                    }),
                    signal:
                        controller.signal
                }
            );

        clearTimeout(timeout);

        let data = {};

        try {

            data =
                await response.json();

        } catch (jsonError) {

            data = {};
        }

        if (!response.ok) {

            throw new Error(
                data.error ||
                `Server error (${response.status})`
            );
        }

        if (!data.reply) {

            throw new Error(
                "AI ne koi response nahi diya."
            );
        }

        const formatted =
            formatAIResponse(
                data.reply
            );

        incrementAIQueries();

        addAIMessage(
            formatted
        );

        playSFX("success");

    } catch (error) {

        console.error(
            "Harshit AI Error:",
            error
        );

        let message = "";

        if (
            error.name ===
            "AbortError"
        ) {

            message = `
                <span style="color:#f87171;">
                    ⚠️ AI request timeout.
                </span>
                <br><br>
                <span style="color:#94a3b8;font-size:11px;">
                    Server ya AI response mein delay ho raha hai.
                </span>
            `;

        } else if (
            error instanceof TypeError
        ) {

            message = `
                <span style="color:#f87171;">
                    ⚠️ Server connection failed.
                </span>
                <br><br>
                <span style="color:#94a3b8;font-size:11px;">
                    Check karo ki server.js run ho raha hai
                    aur /api/chat route available hai.
                </span>
            `;

        } else {

            message = `
                <span style="color:#f87171;">
                    ⚠️ AI connection error
                </span>
                <br><br>
                <span style="color:#94a3b8;font-size:11px;">
                    ${escapeHTML(error.message)}
                </span>
            `;
        }

        addAIMessage(
            message
        );
    }

    if (loader) {
        loader.remove();
    }

    if (status) {

        status.innerText =
            "STATUS: ONLINE // READY";
    }
}


// ============================================================
// 17. ADD AI MESSAGE
// ============================================================

function addAIMessage(html) {

    const stream =
        $("chat-stream");

    if (!stream) return;

    const aiDiv =
        document.createElement("div");

    aiDiv.className =
        "glass-cyber p-4 rounded-2xl border border-cyan-500/30 max-w-2xl text-xs sm:text-sm text-slate-200 leading-relaxed my-3";

    aiDiv.innerHTML = `
        🤖
        <b class="text-cyan-400">
            Harshit AI:
        </b>

        <div class="mt-2">
            ${html}
        </div>
    `;

    stream.appendChild(
        aiDiv
    );

    stream.scrollTop =
        stream.scrollHeight;
}


// ============================================================
// 18. INPUT ENTER KEY
// ============================================================

function initChatInput() {

    const input =
        $("workspace-query");

    if (!input) return;

    input.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendWorkspaceQuery();
            }
        }
    );
}


// ============================================================
// 19. FLOATING STARS
// ============================================================

function initInputBoxStars() {

    const canvas =
        $("input-star-canvas");

    if (!canvas) return;

    const ctx =
        canvas.getContext("2d");

    if (!ctx) return;

    const parent =
        canvas.parentElement;

    if (!parent) return;

    function resize() {

        canvas.width =
            parent.clientWidth;

        canvas.height =
            parent.clientHeight;
    }

    resize();

    window.addEventListener(
        "resize",
        resize
    );

    const stars =
        Array.from(
            { length: 40 },
            function () {

                return {
                    x:
                        Math.random() *
                        canvas.width,

                    y:
                        Math.random() *
                        canvas.height,

                    size:
                        Math.random() *
                        1.5 +
                        0.4,

                    vx:
                        (Math.random() -
                            0.5) *
                        0.35,

                    vy:
                        (Math.random() -
                            0.5) *
                        0.35,

                    alpha:
                        Math.random() *
                        0.6 +
                        0.25
                };
            }
        );

    function draw() {

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        stars.forEach(
            function (star) {

                star.x +=
                    star.vx;

                star.y +=
                    star.vy;

                if (
                    star.x < 0
                ) {
                    star.x =
                        canvas.width;
                }

                if (
                    star.x >
                    canvas.width
                ) {
                    star.x = 0;
                }

                if (
                    star.y < 0
                ) {
                    star.y =
                        canvas.height;
                }

                if (
                    star.y >
                    canvas.height
                ) {
                    star.y = 0;
                }

                ctx.fillStyle =
                    `rgba(56,189,248,${star.alpha})`;

                ctx.beginPath();

                ctx.arc(
                    star.x,
                    star.y,
                    star.size,
                    0,
                    Math.PI * 2
                );

                ctx.fill();
            }
        );

        requestAnimationFrame(
            draw
        );
    }

    draw();
}


// ============================================================
// 20. STABLE STUDENT ID
// ============================================================

function getStableStudentID() {

    let id =
        localStorage.getItem(
            "cwh_student_id"
        );

    if (!id) {

        id =
            "CWH-" +
            Math.floor(
                100000 +
                Math.random() *
                900000
            );

        localStorage.setItem(
            "cwh_student_id",
            id
        );
    }

    return id;
}


// ============================================================
// 21. GOLD STUDENT ID
// ============================================================

function getGoldStudentID() {

    let id =
        localStorage.getItem(
            "cwh_gold_id"
        );

    if (!id) {

        id =
            "GOLD-" +
            Math.floor(
                100000 +
                Math.random() *
                900000
            );

        localStorage.setItem(
            "cwh_gold_id",
            id
        );
    }

    return id;
}


// ============================================================
// 22. STUDENT STATS
// ============================================================

function getStudentStats() {

    return {

        queries:
            Number(
                localStorage.getItem(
                    "cwh_queries"
                ) || 0
            ),

        projects:
            Number(
                localStorage.getItem(
                    "cwh_projects"
                ) || 0
            ),

        streak:
            Number(
                localStorage.getItem(
                    "cwh_streak"
                ) || 1
            )
    };
}


function incrementAIQueries() {

    const stats =
        getStudentStats();

    localStorage.setItem(
        "cwh_queries",
        String(stats.queries + 1)
    );
}


// ============================================================
// 23. CYBER ID CARD
// ============================================================

function generateCyberIDCard() {

    const modal =
        $("id-card-modal");

    if (!modal) {

        showCWHToast(
            "Cyber ID modal HTML nahi mila.",
            "error"
        );

        return;
    }

    modal.classList.remove(
        "hidden"
    );

    const canvas =
        $("cyber-id-canvas");

    if (!canvas) return;

    const ctx =
        canvas.getContext("2d");

    if (!ctx) return;

    const width =
        canvas.width;

    const height =
        canvas.height;

    // Background
    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            width,
            height
        );

    gradient.addColorStop(
        0,
        "#030712"
    );

    gradient.addColorStop(
        0.5,
        "#07182c"
    );

    gradient.addColorStop(
        1,
        "#020617"
    );

    ctx.fillStyle =
        gradient;

    ctx.fillRect(
        0,
        0,
        width,
        height
    );

    // Border
    ctx.strokeStyle =
        "#06b6d4";

    ctx.lineWidth =
        4;

    ctx.strokeRect(
        10,
        10,
        width - 20,
        height - 20
    );

    ctx.textAlign =
        "center";

    // Title
    ctx.fillStyle =
        "#38bdf8";

    ctx.font =
        "bold 16px Orbitron, sans-serif";

    ctx.fillText(
        "CODE WITH HARSHIT",
        width / 2,
        45
    );

    ctx.fillStyle =
        "#94a3b8";

    ctx.font =
        "10px monospace";

    ctx.fillText(
        "STUDENT CYBER CODER PASS",
        width / 2,
        65
    );

    // Avatar box
    ctx.fillStyle =
        "#0f172a";

    ctx.fillRect(
        width / 2 - 45,
        85,
        90,
        90
    );

    ctx.strokeStyle =
        "#38bdf8";

    ctx.lineWidth =
        2;

    ctx.strokeRect(
        width / 2 - 45,
        85,
        90,
        90
    );

    ctx.fillStyle =
        "#38bdf8";

    ctx.font =
        "36px sans-serif";

    ctx.fillText(
        "👨‍💻",
        width / 2,
        143
    );

    // Name
    ctx.fillStyle =
        "#ffffff";

    ctx.font =
        "bold 16px Orbitron, sans-serif";

    ctx.fillText(
        currentStudent.name,
        width / 2,
        210
    );

    // Email
    ctx.fillStyle =
        "#38bdf8";

    ctx.font =
        "10px sans-serif";

    ctx.fillText(
        currentStudent.email,
        width / 2,
        230
    );

    // Status
    ctx.fillStyle =
        "#10b981";

    ctx.font =
        "bold 11px monospace";

    ctx.fillText(
        "STATUS: VERIFIED STUDENT [LVL 01]",
        width / 2,
        260
    );

    const stats =
        getStudentStats();

    ctx.fillStyle =
        "#94a3b8";

    ctx.font =
        "11px monospace";

    ctx.fillText(
        `AI QUERIES: ${stats.queries}`,
        width / 2,
        290
    );

    ctx.fillText(
        "TRACK: PYTHON • WEB • AI",
        width / 2,
        315
    );

    ctx.fillText(
        `PASS ID: ${getStableStudentID()}`,
        width / 2,
        340
    );

    // Barcode
    ctx.fillStyle =
        "#38bdf8";

    for (
        let x = 40;
        x < width - 40;
        x += 6
    ) {

        ctx.fillRect(
            x,
            370,
            Math.random() > 0.3
                ? 3
                : 1,
            32
        );
    }

    ctx.fillStyle =
        "#64748b";

    ctx.font =
        "9px monospace";

    ctx.fillText(
        "ISSUED BY CODE WITH HARSHIT ACADEMY",
        width / 2,
        430
    );

    playSFX("success");
}


// ============================================================
// 24. CLOSE CYBER ID
// ============================================================

function closeCyberIDModal() {

    const modal =
        $("id-card-modal");

    if (modal) {

        modal.classList.add(
            "hidden"
        );
    }
}


// ============================================================
// 25. DOWNLOAD CYBER ID
// ============================================================

function downloadCyberID() {

    const canvas =
        $("cyber-id-canvas");

    if (!canvas) {

        showCWHToast(
            "ID card canvas nahi mila.",
            "error"
        );

        return;
    }

    try {

        const link =
            document.createElement("a");

        const safeName =
            currentStudent.name
                .replace(
                    /[^a-zA-Z0-9_-]/g,
                    "_"
                );

        link.download =
            `${safeName}_CyberID.png`;

        link.href =
            canvas.toDataURL(
                "image/png"
            );

        document.body.appendChild(
            link
        );

        link.click();

        link.remove();

        showCWHToast(
            "Cyber ID ready!",
            "success"
        );

    } catch (error) {

        console.error(
            error
        );

        showCWHToast(
            "ID download failed.",
            "error"
        );
    }
}


// ============================================================
// 26. GOLD ID CARD
// ============================================================

function generateGoldIDCard() {

    const old =
        $("gold-id-modal");

    if (old) {
        old.remove();
    }

    const goldID =
        getGoldStudentID();

    const modal =
        document.createElement("div");

    modal.id =
        "gold-id-modal";

    modal.style.cssText = `
        position:fixed;
        inset:0;
        z-index:999998;
        display:flex;
        align-items:center;
        justify-content:center;
        background:rgba(0,0,0,.78);
        backdrop-filter:blur(8px);
        padding:20px;
    `;

    modal.innerHTML = `

        <div style="
            width:min(420px,95vw);
            padding:30px;
            border-radius:24px;
            background:linear-gradient(145deg,#17130a,#090909);
            border:1px solid #facc15;
            box-shadow:0 0 35px rgba(250,204,21,.25);
            text-align:center;
            color:white;
            font-family:monospace;
        ">

            <div style="
                font-size:12px;
                letter-spacing:4px;
                color:#facc15;
            ">
                CODE WITH HARSHIT
            </div>

            <div style="
                font-size:40px;
                margin:18px 0;
            ">
                🏆
            </div>

            <h2 style="
                margin:0;
                color:#fde68a;
                letter-spacing:2px;
            ">
                GOLD STUDENT ID
            </h2>

            <p style="color:#d4d4d4;">
                ${escapeHTML(currentStudent.name)}
            </p>

            <p style="color:#facc15;">
                ${escapeHTML(currentStudent.email)}
            </p>

            <div style="
                margin:22px 0;
                padding:14px;
                border:1px dashed #facc15;
                border-radius:12px;
                color:#fde68a;
            ">

                GOLD PASS ID

                <br>

                <strong>
                    ${goldID}
                </strong>

            </div>

            <p style="
                color:#a3a3a3;
                font-size:11px;
            ">
                TRACK: PYTHON • WEB • AI
            </p>

            <button
                id="gold-close-button"
                style="
                    margin-top:15px;
                    padding:10px 22px;
                    border:1px solid #facc15;
                    border-radius:10px;
                    background:transparent;
                    color:#facc15;
                    cursor:pointer;
                "
            >
                CLOSE
            </button>

        </div>
    `;

    document.body.appendChild(
        modal
    );

    const close =
        $("gold-close-button");

    if (close) {

        close.onclick =
            function () {
                modal.remove();
            };
    }

    modal.addEventListener(
        "click",
        function (e) {

            if (e.target === modal) {
                modal.remove();
            }
        }
    );

    playSFX("success");
}


// ============================================================
// 27. STUDENT COMMAND CENTER
// ============================================================

function showStudentStats() {

    const old =
        $("cwh-stats-modal");

    if (old) {
        old.remove();
    }

    const stats =
        getStudentStats();

    const modal =
        document.createElement("div");

    modal.id =
        "cwh-stats-modal";

    modal.style.cssText = `
        position:fixed;
        inset:0;
        z-index:999998;
        display:flex;
        align-items:center;
        justify-content:center;
        background:rgba(0,0,0,.78);
        backdrop-filter:blur(8px);
        padding:20px;
    `;

    modal.innerHTML = `

        <div style="
            width:min(500px,95vw);
            padding:28px;
            border-radius:22px;
            background:#030712;
            border:1px solid #22d3ee;
            box-shadow:0 0 40px rgba(34,211,238,.2);
            color:white;
            font-family:monospace;
        ">

            <h2 style="
                color:#22d3ee;
                text-align:center;
                margin:0;
            ">
                ⚡ STUDENT COMMAND CENTER
            </h2>

            <div style="
                display:grid;
                grid-template-columns:repeat(3,1fr);
                gap:12px;
                margin-top:25px;
            ">

                <div style="
                    padding:18px 8px;
                    text-align:center;
                    border:1px solid #164e63;
                    border-radius:14px;
                ">
                    <div style="font-size:25px;">🧠</div>
                    <strong>${stats.queries}</strong>
                    <small style="
                        display:block;
                        color:#94a3b8;
                        margin-top:5px;
                    ">
                        AI QUERIES
                    </small>
                </div>

                <div style="
                    padding:18px 8px;
                    text-align:center;
                    border:1px solid #164e63;
                    border-radius:14px;
                ">
                    <div style="font-size:25px;">🚀</div>
                    <strong>${stats.projects}</strong>
                    <small style="
                        display:block;
                        color:#94a3b8;
                        margin-top:5px;
                    ">
                        PROJECTS
                    </small>
                </div>

                <div style="
                    padding:18px 8px;
                    text-align:center;
                    border:1px solid #164e63;
                    border-radius:14px;
                ">
                    <div style="font-size:25px;">🔥</div>
                    <strong>${stats.streak}</strong>
                    <small style="
                        display:block;
                        color:#94a3b8;
                        margin-top:5px;
                    ">
                        STREAK
                    </small>
                </div>

            </div>

            <button
                id="cwh-stats-close"
                style="
                    display:block;
                    margin:25px auto 0;
                    padding:10px 25px;
                    border:1px solid #22d3ee;
                    border-radius:10px;
                    background:transparent;
                    color:#22d3ee;
                    cursor:pointer;
                "
            >
                CLOSE
            </button>

        </div>
    `;

    document.body.appendChild(
        modal
    );

    const close =
        $("cwh-stats-close");

    if (close) {

        close.onclick =
            function () {
                modal.remove();
            };
    }

    playSFX("beep");
}


// ============================================================
// 28. PROJECT STATS
// ============================================================

function addProjectStat() {

    const current =
        Number(
            localStorage.getItem(
                "cwh_projects"
            ) || 0
        );

    localStorage.setItem(
        "cwh_projects",
        String(current + 1)
    );

    showCWHToast(
        "Project added to your stats! 🚀",
        "success"
    );
}


// ============================================================
// 29. TOAST
// ============================================================

function showCWHToast(
    message,
    type = "info"
) {

    const old =
        $("cwh-toast");

    if (old) {
        old.remove();
    }

    const toast =
        document.createElement("div");

    toast.id =
        "cwh-toast";

    const icon =
        type === "success"
            ? "✓"
            : type === "error"
                ? "!"
                : "⚡";

    toast.innerHTML = `
        <div style="
            display:flex;
            align-items:center;
            gap:10px;
        ">
            <span style="
                font-size:20px;
                font-weight:bold;
            ">
                ${icon}
            </span>

            <span>
                ${escapeHTML(message)}
            </span>
        </div>
    `;

    toast.style.cssText = `
        position:fixed;
        right:20px;
        bottom:25px;
        z-index:9999999;
        padding:14px 20px;
        border:1px solid rgba(34,211,238,.6);
        border-radius:14px;
        background:rgba(3,7,18,.94);
        color:#67e8f9;
        font-family:monospace;
        font-size:13px;
        box-shadow:0 0 25px rgba(6,182,212,.25);
        backdrop-filter:blur(12px);
        transform:translateY(30px);
        opacity:0;
        transition:all .3s ease;
    `;

    document.body.appendChild(
        toast
    );

    requestAnimationFrame(
        function () {

            toast.style.transform =
                "translateY(0)";

            toast.style.opacity =
                "1";
        }
    );

    setTimeout(
        function () {

            toast.style.opacity =
                "0";

            toast.style.transform =
                "translateY(30px)";

            setTimeout(
                function () {

                    if (toast) {
                        toast.remove();
                    }

                },
                350
            );

        },
        2500
    );
}


// ============================================================
// 30. RESTORE SAVED SETTINGS
// ============================================================

function restoreSettings() {

    const matrix =
        localStorage.getItem(
            "cwh_matrix_mode"
        );

    if (matrix === "on") {

        document.body.classList.add(
            "matrix-mode"
        );
    }

    const status =
        $("sfx-status");

    if (status) {

        status.innerText =
            sfxEnabled
                ? "SFX ON"
                : "SFX MUTED";
    }

    updateStudentUI();
}


// ============================================================
// 31. GSAP SCROLL SYSTEM
// ============================================================

function initScrollSystem() {

    if (
        typeof gsap === "undefined" ||
        typeof ScrollTrigger === "undefined"
    ) {
        console.warn(
            "GSAP / ScrollTrigger unavailable."
        );

        return;
    }

    try {

        gsap.registerPlugin(
            ScrollTrigger
        );

        // Camera animation only if webgl-engine
        // created a global camera.
        if (
            typeof window.camera !==
            "undefined"
        ) {

            gsap.to(
                window.camera.position,
                {
                    z: -2500,
                    ease: "none",

                    scrollTrigger: {
                        trigger:
                            "#main-content",
                        start:
                            "top top",
                        end:
                            "bottom bottom",
                        scrub: 1.2
                    }
                }
            );
        }

    } catch (error) {

        console.warn(
            "GSAP initialization failed:",
            error
        );
    }
}


// ============================================================
// 32. BUTTON EVENT SYSTEM
// ============================================================

function initButtons() {

    // Audio button
    const audioButton =
        $("audio-toggle");

    if (audioButton) {

        audioButton.addEventListener(
            "click",
            toggleAudio
        );
    }

    // Close login by clicking outside
    const loginModal =
        $("login-modal");

    if (loginModal) {

        loginModal.addEventListener(
            "click",
            function (e) {

                if (
                    e.target ===
                    loginModal
                ) {
                    closeLoginModal();
                }
            }
        );
    }

    // Cyber ID outside click
    const idModal =
        $("id-card-modal");

    if (idModal) {

        idModal.addEventListener(
            "click",
            function (e) {

                if (
                    e.target ===
                    idModal
                ) {
                    closeCyberIDModal();
                }
            }
        );
    }
}


// ============================================================
// 33. EXPOSE EVERYTHING TO HTML
// ============================================================
// IMPORTANT:
// Your HTML uses onclick="functionName()"
// Therefore these MUST be on window.

window.toggleMatrixMode =
    toggleMatrixMode;

window.playSFX =
    playSFX;

window.toggleAudio =
    toggleAudio;

window.configureApiKey =
    configureApiKey;

window.openLoginModal =
    openLoginModal;

window.closeLoginModal =
    closeLoginModal;

window.handleStudentLogin =
    handleStudentLogin;

window.openWorkspace =
    openWorkspace;

window.closeWorkspace =
    closeWorkspace;

window.sendWorkspaceQuery =
    sendWorkspaceQuery;

window.generateCyberIDCard =
    generateCyberIDCard;

window.closeCyberIDModal =
    closeCyberIDModal;

window.downloadCyberID =
    downloadCyberID;

window.generateGoldIDCard =
    generateGoldIDCard;

window.showStudentStats =
    showStudentStats;

window.addProjectStat =
    addProjectStat;

window.showCWHToast =
    showCWHToast;

window.getStableStudentID =
    getStableStudentID;

window.getGoldStudentID =
    getGoldStudentID;

window.getStudentStats =
    getStudentStats;


// ============================================================
// 34. STARTUP
// ============================================================

function initApp() {

    console.log(
        "%c⚡ CODE WITH HARSHIT",
        "color:#22d3ee;font-size:20px;font-weight:bold;"
    );

    console.log(
        "%cCommand System ONLINE",
        "color:#10b981;font-weight:bold;"
    );

    console.log(
        "Student ID:",
        getStableStudentID()
    );

    console.log(
        "Gold ID:",
        getGoldStudentID()
    );

    initCursor();

    initKeyboardShortcuts();

    initButtons();

    initChatInput();

    restoreSettings();

    initInputBoxStars();

    initScrollSystem();

    console.log(
        "✅ All application systems initialized."
    );
}


// DOM ready
if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initApp
    );

} else {

    initApp();
}
````
