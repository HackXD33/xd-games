// متغيرات اللعبة
let score = 0;
let missedBubbles = 0;
let gameMode = null; // 'challenge'، 'survival' أو 'zen'
let gameActive = false;
let timeLeft = 60;
let timerInterval = null;
let bubbleInterval = null;
let speedMultiplier = 1;
let lastBubbleColor = null;
let comboCount = 0;
let difficultyLevel = 1;
let soundEnabled = true;
let highScore = localStorage.getItem('highScore') || 0;
let achievements = JSON.parse(localStorage.getItem('achievements')) || [];
let settings = JSON.parse(localStorage.getItem('settings')) || {
    difficulty: 'normal',
    bubbleSpeed: 1,
    bubbleSize: 1,
    colorMode: 'normal'
};

// قائمة الإنجازات
const achievementList = [
    { id: 'first_win', name: 'الفوز الأول', description: 'الفوز في أول لعبة', icon: '🏆', unlocked: false },
    { id: 'score_100', name: 'مئة نقطة', description: 'الحصول على 100 نقطة', icon: '💯', unlocked: false },
    { id: 'score_500', name: 'خمسمئة نقطة', description: 'الحصول على 500 نقطة', icon: '🎯', unlocked: false },
    { id: 'score_1000', name: 'ألف نقطة', description: 'الحصول على 1000 نقطة', icon: '🌟', unlocked: false },
    { id: 'combo_5', name: 'كومبو ×5', description: 'الحصول على كومبو ×5', icon: '🔥', unlocked: false },
    { id: 'combo_10', name: 'كومبو ×10', description: 'الحصول على كومبو ×10', icon: '💥', unlocked: false },
    { id: 'survival_master', name: 'سيد النجاة', description: 'البقاء على قيد الحياة في وضع النجاة لمدة 5 دقائق', icon: '🛡️', unlocked: false },
    { id: 'zen_master', name: 'سيد الزن', description: 'العب في وضع الزن لمدة 10 دقائق', icon: '🧘', unlocked: false },
    { id: 'speed_demon', name: 'شيطان السرعة', description: 'العب في وضع صعب جداً', icon: '⚡', unlocked: false }
];

// عناصر DOM
const scoreElement = document.getElementById('score');
const missedElement = document.getElementById('missed');
const timeLeftElement = document.getElementById('time-left');
const levelElement = document.getElementById('level');
const highScoreElement = document.getElementById('high-score');
const gameArea = document.getElementById('game-area');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const finalLevelElement = document.getElementById('final-level');
const timerElement = document.getElementById('timer');
const achievementsListElement = document.getElementById('achievements-list');
const newAchievementElement = document.getElementById('new-achievement');
const achievementTextElement = document.getElementById('achievement-text');

// أزرار وضع اللعب
const challengeModeBtn = document.getElementById('challenge-mode');
const survivalModeBtn = document.getElementById('survival-mode');
const zenModeBtn = document.getElementById('zen-mode');
const restartBtn = document.getElementById('restart-btn');
const menuBtn = document.getElementById('menu-btn');

// أزرار التحكم
const soundToggleBtn = document.getElementById('sound-toggle');
const settingsBtn = document.getElementById('settings-btn');

// عناصر الإعدادات
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.querySelector('.close');
const difficultySelect = document.getElementById('difficulty');
const bubbleSpeedSlider = document.getElementById('bubble-speed');
const bubbleSizeSlider = document.getElementById('bubble-size');
const colorModeSelect = document.getElementById('color-mode');
const speedValueElement = document.getElementById('speed-value');
const sizeValueElement = document.getElementById('size-value');
const saveSettingsBtn = document.getElementById('save-settings');

// تحميل الإعدادات المحفوظة
function loadSettings() {
    difficultySelect.value = settings.difficulty;
    bubbleSpeedSlider.value = settings.bubbleSpeed;
    bubbleSizeSlider.value = settings.bubbleSize;
    colorModeSelect.value = settings.colorMode;

    speedValueElement.textContent = `${settings.bubbleSpeed}x`;
    sizeValueElement.textContent = `${settings.bubbleSize}x`;

    // تطبيق نمط الألوان
    document.body.className = settings.colorMode === 'normal' ? '' : settings.colorMode;

    // تطبيق إعدادات الصعوبة
    applyDifficultySettings();
}

// تطبيق إعدادات الصعوبة
function applyDifficultySettings() {
    switch(settings.difficulty) {
        case 'easy':
            speedMultiplier = 0.7;
            break;
        case 'normal':
            speedMultiplier = 1;
            break;
        case 'hard':
            speedMultiplier = 1.5;
            break;
        case 'extreme':
            speedMultiplier = 2;
            break;
    }

    speedMultiplier *= settings.bubbleSpeed;
}

