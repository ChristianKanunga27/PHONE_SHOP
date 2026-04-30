
const registra = document.getElementById('regForm');
registra.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;

    if (!username || !email || !password || !passwordConfirm || !phone) {
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

    const register = { username, email, password, phone };

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(register)
        });

        let data;
        try {
            data = await response.json();
        } catch (parseError) {
            console.error('Failed to parse response JSON:', parseError);
            data = null;
        }

        if (!response.ok) {
            const errorBox = document.getElementById('formError');
            const serverMessage = data?.message || `Registration failed (${response.status})`;
            errorBox.textContent = serverMessage;
            errorBox.style.display = 'block';
            return;
        }

        const userForStorage = {
            username: data.user?.username || username,
            email: data.user?.email || email,
            phone: data.user?.phone || phone,
            role: data.user?.role || 'user'
        };

        try {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const index = users.findIndex(u => u.email === userForStorage.email);
            if (index > -1) {
                users[index] = userForStorage;
            } else {
                users.push(userForStorage);
            }
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(userForStorage));
        } catch (storageError) {
            console.warn('LocalStorage save failed:', storageError);
        }

        const successBox = document.getElementById('successBox');
        successBox.style.display = 'block';
        document.getElementById('successMessage').textContent = data.message || 'Registration successful';
        document.getElementById('regForm').reset();

        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);

    } catch (error) {
        console.error('Registration request failed:', error);
        const errorBox = document.getElementById('formError');
        errorBox.textContent = `An error occurred: ${error.message || 'Please try again later.'}`;
        errorBox.style.display = 'block';
    }
});

const params = new URLSearchParams(window.location.search);

const product = params.get('product');
const price = params.get('price');

if(product && price){

    document.getElementById('productBox').style.display = 'block';
    document.getElementById('productName').textContent = product;
    document.getElementById('productPrice').textContent =
        "TZS " + Number(price).toLocaleString();

    document.getElementById('productInput').value = product;
    document.getElementById('priceInput').value = price;
}
