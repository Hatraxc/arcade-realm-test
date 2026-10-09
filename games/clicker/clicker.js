// ==========================================
// 🍉 ПЕРЕМЕННЫЕ ЭКОНОМИКИ И ПРОГРЕССА
// ==========================================
let score = 0;
let clickPower = 1;
let passiveCps = 0;
let critChance = 0; // Шанс крита в процентах (от 0% до 50%)

// Начальные цены улучшений
let costClick = 50;
let costCrit = 1500;
let costFarm1 = 400;
let costFarm2 = 2500;
let costFarm3 = 18000;

// Гардероб нарядов
let ownedHats = ['none'];
let currentHat = 'none';

// Карта картинок под каждый наряд капибары
const capySkins = { 
    none: 'capybara.png', 
    cowboy: 'capybara-cowboy.png', 
    crown: 'capybara-crown.png', 
    wizard: 'capybara-wizard.png' 
};

// ==========================================
// 🔍 DOM ЭЛЕМЕНТЫ (ПОИСК НА СТРАНИЦЕ)
// ==========================================
const scoreDisplay = document.getElementById('capyScore');
const cpsDisplay = document.getElementById('cpsValue');
const clickDisplay = document.getElementById('clickValue');
const critChanceDisplay = document.getElementById('critChanceValue');

const capyTarget = document.getElementById('capyTarget');
const capyZone = document.getElementById('capyZone');
const capyMouth = document.getElementById('capyMouth');
const capyImg = document.querySelector('.capy-img');

// КНОПКИ МАГАЗИНА (СТРОГО СИНХРОНИЗИРОВАНЫ С HTML)
const btnClick = document.getElementById('clickUpgradeBtn');
const btnCrit = document.getElementById('critUpgradeBtn');
const btnFarm1 = document.getElementById('farm1Btn');
const btnFarm2 = document.getElementById('farm2Btn');
const btnFarm3 = document.getElementById('farm3Btn');

// ==========================================
// 🚀 ИНИЦИАЛИЗАЦИЯ И СИСТЕМНЫЕ ТАЙМЕРЫ
// ==========================================
function init() {
    loadProgress(); // Загружаем сохранения
    updateUI();     // Обновляем текст на экране
    
    // Каждую секунду начисляем пассивный доход от авто-ферм
    setInterval(() => {
        if (passiveCps > 0) {
            score += passiveCps;
            updateUI();
            saveProgress();
        }
    }, 1000);
}

// ==========================================
// 🦫 ЛОГИКА НАЖАТИЯ НА КАПИБАРУ
// ==========================================
capyTarget.addEventListener('mousedown', (e) => {
    e.preventDefault(); // Защита от выделения картинки синим цветом при бешеном клике
    
    let currentGain = clickPower;
    let isCrit = false;

    // Проверяем, вылетит ли критический клик х5
    if (critChance > 0 && Math.random() * 100 < critChance) {
        currentGain = clickPower * 5;
        isCrit = true;
    }

    score += currentGain;
    updateUI();
    saveProgress();
    
    // Запускаем подлёт арбуза
    triggerWatermelonAnimation(isCrit);
});

// Анимация подлетающей дольки арбуза
function triggerWatermelonAnimation(isCrit) {
    const slice = document.createElement('img');
    slice.src = 'watermelon.png';
    slice.className = 'flying-slice-img';
    
    // Считываем точные координаты рта капибары внутри зоны
    const mouthX = capyMouth.offsetLeft + capyTarget.offsetLeft;
    const mouthY = capyMouth.offsetTop + capyTarget.offsetTop;
    
    // Передаем координаты в CSS-переменные
    slice.style.setProperty('--target-x', `${mouthX}px`);
    slice.style.setProperty('--target-y', `${mouthY}px`);
    
    capyZone.appendChild(slice);

    // Если вылетел крит — рисуем весёлый текст
    if (isCrit) {
        showCritText(mouthX, mouthY);
    }

    // Через 350мс арбуз долетает до рта — взрываем частицы
    setTimeout(() => {
        slice.remove();
        createParticles(mouthX, mouthY, isCrit);
    }, 350);
}

