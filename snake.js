// متغيرات لعبة الثعبان
let canvas, ctx;
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let level = 1;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameRunning = false;
let gamePaused = false;
let gameSpeed = 100;
let gridSize = 20;
let tileCount;
let soundEnabled = true;

// عناصر DOM
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const levelElement = document.getElementById('level');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const finalLevelElement = document.getElementById('final-level');
const pauseScreen = document.getElementById('pause-screen');
const snakeCanvas = document.getElementById('snake-canvas');

// أزرار التحكم
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const menuBtn = document.getElementById('menu-btn');
const pauseBtn = document.getElementById('pause-btn');
const resumeBtn = document.getElementById('resume-btn');
const quitBtn = document.getElementById('quit-btn');
const soundToggleBtn = document.getElementById('sound-toggle');

// مستمعي الأحداث
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', resetGame);
menuBtn.addEventListener('click', () => {
    resetGame();
    startScreen.style.display = 'flex';
});
pauseBtn.addEventListener('click', togglePause);
resumeBtn.addEventListener('click', togglePause);
quitBtn.addEventListener('click', () => {
    gameRunning = false;
    gamePaused = false;
    pauseScreen.style.display = 'none';
    gameOverScreen.style.display = 'flex';
    finalScoreElement.textContent = score;
    finalLevelElement.textContent = level;
});
soundToggleBtn.addEventListener('click', toggleSound);

// مستمعي أحداث لوحة المفاتيح
document.addEventListener('keydown', (e) => {
    if (!gameRunning || gamePaused) return;

    switch(e.key) {
        case 'ArrowUp':
            if (direction !== 'down') nextDirection = 'up';
            break;
        case 'ArrowDown':
            if (direction !== 'up') nextDirection = 'down';
            break;
        case 'ArrowLeft':
            if (direction !== 'right') nextDirection = 'left';
            break;
        case 'ArrowRight':
            if (direction !== 'left') nextDirection = 'right';
            break;
    }
});

// تهيئة اللعبة
function init() {
    canvas = document.getElementById('snake-canvas');
    ctx = canvas.getContext('2d');

    // حساب حجم الشبكة بناءً على حجم الشاشة
    const gameArea = document.getElementById('game-area');
    const maxWidth = Math.min(gameArea.offsetWidth - 40, 600);
    const maxHeight = Math.min(gameArea.offsetHeight - 40, 600);

    canvas.width = maxWidth;
    canvas.height = maxHeight;

    tileCount = Math.floor(Math.min(maxWidth, maxHeight) / gridSize);

    // تحديث أفضل نقاط
    highScoreElement.textContent = highScore;
}

// بدء اللعبة
function startGame() {
    init();

    // إخفاء شاشة البداية وإظهار لوحة اللعبة
    startScreen.style.display = 'none';
    snakeCanvas.style.display = 'block';

    // تهيئة الثعبان
    snake = [
        {x: Math.floor(tileCount / 2), y: Math.floor(tileCount / 2)}
    ];

    // وضع الطعام الأول
    generateFood();

    // تهيئة المتغيرات
    score = 0;
    level = 1;
    direction = 'right';
    nextDirection = 'right';
    gameSpeed = 100;

    // تحديث واجهة المستخدم
    scoreElement.textContent = score;
    levelElement.textContent = level;

    // بدء اللعبة
    gameRunning = true;
    gamePaused = false;
    gameLoop();
}

// حلقة اللعبة الرئيسية
function gameLoop() {
    if (!gameRunning) return;

    if (!gamePaused) {
        update();
        draw();
    }

    setTimeout(gameLoop, gameSpeed);
}

// تحديث حالة اللعبة
function update() {
    // تحديث الاتجاه
    direction = nextDirection;

    // حساب رأس الثعبان الجديد
    let head = {...snake[0]};

    switch(direction) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }

    // التحقق من الاصطدام بالجدران
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }

    // التحقق من الاصطدام بجسم الثعبان
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            gameOver();
            return;
        }
    }

    // إضافة الرأس الجديد
    snake.unshift(head);

    // التحقق من أكل الطعام
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;

        // تشغيل صوت الأكل
        playSound('eat');

        // التحقق من مستوى جديد
        if (score > 0 && score % 50 === 0) {
            level++;
            levelElement.textContent = level;
            gameSpeed = Math.max(50, gameSpeed - 10);
            playSound('levelUp');
        }

        // تحديث أفضل نقاط
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }

        // إنشاء طعام جديد
        generateFood();
    } else {
        // إزالة الذيل إذا لم يأكل الثعبان
        snake.pop();
    }
}

// رسم اللعبة
function draw() {
    // مسح لوحة الرسم
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // رسم الثعبان
    for (let i = 0; i < snake.length; i++) {
        const segment = snake[i];

        // تلوين الرأس بشكل مختلف
        if (i === 0) {
            ctx.fillStyle = '#2c3e50';
        } else {
            // تدرج لوني للجسم
            const gradient = ctx.createRadialGradient(
                segment.x * gridSize + gridSize/2, 
                segment.y * gridSize + gridSize/2, 
                0,
                segment.x * gridSize + gridSize/2, 
                segment.y * gridSize + gridSize/2, 
                gridSize/2
            );

            gradient.addColorStop(0, '#3498db');
            gradient.addColorStop(1, '#2980b9');

            ctx.fillStyle = gradient;
        }

        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    }

    // رسم الطعام
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize/2, 
        food.y * gridSize + gridSize/2, 
        gridSize/2 - 2, 
        0, 
        Math.PI * 2
    );
    ctx.fill();
}

