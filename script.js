// script.js - basic interactivity (save as script.js)
document.addEventListener('DOMContentLoaded', ()=> {
    // set year
    document.getElementById('year').textContent = new Date().getFullYear();

    // mobile menu toggle
    const hamburger = document.getElementById('hamburger');
    const nav = document.getElementById('main-nav');
    hamburger.addEventListener('click', ()=> {
        nav.classList.toggle('open');
        if(nav.classList.contains('open')){
            nav.style.display = 'flex';
            nav.style.flexDirection = 'column';
            nav.style.background = 'rgba(7,18,34,0.95)';
            nav.style.position = 'absolute';
            nav.style.top = '64px';
            nav.style.right = '20px';
            nav.style.padding = '12px';
            nav.style.borderRadius = '10px';
        } else {
            nav.style.display = '';
            nav.style.position = '';
            nav.style.top = '';
            nav.style.right = '';
            nav.style.padding = '';
            nav.style.borderRadius = '';
            nav.style.background = '';
        }
    });

    // simple hero CTA behaviour
    const heroBtn = document.getElementById('hero-get-started');
    heroBtn.addEventListener('click', ()=>{
        const email = document.querySelector('.hero-cta .email').value;
        const text = email ? `Hvala! Poslali smo ti instrukcije na ${email}.` : 'Hvala! Možeš se prijaviti kasnije.';
        alert(text);
    });

    // small animation: highlight feature cards on scroll
    const faders = document.querySelectorAll('.feature, .price-card, .doc-card');
    const inView = (el) => {
        const rect = el.getBoundingClientRect();
        return rect.top < window.innerHeight - 60;
    };
    const reveal = () => {
        faders.forEach(el=>{
            if(inView(el)) el.style.transform = 'translateY(0)', el.style.opacity = '1';
            else el.style.transform = 'translateY(20px)', el.style.opacity = '0';
            el.style.transition = 'all 600ms cubic-bezier(.2,.9,.2,1)';
        });
    };
    reveal();
    window.addEventListener('scroll', reveal);
});
