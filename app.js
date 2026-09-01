````javascript
// ==========================================
// CODE WITH HARSHIT — APP.JS
// Production + Localhost Safe Version
// ==========================================

"use strict";

// ==========================================
// 1. GLOBAL VARIABLES & CONFIG
// ==========================================

let customApiKey = localStorage.getItem("harshit_ai_key") || "";
let audioCtx = null;
let sfxEnabled = true;

// ==========================================
// 2. SAFE HTML ESCAPE
// ==========================================

function escapeHTML(text) {
    return String(text ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ==========================================
// 3. PLASMA CURSOR
// ==========================================

document.addEventListener("mousemove", (e) => {
    const dot = document.getElementById("cursor-dot");
    const ring = document.getElementById("cursor-ring");

    if (dot) {
        dot.style.left = `${e.clientX}px`;
        dot.style.top = `${e.clientY}px`;
    }

    if (ring) {
        ring.style.left = `${e.clientX}px`;
        ring.style.top = `${e.clientY}px`;
    }
});

// ==========================================
// 4. MATRIX MODE
// ==========================================

function toggleMatrixMode() {
    document.body.classList.toggle("matrix-mode");
}

window.addEventListener("keydown", (e) => {
    if (e.key === "h" || e.key === "H") {
        toggleMatrixMode();
    }
});

// ==========================================
// 5. AUDIO SYNTHESIZER
// ==========================================

function playSFX(type) {
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

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        const now = audioCtx.currentTime;

        if (type === "beep") {
            osc.type = "sine";

            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(
                1400,
                now + 0.08
            );

            gain.gain.setValueAtTime(0.15, now);
            gain.gain.linearRampToValueAtTime(
                0,
                now + 0.08
            );

            osc.start(now);
            osc.stop(now + 0.08);
        }

        if (type === "warp") {
            osc.type = "sawtooth";

            osc.frequency.setValueAtTime(120, now);
            osc.frequency.exponentialRampToValueAtTime(
                1600,
                now + 0.8
            );

            gain.gain.setValueAtTime(0.35, now);
            gain.gain.linearRampToValueAtTime(
                0,
                now + 0.8
            );

            osc.start(now);
            osc.stop(now + 0.8);
        }
    } catch (error) {
        console.warn("Audio unavailable:", error);
    }
}

// ==========================================
// 6. FLOATING STARS
// ==========================================

function initInputBoxStars() {
    const canvas =
        document.getElementById("input-star-canvas");

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    function resize() {
        if (!canvas.parentElement) return;

        canvas.width =
            canvas.parentElement.offsetWidth;

        canvas.height =
            canvas.parentElement.offsetHeight;
    }

    resize();

    window.addEventListener("resize", resize);

    const stars = Array.from(
        { length: 35 },
        () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.5 + 0.5,
            speedX: (Math.random() - 0.5) * 0.4,
            speedY: (Math.random() - 0.5) * 0.4,
            alpha: Math.random() * 0.7 + 0.3
        })
    );

    function draw() {
        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        stars.forEach((star) => {
            star.x += star.speedX;
            star.y += star.speedY;

            if (star.x < 0) {
                star.x = canvas.width;
            }

            if (star.x > canvas.width) {
                star.x = 0;
            }

            if (star.y < 0) {
                star.y = canvas.height;
            }

            if (star.y > canvas.height) {
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
        });

        requestAnimationFrame(draw);
    }

    draw();
}

// ==========================================
// 7. GSAP SCROLL CAMERA ZOOM
// ==========================================

