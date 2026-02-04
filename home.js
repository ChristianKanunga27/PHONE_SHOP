
    
        const menuToggle = document.querySelector('.menu-toggle');
        const navMenu = document.querySelector('nav ul');

        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        
        document.querySelectorAll('nav a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                document.querySelectorAll('nav a').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });

        
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

         
        window.addEventListener('scroll', () => {
            const header = document.querySelector('header');
            if (window.scrollY > 50) {
                header.style.boxShadow = '0 5px 20px rgba(0,0,0,0.2)';
            } else {
                header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
            }
        });
 
        (function() {
            const moreBtn = document.querySelector('.btn-more');
            if (!moreBtn) return;
            let clickCount = 0; // number of times extra cards have been added

            const additionalImages = [
                'i phone1.avif',
                'i phone2.avif',
                'i phone3.avif',
                'i phone4.avif',
                'i phone5.avif',
                'i phone7.avif',
                'i phone8.avif',
                'i phone9.avif',
                'i phone10.avif',
                'i phone12.avif',
                'i phone 6.avif',
                'phone1.png'
            ];

            // matching price for each image above (USD whole numbers)
            const additionalPrices = [
                499, 299, 899, 199, 699, 129, 399, 549, 799, 1099, 259, 499
            ];

            const USD_TO_TZS = 2500; // editable exchange rate (1 USD = 2500 TZS)
            const additionalNames = [
                'iPhone 11',
                'iPhone 12',
                'iPhone 12 Pro',
                'iPhone 16 Pro',
                'iPhone 13 Pro',
                'iPhone 25 Pro',
                'iPhone 14',
                'iPhone 14 Plus',
                'iPhone 14 Pro',
                'iPhone 14 Pro Max',
                'iPhone 15',
                'iPhone 15 Plus'
            ];

            function createCard(index) {
                // choose an image, name and price based on the index
                const idx = (index - 1) % additionalImages.length;
                const imgName = additionalImages[idx];
                const imgSrc = encodeURI(imgName); // encode filename spaces
                const name = additionalNames[idx];
                const priceUsd = additionalPrices[idx % additionalPrices.length];
                const priceTzs = priceUsd * USD_TO_TZS;
                const formattedPrice = new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS', maximumFractionDigits: 0 }).format(priceTzs);

                const card = document.createElement('div');
                card.className = 'collection-card';
                card.innerHTML = `
                    <div class="collection-image">
                        <img src="${imgSrc}" alt="${name}" loading="lazy">
                    </div>
                    <div class="collection-info">
                        <h3>${name}</h3>
                        <p class="collection-price">${formattedPrice}</p>
                        <p>Additional collection loaded on demand.</p>
                        <button class="collection-btn buy-now" onclick="window.location.href='registra.html'" aria-label="Buy ${name} for ${formattedPrice}">Buy Now</button>
                    </div>
                `;
                return card;
            }

            moreBtn.addEventListener('click', function() {
                // multiple clicks allowed: each click adds 3 new unique cards
                moreBtn.disabled = true;
                const labelSpan = moreBtn.querySelector('span:nth-child(2)');
                if (labelSpan) labelSpan.textContent = 'Loading...';
                moreBtn.classList.add('loading');

                const grid = document.querySelector('.collection-grid');
                if (!grid) return;

                const existing = grid.querySelectorAll('.collection-card').length;
                const startIndex = existing + 1;

                const fragment = document.createDocumentFragment();
                for (let i = 0; i < 3; i++) {
                    const idx = startIndex + i;
                    fragment.appendChild(createCard(idx));
                }

                // simulate small delay for loading feel
                setTimeout(() => {
                    grid.appendChild(fragment);

                    // Scroll to the first newly added card
                    const newCard = grid.querySelector(`.collection-card:nth-child(${startIndex})`);
                    if (newCard) {
                        newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }

                    if (labelSpan) labelSpan.textContent = 'More';
                    moreBtn.disabled = false;
                    moreBtn.classList.remove('loading');

                    clickCount++;
                }, 300);
            });
        })();

        // Login modal helpers
        function openLoginModal(prefillEmail) {
            const modal = document.getElementById('loginModal');
            if(!modal) return;
            if(prefillEmail) document.getElementById('modalEmail').value = decodeURIComponent(prefillEmail);
            modal.style.display = 'flex';
            modal.setAttribute('aria-hidden','false');
            document.getElementById('modalEmail').focus();
        }

        function closeLoginModal(){
            const modal = document.getElementById('loginModal'); if(!modal) return; modal.style.display='none'; modal.setAttribute('aria-hidden','true');
            document.getElementById('modalEmail').value=''; document.getElementById('modalPassword').value=''; document.getElementById('loginError').style.display='none';
        }

        function submitLoginFromModal(){
            const email = document.getElementById('modalEmail').value.trim();
            const pwd = document.getElementById('modalPassword').value;
            const err = document.getElementById('loginError'); err.style.display='none'; err.textContent='';
            if(!email || !pwd) { err.textContent='Please enter email and password.'; err.style.display='block'; return; }

            // check users saved in localStorage (demo only)
            let users = [];
            try { users = JSON.parse(localStorage.getItem('users') || '[]'); } catch (e) { users = []; }
            const user = users.find(u => u.email === email);
            if (!user) { err.textContent = 'No account found with this email.'; err.style.display = 'block'; return; }
            if (user.password !== pwd) { err.textContent = 'Incorrect password.'; err.style.display = 'block'; return; }

            // success: set currentUser and redirect to account page
            localStorage.setItem('currentUser', JSON.stringify({ email: user.email, name: user.name }));
            closeLoginModal();
            window.location.href = 'account.html';
        }

        // Ensure promo video plays; if autoplay is blocked, replace it with the poster image
        (function(){
            const vid = document.querySelector('#video-ad video');
            if(vid){
                // try to play; if rejected, replace with poster image to avoid showing play overlay
                const playPromise = vid.play();
                if(playPromise !== undefined){
                    playPromise.catch(() => {
                        try{
                            vid.style.display = 'none';
                            const img = document.createElement('img');
                            img.src = vid.getAttribute('poster') || 'i phone3.avif';
                            img.alt = 'Promo video';
                            img.style.width = '100%';
                            img.style.height = 'auto';
                            img.style.borderRadius = '10px';
                            img.setAttribute('aria-hidden','false');
                            vid.parentElement.appendChild(img);
                        } catch(e){ /* ignore */ }
                    });
                }
            }

            // If URL contains showLogin=1, open modal and prefill email if provided
            const params = new URLSearchParams(window.location.search);
            if(params.get('showLogin')){
                openLoginModal(params.get('email'));
            }
        })();