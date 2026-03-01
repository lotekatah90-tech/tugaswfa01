document.addEventListener('DOMContentLoaded', () => {
    // 1. Theme Toggle Management
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeToggleText = document.getElementById('themeToggleText');
    const themeIcon = themeToggleBtn.querySelector('i');

    // Check saved theme or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        updateThemeUI('dark');
    }

    themeToggleBtn.addEventListener('click', () => {
        let currentTheme = document.documentElement.getAttribute('data-theme');
        let newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeUI(newTheme);

        // Re-render chart to update grid line colors if available
        if (window.growthChartInstance) {
            updateChartTheme(newTheme);
        }
    });

    function updateThemeUI(theme) {
        if (theme === 'dark') {
            themeIcon.classList.replace('ph-moon', 'ph-sun');
            themeToggleText.textContent = "Mode Terang";
        } else {
            themeIcon.classList.replace('ph-sun', 'ph-moon');
            themeToggleText.textContent = "Mode Gelap";
        }
    }

    // 1.5 Sidebar Collapse Logic
    const sidebar = document.getElementById('sidebar');
    const sidebarToggleBtn = document.getElementById('sidebar-toggle');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    if (sidebarToggleBtn && sidebar) {
        sidebarToggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');

            // WCAG: Update aria-expanded state
            const isExpanded = sidebarToggleBtn.getAttribute('aria-expanded') === 'true';
            sidebarToggleBtn.setAttribute('aria-expanded', !isExpanded);

            // Optional: Store preference in localStorage
            localStorage.setItem('sidebarCollapsed', !isExpanded);
        });

        // Restore saved preference on load
        const rawSavedPref = localStorage.getItem('sidebarCollapsed');
        if (rawSavedPref === 'true') {
            sidebar.classList.add('collapsed');
            sidebarToggleBtn.setAttribute('aria-expanded', 'false');
        }
    }

    // Mobile Sidebar Toggle
    if (mobileMenuBtn && sidebar && sidebarOverlay) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.add('mobile-open');
            sidebarOverlay.classList.add('show');
            sidebarOverlay.setAttribute('aria-hidden', 'false');
            // Try to set focus within sidebar
            const firstFocusable = sidebar.querySelector('a, button');
            if (firstFocusable) firstFocusable.focus();
        });

        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('mobile-open');
            sidebarOverlay.classList.remove('show');
            sidebarOverlay.setAttribute('aria-hidden', 'true');
        });
    }

    // 2. FAQ Accordion Logic (WCAG Compliant)
    const accordionTriggers = document.querySelectorAll('.accordion-trigger');

    accordionTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
            const contentId = trigger.getAttribute('aria-controls');
            const content = document.getElementById(contentId);

            // Toggle current
            if (isExpanded) {
                trigger.setAttribute('aria-expanded', 'false');
                content.hidden = true;
            } else {
                trigger.setAttribute('aria-expanded', 'true');
                content.hidden = false;
            }
        });

        // Keyboard support (Arrow keys) - WCAG Best Practice for Accordions
        trigger.addEventListener('keydown', (e) => {
            const triggersArray = Array.from(accordionTriggers);
            const index = triggersArray.indexOf(e.target);

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const next = triggersArray[index + 1] || triggersArray[0];
                next.focus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prev = triggersArray[index - 1] || triggersArray[triggersArray.length - 1];
                prev.focus();
            }
        });
    });


    // 3. Chart.js Implementation
    const ctx = document.getElementById('growthChart')?.getContext('2d');

    if (ctx) {
        // WCAG Note: The chart uses patterns/styles, but since Chart.js by default doesn't easily support SVGs as point styles out of the box without plugins, 
        // we ensure the text contrast is good, and rely on tooltips which we configure to be clear.

        const chartData = {
            labels: ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'],
            datasets: [
                {
                    label: 'YouTube (Views)',
                    data: [120000, 150000, 140000, 180000],
                    borderColor: '#dc2626', // Red
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    pointStyle: 'circle', // Unique shape for WCAG
                    pointRadius: 6,
                    pointHoverRadius: 8
                },
                {
                    label: 'TikTok (Views)',
                    data: [300000, 450000, 420000, 600000],
                    borderColor: '#2563eb', // Blue (Changed from black/white to blue for better visibility in both modes)
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    borderWidth: 3,
                    borderDash: [5, 5], // Dashed line for WCAG color-blindness support
                    tension: 0.4,
                    pointStyle: 'rectRot', // Unique shape for WCAG
                    pointRadius: 6,
                    pointHoverRadius: 8
                },
                {
                    label: 'Instagram (Reach)',
                    data: [100000, 110000, 105000, 130000],
                    borderColor: '#db2777', // Pink
                    backgroundColor: 'rgba(219, 39, 119, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    pointStyle: 'triangle', // Unique shape for WCAG
                    pointRadius: 6,
                    pointHoverRadius: 8
                }
            ]
        };

        window.growthChartInstance = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                family: 'Inter',
                                size: 13,
                                weight: '500'
                            },
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleFont: { family: 'Inter', size: 14 },
                        bodyFont: { family: 'Inter', size: 13 },
                        padding: 12,
                        cornerRadius: 8,
                        displayColors: true,
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: getGridColor(),
                            drawBorder: false
                        },
                        ticks: {
                            color: getTextColor(),
                            font: { family: 'Inter' }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: getTextColor(),
                            font: { family: 'Inter' }
                        }
                    }
                }
            }
        });
    }

    function getGridColor() {
        return document.documentElement.getAttribute('data-theme') === 'dark'
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(0, 0, 0, 0.05)';
    }

    function getTextColor() {
        return getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim();
    }

    function updateChartTheme(theme) {
        const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
        const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim();

        window.growthChartInstance.options.scales.y.grid.color = gridColor;
        window.growthChartInstance.options.scales.y.ticks.color = textColor;
        window.growthChartInstance.options.scales.x.ticks.color = textColor;
        window.growthChartInstance.options.plugins.legend.labels.color = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim();

        window.growthChartInstance.update();
    }


    // 4. Modal Dialog Accessibility Logic
    const openModalBtn = document.getElementById('open-modal-btn');
    const modalOverlay = document.getElementById('demo-modal');
    const closeBtns = document.querySelectorAll('.close-modal-btn');
    let lastFocusedElement;

    function openModal() {
        lastFocusedElement = document.activeElement;
        modalOverlay.hidden = false;

        // Trap focus inside modal
        const focusableElements = modalOverlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length) {
            focusableElements[0].focus();
        }
    }

    function closeModal() {
        modalOverlay.hidden = true;
        if (lastFocusedElement) {
            lastFocusedElement.focus();
        }
    }

    if (openModalBtn && modalOverlay) {
        openModalBtn.addEventListener('click', openModal);

        closeBtns.forEach(btn => {
            btn.addEventListener('click', closeModal);
        });

        // Close on Escape or clicking outside
        modalOverlay.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();

            // Basic focus trap functionality for WCAG
            if (e.key === 'Tab') {
                const focusableEls = modalOverlay.querySelectorAll('button:not([disabled]), [tabindex]:not([tabindex="-1"])');
                const firstEl = focusableEls[0];
                const lastEl = focusableEls[focusableEls.length - 1];

                if (e.shiftKey && document.activeElement === firstEl) {
                    lastEl.focus();
                    e.preventDefault();
                } else if (!e.shiftKey && document.activeElement === lastEl) {
                    firstEl.focus();
                    e.preventDefault();
                }
            }
        });

        modalOverlay.addEventListener('mousedown', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }

    // 5. Drag & Drop Upload Visuals & Keyboard
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-upload');

    if (dropZone && fileInput) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
        });

        dropZone.addEventListener('click', () => fileInput.click());

        // Keyboard Support for Upload
        dropZone.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInput.click();
            }
        });
    }

    // 6. Interactive Tabs Logic (WCAG Compliant)
    const tabList = document.querySelector('[role="tablist"]');
    const tabs = document.querySelectorAll('[role="tab"]');
    const tabPanels = document.querySelectorAll('[role="tabpanel"]');

    if (tabList && tabs.length > 0) {
        tabs.forEach((tab, index) => {
            tab.addEventListener('click', (e) => {
                activateTab(tab);
            });

            // Keyboard navigation
            tab.addEventListener('keydown', (e) => {
                let newIndex = index;
                if (e.key === 'ArrowRight') {
                    newIndex = (index + 1) % tabs.length;
                } else if (e.key === 'ArrowLeft') {
                    newIndex = (index - 1 + tabs.length) % tabs.length;
                } else if (e.key === 'Home') {
                    newIndex = 0;
                } else if (e.key === 'End') {
                    newIndex = tabs.length - 1;
                }

                if (newIndex !== index) {
                    e.preventDefault();
                    tabs[newIndex].focus();
                    activateTab(tabs[newIndex]);
                }
            });
        });

        function activateTab(selectedTab) {
            tabs.forEach(tab => {
                tab.setAttribute('aria-selected', 'false');
                tab.setAttribute('tabindex', '-1');
                tab.classList.remove('active');
            });
            tabPanels.forEach(panel => {
                panel.hidden = true;
            });

            selectedTab.setAttribute('aria-selected', 'true');
            selectedTab.removeAttribute('tabindex');
            selectedTab.classList.add('active');

            const targetPanel = document.getElementById(selectedTab.getAttribute('aria-controls'));
            if (targetPanel) {
                targetPanel.hidden = false;
            }
        }
    }

    // 7. Toast Notification System
    const toastContainer = document.getElementById('toast-container');
    const showToastBtn = document.getElementById('show-toast-btn');

    function showToast(message, type = 'success') {
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');

        // Dynamic styling or icon based on type can be added here
        const iconClass = type === 'success' ? 'ph-check-circle' : 'ph-info';

        toast.innerHTML = `
            <i class="ph ${iconClass} toast-icon" aria-hidden="true"></i>
            <div class="toast-content">
                <div class="toast-title">${type === 'success' ? 'Berhasil' : 'Notifikasi'}</div>
                <div class="toast-desc">${message}</div>
            </div>
            <button class="toast-close" aria-label="Tutup notifikasi">
                <i class="ph ph-x" aria-hidden="true"></i>
            </button>
        `;

        // Append to container
        toastContainer.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.classList.add('toast-show');
        });

        // Close button logic
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            closeToast(toast);
        });

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toastContainer.contains(toast)) {
                closeToast(toast);
            }
        }, 5000);
    }

    function closeToast(toastElement) {
        toastElement.classList.remove('toast-show');
        toastElement.addEventListener('transitionend', () => {
            if (toastElement.parentNode) {
                toastElement.remove();
            }
        });
    }

    if (showToastBtn) {
        showToastBtn.addEventListener('click', () => {
            showToast('Pengaturan video berhasil disimpan ke server.', 'success');
        });
    }

});