// حفظ الإعدادات
function saveSettings() {
    settings = {
        difficulty: difficultySelect.value,
        bubbleSpeed: parseFloat(bubbleSpeedSlider.value),
        bubbleSize: parseFloat(bubbleSizeSlider.value),
        colorMode: colorModeSelect.value
    };

    localStorage.setItem('settings', JSON.stringify(settings));
    loadSettings();
    settingsModal.style.display = 'none';
}

// تحديث عرض الإنجازات
function updateAchievementsDisplay() {
    achievementsListElement.innerHTML = '';

    achievementList.forEach(achievement => {
        const isUnlocked = achievements.includes(achievement.id);
        const achievementElement = document.createElement('div');
        achievementElement.className = `achievement ${isUnlocked ? '' : 'locked'}`;
        achievementElement.innerHTML = `
            <span>${achievement.icon}</span>
            <span>${achievement.name}</span>
        `;

        if (!isUnlocked) {
            achievementElement.title = achievement.description;
        }

        achievementsListElement.appendChild(achievementElement);
    });
}

// فتح إنجاز جديد
function unlockAchievement(achievementId) {
    if (!achievements.includes(achievementId)) {
        achievements.push(achievementId);
        localStorage.setItem('achievements', JSON.stringify(achievements));

        const achievement = achievementList.find(a => a.id === achievementId);
        if (achievement) {
            showAchievementPopup(achievement);
            updateAchievementsDisplay();
        }
    }
}

// عرض نافذة الإنجاز
function showAchievementPopup(achievement) {
    achievementTextElement.textContent = `${achievement.icon} ${achievement.name}: ${achievement.description}`;
    newAchievementElement.style.display = 'block';

    setTimeout(() => {
        newAchievementElement.style.display = 'none';
    }, 5000);
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
        case 'pop':
            oscillator.frequency.value = 800;
            gainNode.gain.value = 0.1;
            break;
        case 'bonus':
            oscillator.frequency.value = 1200;
            gainNode.gain.value = 0.2;
            break;
        case 'negative':
            oscillator.frequency.value = 300;
            gainNode.gain.value = 0.2;
            break;
        case 'gameOver':
            oscillator.frequency.value = 200;
            gainNode.gain.value = 0.3;
            break;
        case 'achievement':
            // تشغيل نغمة الإنجاز
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    const osc = audioContext.createOscillator();
                    const gain = audioContext.createGain();
                    osc.connect(gain);
                    gain.connect(audioContext.destination);
                    osc.frequency.value = 800 + i * 200;
                    gain.gain.value = 0.1;
                    osc.start();
                    osc.stop(audioContext.currentTime + 0.1);
                }, i * 100);
            }
            return;
    }

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
}

// تبديل الصوت
function toggleSound() {
    soundEnabled = !soundEnabled;
    soundToggleBtn.innerHTML = soundEnabled ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
    soundToggleBtn.className = soundEnabled ? 'control-btn sound-on' : 'control-btn sound-off';
}

// مستمعي الأحداث
challengeModeBtn.addEventListener('click', () => startGame('challenge'));
survivalModeBtn.addEventListener('click', () => startGame('survival'));
zenModeBtn.addEventListener('click', () => startGame('zen'));
restartBtn.addEventListener('click', resetGame);
menuBtn.addEventListener('click', () => {
    resetGame();
    startScreen.style.display = 'flex';
});
soundToggleBtn.addEventListener('click', toggleSound);
settingsBtn.addEventListener('click', () => {
    settingsModal.style.display = 'flex';
});
closeSettingsBtn.addEventListener('click', () => {
    settingsModal.style.display = 'none';
});
saveSettingsBtn.addEventListener('click', saveSettings);

bubbleSpeedSlider.addEventListener('input', () => {
    speedValueElement.textContent = `${bubbleSpeedSlider.value}x`;
});

bubbleSizeSlider.addEventListener('input', () => {
    sizeValueElement.textContent = `${bubbleSizeSlider.value}x`;
});

// بدء اللعبة
function startGame(mode) {
    gameMode = mode;
    gameActive = true;
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';

    // تطبيق إعدادات الصعوبة
    applyDifficultySettings();

    if (mode === 'challenge') {
        timerElement.style.display = 'block';
        startTimer();
    } else {
        timerElement.style.display = 'none';
    }

    // بدء إنشاء الفقاعات
    createBubble();
    bubbleInterval = setInterval(() => {
        if (gameActive) {
            createBubble();
            // زيادة الصعوبة تدريجياً
            if (score > 0 && score % 100 === 0) {
                difficultyLevel++;
                levelElement.textContent = difficultyLevel;
                speedMultiplier += 0.1;
            }
        }
    }, 1000 / speedMultiplier);
}

