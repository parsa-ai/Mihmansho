function openWinTab() {
    const PRIZES = {
        1: { icon: '🏡', title: 'یک شب اقامت رایگان ویلا' },
        2: { icon: '💸', title: 'کد تخفیف ۵٪' },
        3: { icon: '🎟️', title: '۱۰٪ کد تخفیف' },
        4: { icon: '🛎️', title: 'اعتبار سفر' },
        5: { icon: '🍽️', title: 'شانس دوباره' },
    };

    const overlay = document.getElementById('winOverlay');
    const closeBtn = document.getElementById('winClose');
    const prizeValEl = document.getElementById('winPrizeValue');
    const prizeIcoEl = document.getElementById('winPrizeIcon');
    const codeEl = document.getElementById('winCode');
    const copyBtn = document.getElementById('winCopy');

    function closeWinnerModal() {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    function openWinnerModal(prizeNumber, discountCode) {
        const n = Math.min(5, Math.max(1, parseInt(prizeNumber, 10) || 1));
        const prize = PRIZES[n];

        // prizeIcoEl.textContent = prize.icon;
        prizeValEl.textContent = prize.title;
        codeEl.textContent = (discountCode || '').toUpperCase();

        copyBtn.textContent = 'کپی لینک';
        copyBtn.classList.remove('copied');

        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    window.openWinnerModal = openWinnerModal;
    window.closeWinnerModal = closeWinnerModal;

    const termsOverlay = document.getElementById('termsOverlay');
    const termsCloseBtn = document.getElementById('termsClose');
    const termsTitleEl = document.getElementById('termsTitle');
    const termsSubEl = document.getElementById('termsSubtitle');
    const termsListEl = document.getElementById('termsList');
    const termsSubmit = document.getElementById('termsSubmit');
    const termsBtn1 =  document.getElementById('rulesBtn1');
    const termsBtn2 =  document.getElementById('rulesBtn2');

    const faDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const toFa = n => String(n).split('').map(d => faDigits[d] ?? d).join('');

    const DEFAULT_TERMS_RULES = [
        'اعتبار استفاده تا ۳۰ روز آینده.',
        'قابل استفاده برای یک رزرو موفق بر روی پلتفرم.',
        'مخصوص ویلاهای منتخب با تگ تخفیف فعال.',
    ];

    function openTermsModal() {
        termsTitleEl.textContent = 'شرایط استفاده از جایزه';
        termsSubEl.textContent = 'قوانین و نکات مهم کمپین «یک شب میهمان‌شو»:';

        const list = DEFAULT_TERMS_RULES;
        termsListEl.innerHTML = list.map((rule, i) => `
      <li class="terms-item">
        <span>${rule}</span>
        <span class="terms-num">${toFa(i + 1)}</span>
      </li>
    `).join('');

        termsOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeTermsModal() {
        termsOverlay.classList.remove('open');
        if (!overlay.classList.contains('open')) document.body.style.overflow = '';
    }

    termsCloseBtn.addEventListener('click', closeTermsModal);
    termsSubmit.addEventListener('click', closeTermsModal);
    termsOverlay.addEventListener('click', (e) => { if (e.target === termsOverlay) closeTermsModal(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && termsOverlay.classList.contains('open')) closeTermsModal();
    });

    termsBtn1.addEventListener('click', () => openTermsModal());
    termsBtn2.addEventListener('click', () => openTermsModal());

    window.openTermsModal = openTermsModal;
    window.closeTermsModal = closeTermsModal;


    closeBtn.addEventListener('click', closeWinnerModal);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeWinnerModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('open')) {
            closeWinnerModal();
        }
    });

    copyBtn.addEventListener('click', () => {
        const code = codeEl.textContent.trim();

        navigator.clipboard.writeText(code).catch(() => { });

        copyBtn.textContent = 'کپی شد!';
        copyBtn.classList.add('copied');

        setTimeout(() => {
            copyBtn.textContent = 'کپی لینک';
            copyBtn.classList.remove('copied');
        }, 1800);
    });

    function clickOnSpinButton() {
        const wheel = document.querySelector("#main-wheel-circle");
        const button = document.querySelector("#spin-button");

        const ITEM_COUNT = 8;
        const STEP = 360 / ITEM_COUNT;

        let currentRotation = 0;
        let spinning = false;
        let fastSpinInterval = null;

        async function getWinnerNumber() {
            // backend : change example url with you're url and remove uncomment part of this function, create endpoint return json file has {winner :number of 1 -5 winCode : string code}
            // const response = await fetch("https://api.example.com/spin", {
            //     method: "POST",
            //     headers: {
            //         "Content-Type": "application/json"
            //     }
            // });

            // if (!response.ok) {
            //     throw new Error("Spin failed");
            // }

            // const data = await response.json();
            // return data;
            const fakeWin = new Promise(resolve => {
                const delay = 1000 + Math.random() * 3000;
                setTimeout(() => resolve(Math.floor(Math.random() * 5) + 1), delay);
            })
            const data = {
                winner: await fakeWin, winCode: "hi"
            }
            return data
        }

        async function startSpin() {
            if (spinning) return;

            spinning = true;
            button.disabled = true;
            button.classList.add("is-spinning");

            fastSpinInterval = setInterval(() => {
                currentRotation += 90;
                wheel.style.transition = "transform 0.1s linear";
                wheel.style.transform = `translateY(290px) rotate(${currentRotation}deg)`;
            }, 100);

            try {
                const { winner, winCode } = await getWinnerNumber();

                stopOnNumber(winner);

                setTimeout(() => {
                    openWinnerModal(winner, winCode);
                }, 4500);

            } catch (error) {
                console.log(error);

                clearInterval(fastSpinInterval);

                spinning = false;
                button.disabled = false;
                button.classList.remove("is-spinning");

                alert("خطایی رخ داد، لطفا دوباره تلاش کنید.");
            }
        }

        function stopOnNumber(number) {
            clearInterval(fastSpinInterval);

            const targetSectorAngle =
                ((ITEM_COUNT - number + 1) % ITEM_COUNT) * STEP;

            const currentModulo = currentRotation % 360;

            let delta = targetSectorAngle - currentModulo;

            if (delta <= 0) delta += 360;

            currentRotation += delta + (360 * 5);

            wheel.style.transition =
                "transform 4.5s cubic-bezier(0.12,0.88,0.08,1)";
            wheel.style.transform =
                `translateY(290px) rotate(${currentRotation}deg)`;

            setTimeout(() => {
                spinning = false;
                button.disabled = false;
                button.classList.remove("is-spinning");
            }, 4500);
        }

        startSpin();
    }

    window.clickOnSpinButton = clickOnSpinButton;
}

