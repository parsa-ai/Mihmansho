function clickOnSpinButton() {
    const wheel = document.querySelector("#main-wheel-circle");
    const button = document.querySelector("#spin-button");

    const ITEM_COUNT = 8;
    const STEP = 360 / ITEM_COUNT;

    let currentRotation = 0;
    let spinning = false;

    let fastSpinInterval = null;
    async function getWinnerNumber() {
        // backend : change example url with you're url and remove uncomment part of this function
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
        // return data.winner;
        return new Promise(resolve => {
            const delay = 1000 + Math.random() * 3000;
            setTimeout(() => resolve(Math.floor(Math.random() * 8) + 1), delay);
        });
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
            const winner = await getWinnerNumber();

            stopOnNumber(winner);
        } catch (error) {
            clearInterval(fastSpinInterval);
            spinning = false;
            button.disabled = false;
            button.classList.remove("is-spinning");
            alert("خطایی رخ داد، لطفا دوباره تلاش کنید.");
        }
    }

    function stopOnNumber(number) {
        clearInterval(fastSpinInterval);

        const targetSectorAngle = ((ITEM_COUNT - number + 1) % ITEM_COUNT) * STEP;

        const currentModulo = currentRotation % 360;
        let delta = targetSectorAngle - currentModulo;
        if (delta <= 0) delta += 360;

        currentRotation = currentRotation + delta + (360 * 5);

        wheel.style.transition = "transform 4.5s cubic-bezier(0.12, 0.88, 0.08, 1)";
        wheel.style.transform = `translateY(290px) rotate(${currentRotation}deg)`;

        setTimeout(() => {
            spinning = false;
            button.disabled = false;
            button.classList.remove("is-spinning");
        }, 4500);
    }

    startSpin()
}

document.addEventListener('DOMContentLoaded', () => {
    // انتخاب همه ناوها (دسکتاپ + موبایل)
    const allNavItems = document.querySelectorAll('.main-nav .nav-item, .mobile-nav .nav-item');

    // گروه‌بندی سکشن‌ها بر اساس href
    const sectionsMap = new Map(); // href -> section element
    const hrefToNavItems = new Map(); // href -> [navItem, navItem, ...]

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

        // اگه لینک "خانه" (بدون هش واقعی) بود جدا مدیریت کن
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
            setActive(null); // فعال کردن آیتم اول (میهمان شو)
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