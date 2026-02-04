
document.getElementById('regForm').addEventListener('submit', (event) => {
    event.preventDefault();

    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;

    if (!fullName || !email || !password || !passwordConfirm) {
        const errorBox = document.getElementById('formError');
        errorBox.textContent = 'Please fill in all required fields.';
        errorBox.style.display = 'block';
        return;
    }
    if (password !== passwordConfirm) {
        const errorBox = document.getElementById('formError');
        errorBox.textContent = 'Passwords do not match.';
        errorBox.style.display = 'block';
        return;
    }

    const register = { username: fullName, email, password };

    fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(register)
    })
    .then(response => response.text())
    .then(message => {
        const successBox = document.getElementById('successBox');
        successBox.style.display = 'block';
        document.getElementById('successMessage').textContent = message;
        document.getElementById('regForm').reset();
    })
    .catch(error => {
        const errorBox = document.getElementById('formError');
        errorBox.textContent = 'An error occurred. Please try again later.';
        errorBox.style.display = 'block';
    });
});