// Создание всплывающего текста КРИТ
function showCritText(x, y) {
    const critTxt = document.createElement('div');
    critTxt.innerText = 'КРИТ х5! 🔥';
    critTxt.className = 'click-hint';
    critTxt.style.position = 'absolute';
    critTxt.style.left = `${x - 40}px`;
    critTxt.style.top = `${y - 120}px`;
    critTxt.style.zIndex = '20000';
    critTxt.style.color = '#ffb800';
    critTxt.style.fontSize = '1.8rem';
    critTxt.style.animation = 'explodeDot 0.6s ease-out forwards';
    
    capyZone.appendChild(critTxt);
    setTimeout(() => critTxt.remove(), 600);
}

// Разлёт сочных брызг арбуза изо рта
function createParticles(x, y, isCrit) {
    const particleCount = isCrit ? 14 : 6; // Если крит — брызг в два раза больше!
    const particleColors = ['#ff4757', '#2ed573', '#2f3542', '#ff6b6b']; 
    
    for (let i = 0; i < particleCount; i++) {
        const part = document.createElement('div');
        part.className = 'watermelon-particle-dot';
        part.style.backgroundColor = particleColors[Math.floor(Math.random() * particleColors.length)];
        
        part.style.left = `${x + 15}px`;
        part.style.top = `${y + 15}px`;

        // Случайный угол и дальность разлёта частиц
        const moveX = (Math.random() - 0.5) * (isCrit ? 200 : 140);
        const moveY = (Math.random() - 0.6) * (isCrit ? 160 : 100);

        part.style.setProperty('--mx', `${moveX}px`);
        part.style.setProperty('--my', `${moveY}px`);

        capyZone.appendChild(part);
        setTimeout(() => part.remove(), 400);
    }
}

// ==========================================
// 🛒 ЛОГИКА ПОКУПКИ УЛУЧШЕНИЙ В МАГАЗИНЕ
// ==========================================

// 1. Сила клика (+75% к цене за уровень)
if (btnClick) {
    btnClick.addEventListener('click', () => {
        if (score >= costClick) {
            score -= costClick;
            clickPower += 1;
            costClick = Math.round(costClick * 1.75);
            updateUI();
            saveProgress();
        }
    });
}

// 2. Арбузный крит (+120% к цене за уровень, кап на 50% шанса)
if (btnCrit) {
    btnCrit.addEventListener('click', () => {
        if (score >= costCrit && critChance < 50) {
            score -= costCrit;
            critChance += 5; // +5% к шансу за покупку
            costCrit = Math.round(costCrit * 2.2);
            updateUI();
            saveProgress();
        }
    });
}

// 3. Авто-ферма 1: Трава (+40% к цене)
if (btnFarm1) {
    btnFarm1.addEventListener('click', () => {
        if (score >= costFarm1) {
            score -= costFarm1;
            passiveCps += 1;
            costFarm1 = Math.round(costFarm1 * 1.4);
            updateUI();
            saveProgress();
        }
    });
}

// 4. Авто-ферма 2: Грядка (+40% к цене)
if (btnFarm2) {
    btnFarm2.addEventListener('click', () => {
        if (score >= costFarm2) {
            score -= costFarm2;
            passiveCps += 8;
            costFarm2 = Math.round(costFarm2 * 1.4);
            updateUI();
            saveProgress();
        }
    });
}

// 5. Авто-ферма 3: Помощник (+40% к цене)
if (btnFarm3) {
    btnFarm3.addEventListener('click', () => {
        if (score >= costFarm3) {
            score -= costFarm3;
            passiveCps += 50;
            costFarm3 = Math.round(costFarm3 * 1.4);
            updateUI();
            saveProgress();
        }
    });
}

// 6. Покупка и надевание нарядов
window.buyHat = function(hatId, price) {
    if (ownedHats.includes(hatId)) {
        currentHat = hatId; // Если куплено — просто надеваем
    } else if (score >= price) {
        score -= price;
        ownedHats.push(hatId); // Добавляем в список купленных
        currentHat = hatId;
    } else {
        alert('Недостаточно арбузиков! 🍉');
        return;
    }
    updateUI();
    saveProgress();
}

// Переключение вкладок Прокачка / Наряды
window.openTab = function(evt, tabName) {
    const tabContents = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove("active");
    }
    const tabLinks = document.getElementsByClassName("tab-link");
    for (let i = 0; i < tabLinks.length; i++) {
        tabLinks[i].classList.remove("active");
    }
    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");
}

