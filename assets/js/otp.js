function otpMain() {
    const authForm = document.getElementById('authForm');
    const phoneInput = document.getElementById('phone');
    const overlay = document.getElementById('otpOverlay');
    const closeBtn = document.getElementById('otpClose');
    const editBtn = document.getElementById('otpEdit');
    const fields = [...document.querySelectorAll('#otpFields input')];
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

    function toFa(str) {
        const map = { '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴', '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹' };
        return String(str).replace(/[0-9]/g, d => map[d]);
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

    function openOtp() {
        phoneLabel.textContent = phoneInput.value.trim() || '—';
        fields.forEach(f => { f.value = ''; f.classList.remove('error'); });
        statusEl.textContent = '';
        statusEl.classList.remove('ok');
        submitBtn.disabled = true;
        
        otpContent.style.display = 'block';
        otpUserForm.style.display = 'none';
        
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        startTimer();
        setTimeout(() => fields[0].focus(), 260);
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

    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!phoneInput.value.trim()) {
            phoneInput.focus();
            return;
        }
        openOtp();
    });

    closeBtn.addEventListener('click', closeOtp);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeOtp(); });
    editBtn.addEventListener('click', () => { closeOtp(); phoneInput.focus(); });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('open')) closeOtp();
    });

    function checkComplete() {
        const val = fields.map(f => f.value).join('');
        submitBtn.disabled = val.length !== fields.length;
        return val;
    }

    fields.forEach((input, idx) => {
        input.addEventListener('input', () => {
            input.value = input.value.replace(/[^0-9۰-۹]/g, '').slice(-1);
            input.classList.remove('error');
            if (input.value && idx < fields.length - 1) {
                fields[idx + 1].focus();
            }
            checkComplete();
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !input.value && idx > 0) {
                fields[idx - 1].focus();
            }
        });

        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const text = (e.clipboardData.getData('text') || '').replace(/[^0-9]/g, '');
            if (!text) return;
            text.split('').slice(0, fields.length).forEach((ch, i) => {
                if (fields[i]) fields[i].value = ch;
            });
            const next = Math.min(text.length, fields.length - 1);
            fields[next].focus();
            checkComplete();
        });
    });

    resendBtn.addEventListener('click', () => {
        if (resendBtn.disabled) return;
        // backend : add lagic
        fields.forEach(f => { f.value = ''; f.classList.remove('error'); });
        statusEl.textContent = 'کد جدید ارسال شد.';
        statusEl.classList.add('ok');
        submitBtn.disabled = true;
        startTimer();
        fields[0].focus();
    });

    submitBtn.addEventListener('click', () => {
        const code = fields.map(f => f.value).join('');
        // backend: replace with real API check + isNewUser in res
        if (code.length === fields.length) {
            statusEl.classList.add('ok');
            statusEl.textContent = 'کد با موفقیت تایید شد.';
            
            setTimeout(() => {
                if (isNewUser) {
                    showUserForm();
                } else {
                    closeOtp();
                }
            }, 900);
        } else {
            fields.forEach(f => { if (!f.value) f.classList.add('error'); });
            statusEl.classList.remove('ok');
            statusEl.textContent = 'لطفا کد را کامل وارد کنید.';
        }
    });

    userDataForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = userNameInput.value.trim();
        const gender = userGenderSelect.value;

        if (!name || !gender) {
            formStatus.textContent = 'لطفا تمام فیلدها را پر کنید.';
            formStatus.classList.remove('ok');
            return;
        }

        const userData = {
            name,
            gender,
            phone: phoneInput.value.trim(),
            timestamp: new Date().toISOString()
        };

        formStatus.classList.add('ok');
        formStatus.textContent = 'ثبت نام با موفقیت انجام شد.';

        setTimeout(() => {
            closeOtp();
        }, 900);
    });
};

otpMain()