function otpMain() {
    const authForm = document.getElementById('authForm');
    const phoneInput = document.getElementById('phone');
    const overlay = document.getElementById('otpOverlay');
    const closeBtn = document.getElementById('otpClose');
    const editBtn = document.getElementById('otpEdit');

    const realInput = document.getElementById('otpRealInput');
    const boxes = [...document.querySelectorAll('#otpBoxes .otp-box')];

    const submitBtn = document.getElementById('otpSubmit');
    const resendBtn = document.getElementById('otpResend');
    const timerEl = document.getElementById('otpTimer');
    const statusEl = document.getElementById('otpStatus');
    const phoneLabel = document.getElementById('otpPhone');

    const otpContent = document.getElementById('otpContent');
    const otpUserForm = document.getElementById('otpUserForm');
    const userDataForm = document.getElementById('userDataForm');
    const userNameInput = document.getElementById('userName');
    const userGenderSelect = document.getElementById('userGender');
    const formStatus = document.getElementById('formStatus');

    let timerId = null;
    let seconds = 90;
    let isNewUser = true;

    function normalizeDigits(str) {
        return str
            .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
            .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
    }

    function formatTime(s) {
        const m = String(Math.floor(s / 60)).padStart(2, '0');
        const r = String(s % 60).padStart(2, '0');
        return `${m}:${r}`;
    }

    function startTimer() {
        clearInterval(timerId);
        seconds = 90;
        resendBtn.disabled = true;
        resendBtn.classList.remove('active');
        resendBtn.textContent = 'تا ارسال مجدد';
        timerEl.style.display = '';
        timerEl.textContent = formatTime(seconds);
        timerId = setInterval(() => {
            seconds--;
            if (seconds <= 0) {
                clearInterval(timerId);
                resendBtn.disabled = false;
                resendBtn.classList.add('active');
                resendBtn.textContent = 'ارسال مجدد کد';
                timerEl.style.display = 'none';
            } else {
                timerEl.textContent = formatTime(seconds);
            }
        }, 1000);
    }

    function handleSubmission() {
        const code = realInput.value;
        if (code.length === boxes.length) {
            statusEl.classList.add('ok');
            statusEl.textContent = 'کد با موفقیت تایید شد.';

            setTimeout(() => {
                if (isNewUser) {
                    showUserForm();
                } else {
                    closeOtp();
                }
            }, 800);
        } else {
            boxes.forEach(b => { if (!b.textContent) b.classList.add('error'); });
            statusEl.classList.remove('ok');
            statusEl.textContent = 'لطفا کد را کامل وارد کنید.';
        }
    }

    function updateBoxes() {
        let val = normalizeDigits(realInput.value);
        val = val.replace(/[^0-9]/g, '').slice(0, boxes.length);
        realInput.value = val;

        const isFocused = document.activeElement === realInput;

        boxes.forEach((box, i) => {
            box.classList.remove('error');
            if (i < val.length) {
                box.textContent = val[i];
                box.classList.add('filled');
                box.classList.remove('active');
            } else if (i === val.length && isFocused) {
                box.textContent = '';
                box.classList.remove('filled');
                box.classList.add('active');
            } else {
                box.textContent = '';
                box.classList.remove('filled', 'active');
            }
        });

        submitBtn.disabled = val.length !== boxes.length;

        if (val.length === boxes.length) {
            handleSubmission();
        }

        return val;
    }

    realInput.addEventListener('input', updateBoxes);

    realInput.addEventListener('focus', updateBoxes);

    realInput.addEventListener('blur', () => {
        boxes.forEach(box => box.classList.remove('active'));
    });

    realInput.addEventListener('paste', (e) => {
        e.preventDefault();
        const pastedData = (e.clipboardData || window.clipboardData).getData('text');
        const cleanData = normalizeDigits(pastedData).replace(/[^0-9]/g, '').slice(0, boxes.length);
        realInput.value = cleanData;
        updateBoxes();
    });

    realInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (realInput.value.length === boxes.length) {
                handleSubmission();
            }
        }
    });

    function openOtp() {
        phoneLabel.textContent = phoneInput.value.trim() || '—';
        realInput.value = '';
        updateBoxes();
        
        statusEl.textContent = '';
        statusEl.classList.remove('ok');
        submitBtn.disabled = true;
        
        otpContent.style.display = 'block';
        otpUserForm.style.display = 'none';
        
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        startTimer();
        setTimeout(() => realInput.focus(), 150);
    }

    function closeOtp() {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
        clearInterval(timerId);
    }

    function showUserForm() {
        otpContent.style.display = 'none';
        otpUserForm.style.display = 'block';
        userNameInput.value = '';
        userGenderSelect.value = '';
        formStatus.textContent = '';
        formStatus.classList.remove('ok');
        setTimeout(() => userNameInput.focus(), 100);
    }

    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!phoneInput.value.trim()) {
                phoneInput.focus();
                return;
            }
            openOtp();
        });
    }

    if (closeBtn) closeBtn.addEventListener('click', closeOtp);
    if (overlay) overlay.addEventListener('click', (e) => { if (e.target === overlay) closeOtp(); });
    if (editBtn) editBtn.addEventListener('click', () => { closeOtp(); phoneInput.focus(); });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('open')) closeOtp();
    });

    if (resendBtn) {
        resendBtn.addEventListener('click', () => {
            if (resendBtn.disabled) return;
            realInput.value = '';
            updateBoxes();
            statusEl.textContent = 'کد جدید ارسال شد.';
            statusEl.classList.add('ok');
            submitBtn.disabled = true;
            startTimer();
            realInput.focus();
        });
    }

    if (submitBtn) {
        submitBtn.addEventListener('click', handleSubmission);
    }

    if (userDataForm) {
        userDataForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = userNameInput.value.trim();
            const gender = userGenderSelect.value;

            if (!name || !gender) {
                formStatus.textContent = 'لطفا تمام فیلدها را پر کنید.';
                formStatus.classList.remove('ok');
                return;
            }

            formStatus.classList.add('ok');
            formStatus.textContent = 'ثبت نام با موفقیت انجام شد.';

            setTimeout(() => {
                closeOtp();
            }, 900);
        });
    }
}

otpMain();