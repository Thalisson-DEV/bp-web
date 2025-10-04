/**
 * @file Gerenciamento de microinterações
 * @author Thalisson
 * @version 1.0.0
 *
 * Este script adiciona microinterações e feedback visual aos elementos da interface
 */

(function() {
    'use strict';

    /**
     * Adiciona efeito ripple aos botões
     */
    function addRippleEffect() {
        document.addEventListener('click', function(e) {
            const button = e.target.closest('.btn');
            if (!button) return;

            const ripple = document.createElement('span');
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple-effect');

            button.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    }

    /**
     * Adiciona animação de loading aos botões de formulário
     */
    function handleFormSubmissions() {
        document.addEventListener('submit', function(e) {
            const form = e.target;
            const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');

            if (submitBtn && !submitBtn.classList.contains('loading')) {
                submitBtn.classList.add('loading');
                submitBtn.disabled = true;

                // Remover loading após 5 segundos (fallback)
                setTimeout(() => {
                    submitBtn.classList.remove('loading');
                    submitBtn.disabled = false;
                }, 5000);
            }
        });
    }

    /**
     * Adiciona validação visual aos inputs
     */
    function addInputValidation() {
        document.addEventListener('blur', function(e) {
            const input = e.target;
            if (input.tagName !== 'INPUT' && input.tagName !== 'TEXTAREA') return;

            const formGroup = input.closest('.form-group');
            if (!formGroup) return;

            // Remover classes anteriores
            formGroup.classList.remove('error', 'success');

            // Validação básica
            if (input.required && !input.value.trim()) {
                formGroup.classList.add('error');
                showErrorMessage(formGroup, 'Este campo é obrigatório');
            } else if (input.type === 'email' && input.value && !isValidEmail(input.value)) {
                formGroup.classList.add('error');
                showErrorMessage(formGroup, 'Email inválido');
            } else if (input.value) {
                formGroup.classList.add('success');
                removeErrorMessage(formGroup);
            }
        }, true);
    }

    /**
     * Valida formato de email
     */
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    /**
     * Mostra mensagem de erro
     */
    function showErrorMessage(formGroup, message) {
        removeErrorMessage(formGroup);
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.textContent = message;
        formGroup.appendChild(errorMsg);
    }

    /**
     * Remove mensagem de erro
     */
    function removeErrorMessage(formGroup) {
        const existingError = formGroup.querySelector('.error-message');
        if (existingError) existingError.remove();
    }

    /**
     * Adiciona contadores de caracteres para textareas
     */
    function addCharacterCounter() {
        document.querySelectorAll('textarea[maxlength]').forEach(textarea => {
            const maxLength = textarea.getAttribute('maxlength');
            const counter = document.createElement('div');
            counter.className = 'character-counter';
            counter.style.cssText = 'text-align: right; font-size: 0.875rem; color: var(--text-light); margin-top: 0.25rem;';

            const updateCounter = () => {
                const remaining = maxLength - textarea.value.length;
                counter.textContent = `${remaining} caracteres restantes`;
                counter.style.color = remaining < 20 ? 'var(--error-color)' : 'var(--text-light)';
            };

            textarea.addEventListener('input', updateCounter);
            textarea.parentNode.appendChild(counter);
            updateCounter();
        });
    }

    /**
     * Adiciona animação suave ao scroll
     */
    function smoothScrollToAnchor() {
        document.addEventListener('click', function(e) {
            const link = e.target.closest('a[href^="#"]');
            if (!link) return;

            const href = link.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    }

    /**
     * Adiciona feedback visual ao copiar texto
     */
    function addCopyFeedback() {
        document.addEventListener('copy', function() {
            showToast('Texto copiado!', 'success');
        });
    }

    /**
     * Mostra toast notification
     */
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--primary-color);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            animation: fadeInUp 0.3s ease-out;
        `;

        if (type === 'success') toast.style.background = 'var(--success-color)';
        if (type === 'error') toast.style.background = 'var(--error-color)';

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease-in';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /**
     * Adiciona lazy loading para imagens
     */
    function addLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');

        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    /**
     * Adiciona efeito parallax suave ao welcome banner
     */
    function addParallaxEffect() {
        const banner = document.querySelector('.welcome-banner');
        if (!banner) return;

        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            banner.style.transform = `translateY(${scrolled * 0.5}px)`;
        });
    }

    /**
     * Adiciona animação aos números (contadores)
     */
    function animateNumbers() {
        const numbers = document.querySelectorAll('.stat-number');

        const numberObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    const finalValue = parseFloat(target.textContent);
                    animateValue(target, 0, finalValue, 1500);
                    numberObserver.unobserve(target);
                }
            });
        });

        numbers.forEach(num => numberObserver.observe(num));
    }

    /**
     * Anima um valor numérico
     */
    function animateValue(element, start, end, duration) {
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const value = start + (end - start) * easeOutQuad(progress);
            element.textContent = Math.floor(value);

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = end;
            }
        }

        requestAnimationFrame(update);
    }

    /**
     * Função de easing
     */
    function easeOutQuad(t) {
        return t * (2 - t);
    }

    /**
     * Adiciona estado de hover melhorado para cards
     */
    function enhanceCardInteractions() {
        document.addEventListener('mousemove', function(e) {
            const card = e.target.closest('.card');
            if (!card) return;

            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    }

    /**
     * Inicializa todas as microinterações
     */
    function init() {
        // Aguardar o DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupMicrointeractions);
        } else {
            setupMicrointeractions();
        }
    }

    /**
     * Configura todas as microinterações
     */
    function setupMicrointeractions() {
        addRippleEffect();
        handleFormSubmissions();
        addInputValidation();
        addCharacterCounter();
        smoothScrollToAnchor();
        addCopyFeedback();
        addLazyLoading();
        addParallaxEffect();
        animateNumbers();
        enhanceCardInteractions();
    }

    // Exportar função pública para reinicializar após navegação SPA
    window.Microinteractions = {
        init: setupMicrointeractions,
        showToast: showToast
    };

    // Inicializar
    init();

})();