function initGSAPScroll() {
    if (
        typeof gsap === "undefined" ||
        typeof ScrollTrigger === "undefined"
    ) {
        console.warn("GSAP / ScrollTrigger not found.");
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    if (typeof camera !== "undefined") {
        gsap.to(camera.position, {
            z: -2500,
            ease: "none",
            scrollTrigger: {
                trigger: "#main-content",
                start: "top top",
                end: "bottom bottom",
                scrub: 1.2
            }
        });
    }
}

// ==========================================
// 8. AI RESPONSE FORMATTER
// ==========================================

function formatAIResponse(rawText) {
    if (!rawText) return "";

    let text = String(rawText);

    const codeBlocks = [];

    // Code blocks
    text = text.replace(
        /```(?:[a-zA-Z0-9_+#.-]+)?\s*([\s\S]*?)```/g,
        (match, code) => {
            const index = codeBlocks.length;

            codeBlocks.push(`
<pre class="bg-black/90 p-3 rounded-xl border border-cyan-500/40 my-3 overflow-x-auto text-xs text-cyan-300 font-mono leading-relaxed"><code>${escapeHTML(code.trim())}</code></pre>
`);

            return `___CWH_CODE_BLOCK_${index}___`;
        }
    );

    // Escape normal HTML
    text = escapeHTML(text);

    // Bold
    text = text.replace(
        /\*\*(.*?)\*\*/g,
        '<strong class="text-cyan-400 font-bold">$1</strong>'
    );

    // Inline code
    text = text.replace(
        /`([^`]+)`/g,
        '<code class="bg-cyan-950/80 px-1.5 py-0.5 rounded text-cyan-300 text-xs font-mono">$1</code>'
    );

    // Bullet points
    text = text.replace(
        /^\s*[-*]\s+(.*)$/gm,
        '<div class="ml-4 my-1">• $1</div>'
    );

    // Line breaks
    text = text.replace(/\n/g, "<br>");

    // Restore code
    codeBlocks.forEach((block, index) => {
        text = text.replace(
            `___CWH_CODE_BLOCK_${index}___`,
            block
        );
    });

    return text;
}

// ==========================================
// 9. STUDENT PROFILE
// ==========================================

let currentStudent = {
    name:
        localStorage.getItem("cwh_student_name") ||
        "Student Coder",

    email:
        localStorage.getItem("cwh_student_email") ||
        "student@gmail.com",

    avatar: ""
};

// ==========================================
// 10. AI CHAT
// ==========================================

async function sendWorkspaceQuery() {
    const input =
        document.getElementById("workspace-query");

    if (!input) return;

    const promptText =
        input.value.trim();

    if (!promptText) return;

    input.value = "";

    const stream =
        document.getElementById("chat-stream");

    const holoStatus =
        document.getElementById("hologram-status");

    if (holoStatus) {
        holoStatus.innerText =
            "STATUS: GENERATING // NEURAL";
    }

    // User message
    if (stream) {
        const userDiv =
            document.createElement("div");

        userDiv.className =
            "flex justify-end my-2";

        userDiv.innerHTML = `
<div class="bg-cyan-950/80 border border-cyan-500/40 px-4 py-2.5 rounded-2xl max-w-xl text-xs sm:text-sm text-cyan-200">
${escapeHTML(promptText)}
</div>
`;

        stream.appendChild(userDiv);

        stream.scrollTop =
            stream.scrollHeight;
    }

    // Loading
    const loadDiv =
        document.createElement("div");

    loadDiv.className =
        "text-xs text-slate-500 italic p-2";

    loadDiv.innerText =
        "⚡ Harshit AI generating response...";

    if (stream) {
        stream.appendChild(loadDiv);

        stream.scrollTop =
            stream.scrollHeight;
    }

    let aiReply = "";

    try {
        const controller =
            new AbortController();

        const timeoutId =
            setTimeout(
                () => controller.abort(),
                30000
            );

        // IMPORTANT:
        // Relative API path works on Render
        // and local server.
        const response =
            await fetch("/api/chat", {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    message: promptText,
                    studentName:
                        currentStudent.name
                }),

                signal: controller.signal
            });

        clearTimeout(timeoutId);

        let data = {};

        try {
            data = await response.json();
        } catch {
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

        aiReply =
            formatAIResponse(data.reply);

        incrementAIQueries();

    } catch (error) {
        console.error(
            "Harshit AI Error:",
            error
        );

        if (error.name === "AbortError") {
            aiReply = `
<span class="text-red-400">
⚠️ AI request timed out.
</span>
<br><br>
<span class="text-slate-400 text-xs">
Server ya AI response mein delay ho raha hai.
</span>
`;
        } else {
            aiReply = `
<span class="text-red-400">
⚠️ AI connection error
</span>
<br><br>
<span class="text-slate-400 text-xs">
${escapeHTML(error.message)}
</span>
`;
        }
    }

    if (loadDiv) {
        loadDiv.remove();
    }

    if (holoStatus) {
        holoStatus.innerText =
            "STATUS: ONLINE // READY";
    }

    if (stream) {
        const aiDiv =
            document.createElement("div");

        aiDiv.className =
            "glass-cyber p-4 rounded-2xl border border-cyan-500/30 max-w-2xl text-xs sm:text-sm text-slate-200 leading-relaxed my-3";

        aiDiv.innerHTML = `
🤖 <b class="text-cyan-400">
Harshit AI:
</b>

<div class="mt-2">
${aiReply}
</div>
`;

        stream.appendChild(aiDiv);

        stream.scrollTop =
            stream.scrollHeight;
    }
}

// ==========================================
// 11. LOGIN MODAL
// ==========================================

function openLoginModal() {
    const modal =
        document.getElementById("login-modal");

    if (modal) {
        modal.classList.remove("hidden");
    }
}

function closeLoginModal() {
    const modal =
        document.getElementById("login-modal");

    if (modal) {
        modal.classList.add("hidden");
    }
}

function closeWorkspace() {
    const workspace =
        document.getElementById("ai-workspace");

    if (workspace) {
        workspace.classList.add("hidden");
    }
}

// ==========================================
// 12. STUDENT LOGIN
// ==========================================

function handleStudentLogin(e) {
    if (e) {
        e.preventDefault();
    }

    const nameField =
        document.getElementById(
            "student-input-name"
        );

    const emailField =
        document.getElementById(
            "student-input-email"
        );

    if (!nameField || !emailField) {
        return;
    }

    const nameInput =
        nameField.value.trim();

    const emailInput =
        emailField.value.trim();

    if (!nameInput || !emailInput) {
        return;
    }

    currentStudent.name =
        nameInput;

    currentStudent.email =
        emailInput;

    currentStudent.avatar =
        `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(nameInput)}`;

    localStorage.setItem(
        "cwh_student_name",
        currentStudent.name
    );

    localStorage.setItem(
        "cwh_student_email",
        currentStudent.email
    );

    closeLoginModal();

    playSFX("warp");

    const exp =
        document.createElement("div");

    exp.className =
        "fixed inset-0 z-50 bg-cyan-400 flex flex-col items-center justify-center transition-all duration-700 opacity-100";

    exp.innerHTML = `
