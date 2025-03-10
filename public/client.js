const { createClient } = supabase;

const supabaseClient = createClient(
    "https://exfoarzguxjwoaquiuin.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4Zm9hcnpndXhqd29hcXVpdWluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwNTI2OTcsImV4cCI6MjA1NTYyODY5N30.uE9x768lAgM9pAQzldx7E3r0xcXzNw7ltSyVTSmeuDc"
);

function setupModalListeners() {
    const modal = document.getElementById('authModal');
    const registerModal = document.getElementById('registerModal');
    const signInBtn = document.querySelector('.signInBtn');
    const registerBtn = document.querySelector('.registerBtn');
    const closeBtn = document.querySelector('.close');
    const closeRegisterBtn = document.querySelector('.close-register');

    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            showToast("Passwords don't match!", 'error');
            return;
        }
        await signUp(email, password);
    });

    document.getElementById('authForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        await signIn(email, password);
    });

    signInBtn.addEventListener('click', () => {
        if (signInBtn.textContent === 'Sign Out') {
            supabaseClient.auth.signOut();
        } else {
            document.getElementById('modalTitle').textContent = 'Sign in';
            modal.style.display = 'block';
        }
    });

    registerBtn.addEventListener('click', () => {
        document.getElementById('modalTitle').textContent = 'Register';
        registerModal.style.display = 'block';
    });

    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    closeRegisterBtn.addEventListener('click', () => registerModal.style.display = 'none');

    window.addEventListener('click', (event) => {
        if (event.target === modal) modal.style.display = 'none';
        if (event.target === registerModal) registerModal.style.display = 'none';
    });
}

async function signUp(email, password) {
    const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
    });

    if (error) {
        showToast(error.message, 'error');
    } else {
        showToast("Sign-up successful! Check your email to confirm.", 'success');
        document.getElementById('registerModal').style.display = 'none';
    }
}

async function signIn(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        if (error.message.includes('Invalid login credentials')) {
            showToast("Account not found. Please register.", 'error');
            document.getElementById('authModal').style.display = 'none';
            document.getElementById('registerModal').style.display = 'block';
        } else {
            showToast(error.message, 'error');
        }
    } else {
        document.getElementById('authModal').style.display = 'none';
        showToast("Welcome back! ☕", 'success');
    }
}

function loadNavbar() {
    return fetch('navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;
            return supabaseClient.auth.getSession();
        })
        .then(({ data: { session } }) => {
            if (session) {
                const signInBtn = document.querySelector('.signInBtn');
                const registerBtn = document.querySelector('.registerBtn');
                const landingContainer = document.querySelector('.landing-container');
                const welcomeContainer = document.querySelector('.welcome-container');
                
                signInBtn.textContent = 'Sign Out';
                registerBtn.style.display = 'none';
                welcomeContainer.style.display = 'none';
                landingContainer.style.display = 'block';
            }
        });
}

document.addEventListener('DOMContentLoaded', () => {
    loadNavbar().then(() => {
        setupModalListeners();
        initializeCharts();
    });
});

supabaseClient.auth.onAuthStateChange((event, session) => {
    const signInBtn = document.querySelector('.signInBtn');
    const registerBtn = document.querySelector('.registerBtn');
    const landingContainer = document.querySelector('.landing-container');
    const welcomeContainer = document.querySelector('.welcome-container');
    
    if (session) {
        signInBtn.textContent = 'Sign Out';
        registerBtn.style.display = 'none';
        welcomeContainer.style.display = 'none';
        landingContainer.style.display = 'block';
    } else {
        signInBtn.textContent = 'Sign In';
        registerBtn.style.display = 'block';
        landingContainer.style.display = 'none';
        welcomeContainer.style.display = 'block';
    }
});
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    const icon = type === 'success' ? '✓' : '⚠';
    toast.innerHTML = `<span class="toast-icon">${icon}</span>${message}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    ripple.className = 'ripple';
    ripple.style.left = `${event.clientX - rect.left}px`;
    ripple.style.top = `${event.clientY - rect.top}px`;
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 1000);
}
