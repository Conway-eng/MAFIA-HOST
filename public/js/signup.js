document.addEventListener('DOMContentLoaded', function () {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    setupUsernameValidation();
    setupPasswordStrengthMeter();
    setupVerificationInputs();
    checkLogin();

    const referralCode = getUrlParameter('ref');
    if (referralCode) {
        showToast(`Signup with referral code: ${referralCode}`, 'info');
        document.getElementById('registerForm').dataset.referralCode = referralCode;
    }

    fetch('https://ipapi.co/json/')
        .then(response => response.json())
        .then(data => populateCountries(data.country_name))
        .catch(() => populateCountries());

    initRecaptcha();
});

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

function toggleTheme() {
    const newTheme = (document.documentElement.getAttribute('data-theme') === 'dark') ? 'light' : 'dark';
    setTheme(newTheme);
}

function toggleMenu() {
    document.querySelector('.mobile-menu').classList.toggle('hidden');
}

function setupUsernameValidation() {
    const usernameInput = document.getElementById('username');
    if (!usernameInput) return;

    usernameInput.addEventListener('input', async () => {
        const username = usernameInput.value;
        const status = document.getElementById('usernameStatus');

        if (username.length < 3) {
            status.innerText = 'Too short';
            status.style.color = 'red';
            return;
        }

        try {
            const res = await fetch(`/api/auth/check-username?username=${username}`);
            const data = await res.json();
            if (data.available) {
                status.innerText = 'Username is available!';
                status.style.color = 'green';
            } else {
                status.innerText = 'Username is taken';
                status.style.color = 'red';
            }
        } catch (err) {
            status.innerText = 'Error checking username';
            status.style.color = 'red';
        }
    });
}

function setupPasswordStrengthMeter() {
    const passwordInput = document.getElementById('password');
    const strengthBar = document.getElementById('strength-meter-fill');
    if (!passwordInput || !strengthBar) return;

    passwordInput.addEventListener('input', () => {
        const val = passwordInput.value;
        let strength = 0;
        if (val.length > 5) strength += 1;
        if (val.match(/[A-Z]/)) strength += 1;
        if (val.match(/[a-z]/)) strength += 1;
        if (val.match(/[0-9]/)) strength += 1;
        if (val.match(/[^A-Za-z0-9]/)) strength += 1;

        const width = (strength / 5) * 100;
        strengthBar.style.width = width + '%';
        strengthBar.style.backgroundColor = ['red', 'orange', 'yellow', 'lightgreen', 'green'][strength - 1] || 'gray';
    });
}

document.getElementById('signupForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email')?.value;
    const username = document.getElementById('username')?.value;
    const password = document.getElementById('password')?.value;
    const country = document.getElementById('country')?.value;
    const submitBtn = document.getElementById('submitBtn');

    if (!email || !username || !password || !country) return alert('Fill in all fields');

    submitBtn.innerText = 'Loading...';

    try {
        const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, username, password, country })
        });

        const data = await res.json();

        if (data.success) {
            alert(data.message);
            window.location.href = '/verify-signup';
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert('Something went wrong.');
        console.error(err);
    } finally {
        submitBtn.innerText = 'Get Started';
    }
});

// Verification form logic
document.getElementById('verifyButton')?.addEventListener('click', async () => {
    const code = document.getElementById('verificationCode')?.value;
    const email = document.getElementById('email')?.value;

    if (!code || !email) return alert('Fill all fields');

    try {
        const res = await fetch('/api/auth/verify-signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code })
        });

        const data = await res.json();

        if (data.success) {
            alert(data.message);
            window.location.href = '/dashboard';
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert('Verification error');
        console.error(err);
    }
});

function getUrlParameter(name) {
    const match = new RegExp('[?&]' + name + '=([^&#]*)').exec(window.location.href);
    return match ? decodeURIComponent(match[1]) : null;
}

// Snowflake animation (original uncapped version)
function createSnowContainer() {
    if (!document.querySelector('.snow-container')) {
        const container = document.createElement('div');
        container.classList.add('snow-container');
        document.body.appendChild(container);
    }
    return document.querySelector('.snow-container');
}

function createSnowflake() {
    const snowflake = document.createElement('div');
    snowflake.classList.add('snowflake');
    snowflake.innerHTML = '❄';

    const topOffset = Math.random() * 100 - 100; 
    snowflake.style.top = topOffset + 'px';
    snowflake.style.left = Math.random() * 100 + 'vw';

    const size = Math.random() * 8 + 8;
    snowflake.style.fontSize = size + 'px';

    const duration = Math.random() * 4 + 4;
    snowflake.style.animationDuration = duration + 's';

    const wobble = Math.random() * 50 - 25;
    snowflake.style.transform = `translateX(${wobble}px)`;
    snowflake.style.animationTimingFunction = `cubic-bezier(${Math.random()}, ${Math.random()}, ${Math.random()}, ${Math.random()})`;

    const container = createSnowContainer();
    container.appendChild(snowflake);

    setTimeout(() => {
        snowflake.remove();
    }, duration * 1000);
}

function startSnow() {
    for (let i = 0; i < 50; i++) {
        setTimeout(createSnowflake, Math.random() * 2000);
    }

    setInterval(() => {
        for (let i = 0; i < 3; i++) {
            createSnowflake();
        }
    }, 100);
}

function stopSnow() {
    const container = document.querySelector('.snow-container');
    if (container) {
        container.remove();
    }
}

function toggleSnow() {
    const isSnowing = document.body.classList.toggle('snowing');
    isSnowing ? startSnow() : stopSnow();
}

toggleSnow();

function initRecaptcha() {
    if (!window.grecaptcha) {
        const script = document.createElement('script');
        script.src = "https://www.google.com/recaptcha/api.js";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    }
}