<h1 class="font-orbitron text-4xl sm:text-7xl font-black text-black tracking-widest uppercase animate-ping">
WARP SPEED 💥
</h1>

<p class="text-black font-mono font-bold text-xs sm:text-sm mt-4 tracking-widest">
AUTHENTICATED:
${escapeHTML(
    currentStudent.name.toUpperCase()
)}
</p>
`;

    document.body.appendChild(exp);

    setTimeout(() => {
        exp.style.opacity = "0";

        setTimeout(() => {
            exp.remove();
        }, 700);

        const displayName =
            document.getElementById(
                "user-display-name"
            );

        const displayEmail =
            document.getElementById(
                "user-email-display"
            );

        const avatar =
            document.getElementById(
                "user-avatar"
            );

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

        const workspace =
            document.getElementById(
                "ai-workspace"
            );

        if (workspace) {
            workspace.classList.remove(
                "hidden"
            );
        }

        initInputBoxStars();

    }, 800);
}

// ==========================================
// 13. STABLE STUDENT ID
// ==========================================

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
                Math.random() * 900000
            );

        localStorage.setItem(
            "cwh_student_id",
            id
        );
    }

    return id;
}

// ==========================================
// 14. GOLD STUDENT ID
// ==========================================

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
                Math.random() * 900000
            );

        localStorage.setItem(
            "cwh_gold_id",
            id
        );
    }

    return id;
}

// ==========================================
// 15. STUDENT STATS
// ==========================================

function getStudentStats() {
    return {
        queries: Number(
            localStorage.getItem(
                "cwh_queries"
            ) || 0
        ),

        projects: Number(
            localStorage.getItem(
                "cwh_projects"
            ) || 0
        ),

        streak: Number(
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
        stats.queries + 1
    );
}

// ==========================================
// 16. CYBER ID CARD
// ==========================================

function generateCyberIDCard() {
    const modal =
        document.getElementById(
            "id-card-modal"
        );

    if (!modal) return;

    modal.classList.remove("hidden");

    const canvas =
        document.getElementById(
            "cyber-id-canvas"
        );

    if (!canvas) return;

    const ctx =
        canvas.getContext("2d");

    if (!ctx) return;

    const grad =
        ctx.createLinearGradient(
            0,
            0,
            canvas.width,
            canvas.height
        );

    grad.addColorStop(
        0,
        "#030712"
    );

    grad.addColorStop(
        0.5,
        "#07182c"
    );

    grad.addColorStop(
        1,
        "#020617"
    );

    ctx.fillStyle = grad;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.strokeStyle =
        "#06b6d4";

    ctx.lineWidth = 4;

    ctx.strokeRect(
        10,
        10,
        canvas.width - 20,
        canvas.height - 20
    );

    ctx.textAlign =
        "center";

    ctx.fillStyle =
        "#38bdf8";

    ctx.font =
        "bold 16px Orbitron, sans-serif";

    ctx.fillText(
        "CODE WITH HARSHIT",
        canvas.width / 2,
        45
    );

    ctx.fillStyle =
        "#94a3b8";

    ctx.font =
        "10px monospace";

    ctx.fillText(
        "STUDENT CYBER CODER PASS",
        canvas.width / 2,
        65
    );

    ctx.fillStyle =
        "#0f172a";

    ctx.fillRect(
        canvas.width / 2 - 45,
        85,
        90,
        90
    );

    ctx.strokeStyle =
        "#38bdf8";

    ctx.lineWidth = 2;

    ctx.strokeRect(
        canvas.width / 2 - 45,
        85,
        90,
        90
    );

    ctx.fillStyle =
        "#38bdf8";

    ctx.font =
        "36px monospace";

    ctx.fillText(
        "👨‍💻",
        canvas.width / 2,
        142
    );

    ctx.fillStyle =
        "#ffffff";

    ctx.font =
        "bold 16px Orbitron, sans-serif";

    ctx.fillText(
        currentStudent.name,
        canvas.width / 2,
        210
    );

    ctx.fillStyle =
        "#38bdf8";

    ctx.font =
        "10px sans-serif";

    ctx.fillText(
        currentStudent.email,
        canvas.width / 2,
        230
    );

    ctx.fillStyle =
        "#10b981";

    ctx.font =
        "bold 11px monospace";

    ctx.fillText(
        "STATUS: VERIFIED STUDENT [LVL 01]",
        canvas.width / 2,
        260
    );

    ctx.fillStyle =
        "#94a3b8";

    ctx.font =
        "11px monospace";

    ctx.fillText(
        "STREAK: 🔥 1 DAY ACTIVE",
        canvas.width / 2,
        290
    );

    ctx.fillText(
        "TRACK: PYTHON • WEB • AI",
        canvas.width / 2,
        315
    );

    ctx.fillText(
        `PASS ID: ${getStableStudentID()}`,
        canvas.width / 2,
        340
    );

    ctx.fillStyle =
        "#38bdf8";

    for (
        let i = 40;
        i < 300;
        i += 6
    ) {
        ctx.fillRect(
            i,
            370,
            Math.random() > 0.3 ? 3 : 1,
            32
        );
    }

    ctx.fillStyle =
        "#64748b";

    ctx.font =
        "9px monospace";

    ctx.fillText(
        "ISSUED BY CODE WITH HARSHIT ACADEMY",
        canvas.width / 2,
        430
    );
}

function closeCyberIDModal() {
    const modal =
        document.getElementById(
            "id-card-modal"
        );

    if (modal) {
        modal.classList.add("hidden");
    }
}

function downloadCyberID() {
    const canvas =
        document.getElementById(
            "cyber-id-canvas"
        );

    if (!canvas) return;

    const link =
        document.createElement("a");

    link.download =
        `${currentStudent.name.replace(
            /\s+/g,
            "_"
        )}_CyberID.png`;

    link.href =
        canvas.toDataURL("image/png");

    link.click();
}

// ==========================================
// 17. GOLD ID CARD
// ==========================================

function generateGoldIDCard() {
    const existing =
        document.getElementById(
            "gold-id-modal"
        );

    if (existing) {
        existing.remove();
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
z-index:99998;
display:flex;
align-items:center;
justify-content:center;
background:rgba(0,0,0,.75);
backdrop-filter:blur(8px);
`;

    modal.innerHTML = `
<div style="
width:min(420px,90vw);
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
font-size:32px;
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
${escapeHTML(goldID)}
</strong>

</div>

<p style="
color:#a3a3a3;
font-size:11px;
">
TRACK: PYTHON • WEB • AI
</p>

<button
type="button"
onclick="document.getElementById('gold-id-modal').remove()"
style="
margin-top:15px;
padding:10px 22px;
border:1px solid #facc15;
border-radius:10px;
background:transparent;
color:#facc15;
cursor:pointer;
">

CLOSE

</button>

</div>
`;

    document.body.appendChild(modal);

    playSFX("beep");
}