// إنشاء طعام جديد
function generateFood() {
    do {
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    } while (isSnakePosition(food.x, food.y));
}

// التحقق إذا كان الموقع جزءاً من الثعبان
function isSnakePosition(x, y) {
    for (let segment of snake) {
        if (segment.x === x && segment.y === y) {
            return true;
        }
    }
    return false;
}

// إنهاء اللعبة
function gameOver() {
    gameRunning = false;
    playSound('gameOver');
    gameOverScreen.style.display = 'flex';
    finalScoreElement.textContent = score;
    finalLevelElement.textContent = level;
}

// إعادة تعيين اللعبة
function resetGame() {
    gameRunning = false;
    gamePaused = false;
    snakeCanvas.style.display = 'none';
    gameOverScreen.style.display = 'none';
    pauseScreen.style.display = 'none';
    startScreen.style.display = 'flex';
}

// تبديل حالة الإيقاف
function togglePause() {
    if (!gameRunning) return;

    gamePaused = !gamePaused;

    if (gamePaused) {
        pauseScreen.style.display = 'flex';
        pauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        pauseBtn.className = 'control-btn pause-off';
    } else {
        pauseScreen.style.display = 'none';
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        pauseBtn.className = 'control-btn pause-on';
    }
}

// تبديل الصوت
function toggleSound() {
    soundEnabled = !soundEnabled;
    soundToggleBtn.innerHTML = soundEnabled ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
    soundToggleBtn.className = soundEnabled ? 'control-btn sound-on' : 'control-btn sound-off';
}

// تشغيل الصوت
function playSound(type) {
    if (!soundEnabled) return;

    // إنشاء سياق صوتي بسيط
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch(type) {
        case 'eat':
            oscillator.frequency.value = 600;
            gainNode.gain.value = 0.1;
            break;
        case 'levelUp':
            oscillator.frequency.value = 800;
            gainNode.gain.value = 0.2;
            break;
        case 'gameOver':
            oscillator.frequency.value = 300;
            gainNode.gain.value = 0.2;
            break;
    }

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
}

// تهيئة اللعبة عند تحميل الصفحة
window.onload = () => {
    // تعيين أيقونة الصوت الأولية
    soundToggleBtn.className = soundEnabled ? 'control-btn sound-on' : 'control-btn sound-off';

    // تهيئة نظام تسجيل الدخول بحساب جوجل
    initGoogleAuth();
};

// تهيئة نظام تسجيل الدخول بحساب جوجل
function initGoogleAuth() {
    // التحقق مما إذا كان المستخدم مسجلاً بالفعل
    const savedUser = localStorage.getItem('googleUser');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        showUserInfo(user);
    }

    // إضافة مستمع الحدث لزر تسجيل الخروج
    const signOutBtn = document.getElementById('sign-out-btn');
    const customSignInBtn = document.getElementById('custom-signin-btn');

    if (signOutBtn) {
        signOutBtn.addEventListener('click', handleGoogleSignOut);
    }

    // إضافة مستمع الحدث للزر المخصص
    if (customSignInBtn) {
        customSignInBtn.addEventListener('click', () => {
            // استخدام طريقة Google Identity Services المباشرة
            if (window.google && window.google.accounts && window.google.accounts.id) {
                window.google.accounts.id.prompt();
            }
        });
    }
}

// دالة معالجة رد تسجيل الدخول من Google Identity Platform
function handleSignIn(response) {
    // فك تشفير رمز JWT
    const responsePayload = parseJwt(response.credential);

    const user = {
        name: responsePayload.name,
        photo: responsePayload.picture,
        email: responsePayload.email
    };

    // حفظ بيانات المستخدم
    localStorage.setItem('googleUser', JSON.stringify(user));

    // عرض معلومات المستخدم
    showUserInfo(user);
}

// دالة لفك تشفير رمز JWT
function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
    );
    return JSON.parse(jsonPayload);
}

// معالجة تسجيل الخروج
function handleGoogleSignOut() {
    // إزالة بيانات المستخدم من التخزين المحلي
    localStorage.removeItem('googleUser');

    // إخفاء معلومات المستخدم وعرض زر تسجيل الدخول
    const userInfo = document.getElementById('user-info');
    const signInBtn = document.getElementById('sign-in-btn');

    if (userInfo) {
        userInfo.style.display = 'none';
    }

    if (signInBtn) {
        signInBtn.style.display = 'block';
    }

    // يمكنك أيضاً إعادة تحميل الصفحة لمسح الجلسة بالكامل
    // window.location.reload();
}

// عرض معلومات المستخدم
function showUserInfo(user) {
    const userInfo = document.getElementById('user-info');
    const userPhoto = document.getElementById('user-photo');
    const userName = document.getElementById('user-name');
    const signInBtn = document.getElementById('sign-in-btn');

    if (userInfo && userPhoto && userName && signInBtn) {
        // تعيين صورة واسم المستخدم
        userPhoto.src = user.photo;
        userName.textContent = user.name;

        // عرض معلومات المستخدم وإخفاء زر تسجيل الدخول
        userInfo.style.display = 'flex';
        signInBtn.style.display = 'none';
    }
}