// إنشاء فقاعة جديدة
function createBubble() {
    if (!gameActive) return;

    const bubble = document.createElement('div');
    bubble.classList.add('bubble');

    // تحديد نوع الفقاعة ونقاطها
    const random = Math.random();
    let bubbleType, points, bubbleClass;

    // تعديل احتمالات الفقاعات حسب الصعوبة
    let normalChance = 0.6;
    let bonusChance = 0.2;
    let negativeChance = 0.2;

    if (settings.difficulty === 'easy') {
        normalChance = 0.7;
        bonusChance = 0.25;
        negativeChance = 0.05;
    } else if (settings.difficulty === 'hard') {
        normalChance = 0.5;
        bonusChance = 0.2;
        negativeChance = 0.3;
    } else if (settings.difficulty === 'extreme') {
        normalChance = 0.4;
        bonusChance = 0.15;
        negativeChance = 0.45;
    }

    if (random < normalChance) {
        // فقاعة عادية
        bubbleType = 'normal';
        points = 10;
        const isBlue = Math.random() < 0.5;
        bubbleClass = isBlue ? 'normal-blue' : 'normal-green';
    } else if (random < normalChance + bonusChance) {
        // فقاعة ذهبية
        bubbleType = 'bonus';
        points = 50;
        bubbleClass = 'bonus';
    } else {
        // فقاعة سلبية
        bubbleType = 'negative';
        points = -20;
        bubbleClass = 'negative';
    }

    bubble.classList.add(bubbleClass);
    bubble.dataset.points = points;
    bubble.dataset.type = bubbleType;

    // إضافة نص داخل الفقاعة
    if (bubbleType === 'bonus') {
        bubble.textContent = '+50';
    } else if (bubbleType === 'negative') {
        bubble.textContent = '-20';
    }

    // تحديد حجم الفقاعة مع تطبيق إعدادات الحجم
    const baseSize = 60 + Math.random() * 40; // بين 60 و 100 بكسل
    const size = baseSize * settings.bubbleSize;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;

    // تحديد الموقع الأفقي
    const maxX = gameArea.offsetWidth - size;
    const randomX = Math.random() * maxX;
    bubble.style.left = `${randomX}px`;
    bubble.style.bottom = '-100px'; // تبدأ من أسفل الشاشة

    // إضافة الفقاعة إلى منطقة اللعب
    gameArea.appendChild(bubble);

    // تحريك الفقاعة للأعلى
    const speed = (2 + Math.random() * 3) * speedMultiplier; // سرعة عشوائية مع مضاعف الصعوبة
    const horizontalMovement = (Math.random() - 0.5) * 2; // حركة أفقية عشوائية

    let position = -100;
    const moveInterval = setInterval(() => {
        if (!gameActive) {
            clearInterval(moveInterval);
            return;
        }

        position += speed;
        bubble.style.bottom = `${position}px`;

        // إضافة حركة أفقية
        const currentLeft = parseFloat(bubble.style.left);
        bubble.style.left = `${currentLeft + horizontalMovement}px`;

        // التحقق إذا وصلت الفقاعة إلى أعلى الشاشة
        if (position > gameArea.offsetHeight) {
            clearInterval(moveInterval);

            // إذا كانت فقاعة عادية ووصلت للأعلى، تزيد عداد الفقاعات الفائتة
            if (bubbleType === 'normal' && gameMode === 'survival') {
                missedBubbles++;
                missedElement.textContent = missedBubbles;

                if (missedBubbles >= 5) {
                    endGame();
                }
            }

            // إزالة الفقاعة من الشاشة
            bubble.remove();
        }
    }, 20);

    // إضافة حدث النقر على الفقاعة
    bubble.addEventListener('click', () => {
        if (!gameActive) return;

        clearInterval(moveInterval);

        // التحقق من نظام الكومبو
        if (bubbleType === 'normal') {
            if (lastBubbleColor === bubbleClass) {
                comboCount++;
                if (comboCount >= 2) {
                    // عرض مؤشر الكومبو
                    showComboIndicator(bubble);
                    // إضافة نقاط إضافية للكومبو
                    score += comboCount * 5;

                    // فتح إنجازات الكومبو
                    if (comboCount >= 5) {
                        unlockAchievement('combo_5');
                    }
                    if (comboCount >= 10) {
                        unlockAchievement('combo_10');
                    }
                }
            } else {
                comboCount = 0;
            }
            lastBubbleColor = bubbleClass;
        } else {
            comboCount = 0;
            lastBubbleColor = null;
        }

        // تحديث النقاط
        score += points;
        scoreElement.textContent = score;

        // تحديث أعلى نقاط
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('highScore', highScore);
        }

        // فتح إنجازات النقاط
        if (score >= 100) {
            unlockAchievement('score_100');
        }
        if (score >= 500) {
            unlockAchievement('score_500');
        }
        if (score >= 1000) {
            unlockAchievement('score_1000');
        }

        // عرض النقاط المكتسبة
        showScorePopup(bubble, points);

        // إضافة تأثير الفقاعة المنفجرة
        bubble.classList.add('popped');

        // تشغيل الصوت المناسب
        if (bubbleType === 'bonus') {
            playSound('bonus');
        } else if (bubbleType === 'negative') {
            playSound('negative');
        } else {
            playSound('pop');
        }

        // إذا كانت فقاعة سلبية، انتهت اللعبة
        if (bubbleType === 'negative') {
            setTimeout(() => {
                endGame();
            }, 300);
        }

        // إزالة الفقاعة بعد التأثير
        setTimeout(() => {
            bubble.remove();
        }, 300);
    });
}