// ==========================================
// 18. STUDENT COMMAND CENTER
// ==========================================

function showStudentStats() {
    const stats =
        getStudentStats();

    const existing =
        document.getElementById(
            "cwh-stats-modal"
        );

    if (existing) {
        existing.remove();
    }

    const modal =
        document.createElement("div");

    modal.id =
        "cwh-stats-modal";

    modal.style.cssText = `
position:fixed;
inset:0;
z-index:99998;
display:flex;
align-items:center;
justify-content:center;
background:rgba(0,0,0,.75);
backdrop-filter:blur(8px);
`;

    modal.innerHTML = `
<div style="
width:min(500px,90vw);
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

<div style="font-size:25px;">
🧠
</div>

<strong>
${stats.queries}
</strong>

<small style="
display:block;
color:#94a3b8;
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

<div style="font-size:25px;">
🚀
</div>

<strong>
${stats.projects}
</strong>

<small style="
display:block;
color:#94a3b8;
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

<div style="font-size:25px;">
🔥
</div>

<strong>
${stats.streak}
</strong>

<small style="
display:block;
color:#94a3b8;
">
STREAK
</small>

</div>

</div>

<button
type="button"
onclick="document.getElementById('cwh-stats-modal').remove()"
style="
display:block;
margin:25px auto 0;
padding:10px 25px;
border:1px solid #22d3ee;
border-radius:10px;
background:transparent;
color:#22d3ee;
cursor:pointer;
">

CLOSE

</button>

</div>
`;

    document.body.appendChild(modal);
}

