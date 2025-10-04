
/**
 * @file Gerenciamento do menu mobile responsivo
 * @author Thalisson
 * @version 1.0.0
 * 
 * Este script gerencia o comportamento do menu lateral em dispositivos móveis,
 * incluindo abertura/fechamento, overlay e ajustes de viewport.
 */

(function() {
    'use strict';

    // Variáveis de controle
    let sidebarNav = null;
    let mobileMenuBtn = null;
    let overlay = null;
    let isMenuOpen = false;
    let isInitialized = false;

    /**
     * Inicializa o menu mobile - pode ser chamado múltiplas vezes
     */
    function init() {
        // Ajustar altura do viewport (pode ser feito sempre)
        adjustViewportHeight();
        
        // Listener para resize
        if (!isInitialized) {
            window.addEventListener('resize', debounce(handleWindowResize, 250));
            window.addEventListener('resize', debounce(adjustViewportHeight, 250));
            isInitialized = true;
        }

        // Tentar configurar os elementos (pode falhar se ainda não foram carregados)
        trySetup();
    }

    /**
     * Tenta configurar o menu mobile
     * Retorna true se conseguiu, false se precisa tentar novamente
     */
    function trySetup() {
        // Verificar se os elementos principais existem
        const headerLeft = document.querySelector('.header-left');
        const sidebar = document.querySelector('.sidebar-nav');
        
        if (!headerLeft || !sidebar) {
            return false;
        }

        createMobileElements();
        cacheDOMElements();
        attachEventListeners();
        handleInitialState();

        return true;
    }

    /**
     * Cria os elementos necessários para o menu mobile
     */
    function createMobileElements() {
        // Criar botão de menu mobile se não existir
        if (!document.querySelector('.mobile-menu-btn')) {
            createMobileMenuButton();
        }

        // Criar overlay para o menu mobile
        if (!document.querySelector('.mobile-menu-overlay')) {
            createOverlay();
        }
    }

    /**
     * Cria o botão hambúrguer para abrir o menu
     */
    function createMobileMenuButton() {
        const headerLeft = document.querySelector('.header-left');
        if (!headerLeft) {
            console.warn('⚠️ .header-left não encontrado');
            return;
        }

        const button = document.createElement('button');
        button.className = 'mobile-menu-btn';
        button.setAttribute('aria-label', 'Abrir menu de navegação');
        button.setAttribute('aria-expanded', 'false');
        button.innerHTML = `
            <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
        `;

        headerLeft.insertBefore(button, headerLeft.firstChild);
    }

    /**
     * Cria o overlay escuro quando o menu está aberto
     */
    function createOverlay() {
        const existingOverlay = document.querySelector('.mobile-menu-overlay');
        if (existingOverlay) return;

        const overlay = document.createElement('div');
        overlay.className = 'mobile-menu-overlay';
        overlay.setAttribute('aria-hidden', 'true');
        document.body.appendChild(overlay);
    }

    /**
     * Armazena referências aos elementos do DOM
     */
    function cacheDOMElements() {
        sidebarNav = document.querySelector('.sidebar-nav');
        mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        overlay = document.querySelector('.mobile-menu-overlay');

        console.log('Elementos cacheados:', {
            sidebar: !!sidebarNav,
            button: !!mobileMenuBtn,
            overlay: !!overlay
        });
    }

    /**
     * Adiciona todos os event listeners necessários
     */
    function attachEventListeners() {
        // Remover listeners antigos para evitar duplicação
        if (mobileMenuBtn) {
            mobileMenuBtn.replaceWith(mobileMenuBtn.cloneNode(true));
            mobileMenuBtn = document.querySelector('.mobile-menu-btn');
            mobileMenuBtn.addEventListener('click', toggleMenu);
        }

        // Overlay (fechar ao clicar fora)
        if (overlay) {
            overlay.replaceWith(overlay.cloneNode(true));
            overlay = document.querySelector('.mobile-menu-overlay');
            overlay.addEventListener('click', closeMenu);
        }

        // Links de navegação (fechar após clicar)
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', handleNavLinkClick);
        });

        // Tecla ESC para fechar o menu
        document.removeEventListener('keydown', handleKeyPress);
        document.addEventListener('keydown', handleKeyPress);
    }

    /**
     * Alterna entre abrir e fechar o menu
     */
    function toggleMenu(event) {
        event.preventDefault();
        event.stopPropagation();

        if (isMenuOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    /**
     * Abre o menu lateral
     */
    function openMenu() {
        if (!sidebarNav) {
            return;
        }

        isMenuOpen = true;
        sidebarNav.classList.add('active');
        if (overlay) overlay.classList.add('active');
        document.body.classList.add('menu-open');

        // Atualizar atributos de acessibilidade
        if (mobileMenuBtn) {
            mobileMenuBtn.setAttribute('aria-expanded', 'true');
        }

        // Prevenir scroll no body
        disableBodyScroll();
    }

    /**
     * Fecha o menu lateral
     */
    function closeMenu() {
        if (!sidebarNav) {
            console.error('❌ Não foi possível fechar - sidebar não encontrada');
            return;
        }

        isMenuOpen = false;
        sidebarNav.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.classList.remove('menu-open');

        // Atualizar atributos de acessibilidade
        if (mobileMenuBtn) {
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
        }

        // Restaurar scroll no body
        enableBodyScroll();
    }

    /**
     * Gerencia o clique em links de navegação
     */
    function handleNavLinkClick() {
        // Fechar o menu apenas em dispositivos móveis
        if (window.innerWidth <= 768) {
            setTimeout(closeMenu, 150);
        }
    }

    /**
     * Gerencia o pressionamento de teclas
     */
    function handleKeyPress(event) {
        // Fechar menu ao pressionar ESC
        if (event.key === 'Escape' && isMenuOpen) {
            closeMenu();
        }
    }

    /**
     * Gerencia o redimensionamento da janela
     */
    function handleWindowResize() {
        const isMobile = window.innerWidth <= 768;

        // Se mudou para desktop e o menu estava aberto, fechar
        if (!isMobile && isMenuOpen) {
            closeMenu();
        }

        // Ajustar visibilidade do botão mobile
        if (mobileMenuBtn) {
            mobileMenuBtn.style.display = isMobile ? 'block' : 'none';
        }
    }

    /**
     * Define o estado inicial baseado no tamanho da tela
     */
    function handleInitialState() {
        const isMobile = window.innerWidth <= 768;

        if (mobileMenuBtn) {
            mobileMenuBtn.style.display = isMobile ? 'block' : 'none';
        }

        if (!isMobile && isMenuOpen) {
            closeMenu();
        }
    }

    /**
     * Ajusta a altura do viewport para dispositivos móveis
     */
    function adjustViewportHeight() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    /**
     * Desabilita o scroll do body quando o menu está aberto
     */
    function disableBodyScroll() {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    /**
     * Habilita o scroll do body quando o menu está fechado
     */
    function enableBodyScroll() {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    }

    /**
     * Função debounce para otimizar eventos que disparam muitas vezes
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Inicializar quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Exportar funções públicas para uso da SPA
    window.MobileMenu = {
        init: trySetup, // Permite reinicializar após carregar nova página
        open: openMenu,
        close: closeMenu,
        toggle: toggleMenu,
        isOpen: () => isMenuOpen
    };

})();