// عرض مؤشر الكومبو
function showComboIndicator(bubble) {
    const indicator = document.createElement('div');
    indicator.classList.add('combo-indicator');
    indicator.textContent = `كومبو x${comboCount + 1}!`;

    const rect = bubble.getBoundingClientRect();
    const gameAreaRect = gameArea.getBoundingClientRect();

    indicator.style.left = `${rect.left - gameAreaRect.left + rect.width / 2}px`;
    indicator.style.top = `${rect.top - gameAreaRect.top}px`;

    gameArea.appendChild(indicator);

    setTimeout(() => {
        indicator.remove();
    }, 1000);
}

// عرض النقاط المكتسبة
function showScorePopup(bubble, points) {
    const popup = document.createElement('div');
    popup.classList.add('score-popup');
    popup.textContent = points > 0 ? `+${points}` : points;
    popup.style.color = points > 0 ? '#4CAF50' : '#F44336';

    const rect = bubble.getBoundingClientRect();
    const gameAreaRect = gameArea.getBoundingClientRect();

    popup.style.left = `${rect.left - gameAreaRect.left + rect.width / 2}px`;
    popup.style.top = `${rect.top - gameAreaRect.top}px`;

    gameArea.appendChild(popup);

    setTimeout(() => {
        popup.remove();
    }, 1000);
}

// بدء المؤقت (لوضع التحدي)
function startTimer() {
    timeLeft = 60;
    timeLeftElement.textContent = timeLeft;

    timerInterval = setInterval(() => {
        timeLeft--;
        timeLeftElement.textContent = timeLeft;

        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

// إنهاء اللعبة
function endGame() {
    gameActive = false;
    clearInterval(bubbleInterval);
    clearInterval(timerInterval);

    playSound('gameOver');

    finalScoreElement.textContent = score;
    finalLevelElement.textContent = difficultyLevel;
    gameOverScreen.style.display = 'flex';

    // فتح إنجازات الفوز
    if (score > 0) {
        unlockAchievement('first_win');
    }

    // التحقق من إنجازات خاصة بوضع اللعب
    if (gameMode === 'survival' && timeLeft >= 300) {
        unlockAchievement('survival_master');
    }

    if (gameMode === 'zen' && timeLeft >= 600) {
        unlockAchievement('zen_master');
    }

    if (settings.difficulty === 'extreme') {
        unlockAchievement('speed_demon');
    }

    // إزالة جميع الفقاعات المتبقية
    const bubbles = document.querySelectorAll('.bubble');
    bubbles.forEach(bubble => bubble.remove());
}

// إعادة تعيين اللعبة
function resetGame() {
    score = 0;
    missedBubbles = 0;
    timeLeft = 60;
    gameMode = null;
    gameActive = false;
    speedMultiplier = 1;
    lastBubbleColor = null;
    comboCount = 0;
    difficultyLevel = 1;

    scoreElement.textContent = score;
    missedElement.textContent = missedBubbles;
    timeLeftElement.textContent = timeLeft;
    levelElement.textContent = difficultyLevel;

    gameOverScreen.style.display = 'none';
    startScreen.style.display = 'flex';
}

// تهيئة اللعبة عند التحميل
document.addEventListener('DOMContentLoaded', () => {
    // تحميل الإعدادات
    loadSettings();

    // عرض أعلى نقاط
    highScoreElement.textContent = highScore;

    // عرض المستوى الأول
    levelElement.textContent = difficultyLevel;

    // تحديث عرض الإنجازات
    updateAchievementsDisplay();

    // تهيئة حالة الصوت
    soundToggleBtn.className = soundEnabled ? 'control-btn sound-on' : 'control-btn sound-off';

    // تهيئة نظام تسجيل الدخول بحساب جوجل
    initGoogleAuth();
});

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