// ==========================================
// 19. PROJECT STATS
// ==========================================

function addProjectStat() {
    const current =
        Number(
            localStorage.getItem(
                "cwh_projects"
            ) || 0
        );

    localStorage.setItem(
        "cwh_projects",
        current + 1
    );

    showCWHToast(
        "Project added to your stats!",
        "success"
    );
}

// ==========================================
// 20. TOAST
// ==========================================

function showCWHToast(
    message,
    type = "info"
) {
    const oldToast =
        document.getElementById(
            "cwh-toast"
        );

    if (oldToast) {
        oldToast.remove();
    }

    const toast =
        document.createElement("div");

    toast.id =
        "cwh-toast";

    toast.innerHTML = `
<div style="
display:flex;
align-items:center;
gap:10px;
">

<span style="font-size:20px;">
${type === "success" ? "✓" : "⚡"}
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
z-index:99999;
padding:14px 20px;
border:1px solid rgba(34,211,238,.6);
border-radius:14px;
background:rgba(3,7,18,.92);
color:#67e8f9;
font-family:monospace;
font-size:13px;
box-shadow:0 0 25px rgba(6,182,212,.25);
backdrop-filter:blur(12px);
transform:translateY(30px);
opacity:0;
transition:all .3s ease;
`;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.transform =
            "translateY(0)";

        toast.style.opacity =
            "1";
    });

    setTimeout(() => {
        toast.style.opacity =
            "0";

        toast.style.transform =
            "translateY(30px)";

        setTimeout(() => {
            if (toast && toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }, 2500);
}

// ==========================================
// 21. GLOBAL WINDOW EXPORTS
// ==========================================

window.getStableStudentID =
    getStableStudentID;

window.getGoldStudentID =
    getGoldStudentID;

window.generateGoldIDCard =
    generateGoldIDCard;

window.showStudentStats =
    showStudentStats;

window.addProjectStat =
    addProjectStat;

window.showCWHToast =
    showCWHToast;

window.sendWorkspaceQuery =
    sendWorkspaceQuery;

window.handleStudentLogin =
    handleStudentLogin;

window.openLoginModal =
    openLoginModal;

window.closeLoginModal =
    closeLoginModal;

window.closeWorkspace =
    closeWorkspace;

window.generateCyberIDCard =
    generateCyberIDCard;

window.closeCyberIDModal =
    closeCyberIDModal;

window.downloadCyberID =
    downloadCyberID;

window.toggleMatrixMode =
    toggleMatrixMode;

window.playSFX =
    playSFX;

// ==========================================
// 22. DOM READY
// ==========================================

window.addEventListener(
    "DOMContentLoaded",
    () => {

        // Audio button
        const audioToggleBtn =
            document.getElementById(
                "audio-toggle"
            );

        if (audioToggleBtn) {
            audioToggleBtn.addEventListener(
                "click",
                () => {

                    sfxEnabled =
                        !sfxEnabled;

                    const status =
                        document.getElementById(
                            "sfx-status"
                        );

                    if (status) {
                        status.innerText =
                            sfxEnabled
                                ? "SFX ON"
                                : "SFX MUTED";
                    }

                    if (sfxEnabled) {
                        playSFX("beep");
                    }
                }
            );
        }

        // Initialize stars
        initInputBoxStars();

        // Initialize IDs
        getStableStudentID();
        getGoldStudentID();

        console.log(
            "⚡ Code With Harshit Command System ONLINE"
        );

        console.log(
            "Cyber ID:",
            getStableStudentID()
        );

        console.log(
            "Gold ID:",
            getGoldStudentID()
        );
    }
);

// ==========================================
// 23. WINDOW LOAD
// ==========================================

window.addEventListener(
    "load",
    () => {
        initGSAPScroll();
        initInputBoxStars();
    }
);
````