// ==========================================
// 🎨 ОБНОВЛЕНИЕ ТЕКСТА И ИНТЕРФЕЙСА (UI)
// ==========================================
function updateUI() {
    if (scoreDisplay) scoreDisplay.innerText = score;
    if (cpsDisplay) cpsDisplay.innerText = passiveCps;
    if (clickDisplay) clickDisplay.innerText = clickPower; // Обновляем силу клика на экране
    if (critChanceDisplay) critChanceDisplay.innerText = critChance;
    
    // Обновляем цены на кнопках
    if (btnClick) btnClick.innerText = `${costClick} 🍉`;
    if (btnFarm1) btnFarm1.innerText = `${costFarm1} 🍉`;
    if (btnFarm2) btnFarm2.innerText = `${costFarm2} 🍉`;
    if (btnFarm3) btnFarm3.innerText = `${costFarm3} 🍉`;

    // Если шанс крита максимальный — блокируем кнопку
    if (btnCrit) {
        if (critChance >= 50) {
            btnCrit.innerText = 'МАКСИМУМ';
            btnCrit.disabled = true;
            btnCrit.style.background = '#2ed573';
        } else {
            btnCrit.innerText = `${costCrit} 🍉`;
        }
    }

    // Меняем скин капибары
    if (capyImg) capyImg.src = capySkins[currentHat || 'none'];

    // Рендеринг кнопок в магазине одежды
    Object.keys(capySkins).forEach(id => {
        const btn = document.getElementById(`hat-${id}`);
        if (!btn) return;
        
        if (currentHat === id) {
            btn.innerText = 'Надето';
            btn.className = 'hat-btn owned';
        } else if (ownedHats.includes(id)) {
            btn.innerText = 'Надеть';
            btn.className = 'hat-btn';
            btn.style.background = '#4ecdc4';
        } else {
            btn.className = 'hat-btn';
            btn.style.background = '#ffb800';
        }
    });
}

// ==========================================
// 💾 СИСТЕМА СОХРАНЕНИЙ LOCALSTORAGE
// ==========================================
function saveProgress() {
    localStorage.setItem('capy_score', score);
    localStorage.setItem('capy_clickPower', clickPower);
    localStorage.setItem('capy_passiveCps', passiveCps);
    localStorage.setItem('capy_critChance', critChance);
    localStorage.setItem('capy_costClick', costClick);
    localStorage.setItem('capy_costCrit', costCrit);
    localStorage.setItem('capy_costFarm1', costFarm1);
    localStorage.setItem('capy_costFarm2', costFarm2);
    localStorage.setItem('capy_costFarm3', costFarm3);
    localStorage.setItem('capy_ownedHats', JSON.stringify(ownedHats));
    localStorage.setItem('capy_currentHat', currentHat);
}
function loadProgress() {
    if (localStorage.getItem('capy_score') !== null) score = parseInt(localStorage.getItem('capy_score'));
    if (localStorage.getItem('capy_clickPower') !== null) clickPower = parseInt(localStorage.getItem('capy_clickPower'));
    if (localStorage.getItem('capy_passiveCps') !== null) passiveCps = parseInt(localStorage.getItem('capy_passiveCps'));
    if (localStorage.getItem('capy_critChance') !== null) critChance = parseInt(localStorage.getItem('capy_critChance'));
    if (localStorage.getItem('capy_costClick') !== null) costClick = parseInt(localStorage.getItem('capy_costClick'));
    if (localStorage.getItem('capy_costCrit') !== null) costCrit = parseInt(localStorage.getItem('capy_costCrit'));
    if (localStorage.getItem('capy_costFarm1') !== null) costFarm1 = parseInt(localStorage.getItem('capy_costFarm1'));
    if (localStorage.getItem('capy_costFarm2') !== null) costFarm2 = parseInt(localStorage.getItem('capy_costFarm2'));
    if (localStorage.getItem('capy_costFarm3') !== null) costFarm3 = parseInt(localStorage.getItem('capy_costFarm3'));
    if (localStorage.getItem('capy_ownedHats') !== null) ownedHats = JSON.parse(localStorage.getItem('capy_ownedHats'));
    if (localStorage.getItem('capy_currentHat') !== null) currentHat = localStorage.getItem('capy_currentHat');
}
// Запуск игры!
init();