openWinTab();
document.addEventListener('DOMContentLoaded', () => {
    const allNavItems = document.querySelectorAll('.main-nav .nav-item, .mobile-nav .nav-item');

    const sectionsMap = new Map();
    const hrefToNavItems = new Map();

    allNavItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href && href.startsWith('#') && href.length > 1) {
            if (!sectionsMap.has(href)) {
                const section = document.querySelector(href);
                if (section) sectionsMap.set(href, section);
            }
            if (!hrefToNavItems.has(href)) hrefToNavItems.set(href, []);
            hrefToNavItems.get(href).push(item);
        }
    });

    function setActive(activeHref) {
        allNavItems.forEach(item => item.classList.remove('active'));
        const items = hrefToNavItems.get(activeHref) || [];
        items.forEach(item => item.classList.add('active'));

        if (!activeHref) {
            document.querySelectorAll('.main-nav .nav-item:first-child, .mobile-nav .nav-item:first-child')
                .forEach(item => item.classList.add('active'));
        }
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const href = [...sectionsMap.entries()].find(([, sec]) => sec === entry.target)?.[0];
                if (href) setActive(href);
            }
        });
    }, {
        root: null,
        rootMargin: '-30% 0px -60% 0px',
        threshold: 0
    });

    sectionsMap.forEach(section => observer.observe(section));

    window.addEventListener('scroll', () => {
        if (window.scrollY < 50) {
            setActive(null);
        }
    });

    allNavItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const href = item.getAttribute('href');
            if (href && href.startsWith('#') && href.length > 1) {
                e.preventDefault();
                document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});

document.querySelectorAll('.btn-copy').forEach(button => {
    button.addEventListener('click', async () => {
        const wrapper = button.closest('.share-link-wrapper');
        const linkText = wrapper.querySelector('.link-text').textContent.trim();

        try {
            await navigator.clipboard.writeText(linkText);
            showCopyFeedback(button);
        } catch (err) {
            fallbackCopy(linkText);
            showCopyFeedback(button);
        }
    });
});

function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}

function showCopyFeedback(button) {
    const span = button.querySelector('span');
    const originalText = span.textContent;
    span.textContent = 'کپی شد ✓';
    button.disabled = true;

    setTimeout(() => {
        span.textContent = originalText;
        button.disabled = false;
    }, 1500);
}