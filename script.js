// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Boot sequence - show desktop after boot (6 seconds total now)
    setTimeout(() => {
        document.getElementById('desktop').style.display = 'block';
    }, 6000);

    // Clock
    function updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
        const dateString = now.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
        document.getElementById('current-time').textContent = `${dateString} ${timeString}`;
    }
    updateTime();
    setInterval(updateTime, 1000);

    // Theme Switcher
    const themeToggle = document.getElementById('theme-toggle');
    const themeMenu = document.getElementById('theme-menu');
    const themeOptions = document.querySelectorAll('.theme-option');
    
    // Load saved theme
    const savedTheme = localStorage.getItem('portfolioTheme') || 'parrot-green';
    document.body.setAttribute('data-theme', savedTheme);
    themeOptions.forEach(option => {
        if (option.getAttribute('data-theme') === savedTheme) {
            option.classList.add('active');
        }
    });
    
    // Set initial logo based on theme
    const logoText = document.querySelector('.parrot-logo text');
    if (logoText) {
        if (savedTheme === 'kali') {
            logoText.textContent = '🐉';
        } else if (savedTheme === 'parrot-purple') {
            logoText.textContent = '💜';
        } else {
            logoText.textContent = '🦜';
        }
    }

    themeToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        themeMenu.style.display = themeMenu.style.display === 'none' ? 'block' : 'none';
    });

    themeOptions.forEach(option => {
        option.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            document.body.setAttribute('data-theme', theme);
            localStorage.setItem('portfolioTheme', theme);
            
            // Update active state
            themeOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            // Change logo emoji based on theme
            const logoText = document.querySelector('.parrot-logo text');
            const centerLogoText = document.querySelector('.center-logo text');
            
            if (theme === 'kali') {
                if (logoText) logoText.textContent = '🐉';
                if (centerLogoText) centerLogoText.textContent = '🐉';
            } else if (theme === 'parrot-purple') {
                if (logoText) logoText.textContent = '💜';
                if (centerLogoText) centerLogoText.textContent = '💜';
            } else {
                if (logoText) logoText.textContent = '🦜';
                if (centerLogoText) centerLogoText.textContent = '🦜';
            }
            
            // Close menu
            themeMenu.style.display = 'none';
            
            // Visual feedback with smooth transition
            document.body.style.transition = 'all 0.5s ease';
            
            // Flash effect
            const flash = document.createElement('div');
            flash.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: var(--parrot-cyan);
                opacity: 0;
                pointer-events: none;
                z-index: 99999;
                transition: opacity 0.3s ease;
            `;
            document.body.appendChild(flash);
            setTimeout(() => flash.style.opacity = '0.3', 10);
            setTimeout(() => flash.style.opacity = '0', 100);
            setTimeout(() => flash.remove(), 400);
        });
    });

    // Close theme menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!themeToggle.contains(e.target) && !themeMenu.contains(e.target)) {
            themeMenu.style.display = 'none';
        }
    });

    // Window Management
    let activeWindow = null;
    let zIndexCounter = 100;
    const windows = {};

    // Initialize windows
    document.querySelectorAll('.window').forEach(win => {
        const id = win.id;
        windows[id] = {
            element: win,
            isMaximized: false,
            originalSize: {},
            originalPosition: {}
        };
    });

    // Icon clicks - open windows (updated for circular layout)
    document.querySelectorAll('.icon-item, .dock-item').forEach(icon => {
        icon.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event bubbling
            const windowId = this.getAttribute('data-window');
            if (windowId) {
                openWindow(windowId);
            }
        });
    });

    // Prevent center logo from opening anything
    document.querySelector('.center-logo')?.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    function openWindow(windowId) {
        const win = windows[windowId];
        if (!win) return;

        // Show window
        win.element.style.display = 'block';
        
        // Check if mobile
        const isMobile = window.innerWidth < 768;
        
        // Position window - always recalculate for desktop to ensure centering
        if (isMobile) {
            // Mobile positioning
            win.element.style.left = '2.5vw';
            win.element.style.top = '60px';
            win.element.style.width = '';
            win.element.style.height = '';
        } else {
            // Desktop positioning - properly centered
            const windowWidth = win.element.offsetWidth || (windowId === 'experience' ? 900 : 700);
            const windowHeight = win.element.offsetHeight || 500;
            
            // Calculate center position
            const centerX = (window.innerWidth - windowWidth) / 2;
            const centerY = (window.innerHeight - windowHeight) / 2;
            
            // Add small offset for stacking effect if multiple windows open
            const openWindows = Object.keys(windows).filter(id => 
                windows[id].element.style.display === 'block' && id !== windowId
            ).length;
            const offset = openWindows * 40;
            
            win.element.style.left = (centerX + offset) + 'px';
            win.element.style.top = Math.max(60, centerY + offset) + 'px';
            
            // Ensure window doesn't go off screen
            const maxLeft = window.innerWidth - windowWidth - 20;
            const maxTop = window.innerHeight - windowHeight - 20;
            
            if (parseInt(win.element.style.left) > maxLeft) {
                win.element.style.left = maxLeft + 'px';
            }
            if (parseInt(win.element.style.top) > maxTop) {
                win.element.style.top = maxTop + 'px';
            }
        }

        setActiveWindow(windowId);

        // Special handling for terminal
        if (windowId === 'terminal') {
            setTimeout(() => {
                document.getElementById('terminal-input')?.focus();
            }, 400);
        }
        
        // Trigger animation
        setTimeout(() => {
            win.element.style.opacity = '1';
            win.element.style.transform = 'scale(1) translateY(0)';
        }, 10);
    }

    function setActiveWindow(windowId) {
        // Remove active class from all windows
        document.querySelectorAll('.window').forEach(w => w.classList.remove('active'));
        
        // Set new active window
        const win = windows[windowId];
        if (win) {
            win.element.classList.add('active');
            win.element.style.zIndex = ++zIndexCounter;
            activeWindow = windowId;
        }
    }

    // Window controls
    document.querySelectorAll('.window-controls .close').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const win = this.closest('.window');
            win.style.display = 'none';
        });
    });

    document.querySelectorAll('.window-controls .minimize').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const win = this.closest('.window');
            win.style.display = 'none';
        });
    });

    document.querySelectorAll('.window-controls .maximize').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const win = this.closest('.window');
            const windowId = win.id;
            const winData = windows[windowId];

            if (!winData.isMaximized) {
                // Save original size and position
                winData.originalSize = {
                    width: win.style.width || win.offsetWidth + 'px',
                    height: win.style.height || win.offsetHeight + 'px'
                };
                winData.originalPosition = {
                    left: win.style.left,
                    top: win.style.top
                };

                // Maximize
                win.style.width = 'calc(100vw - 40px)';
                win.style.height = 'calc(100vh - 80px)';
                win.style.left = '20px';
                win.style.top = '50px';
                winData.isMaximized = true;
            } else {
                // Restore
                win.style.width = winData.originalSize.width;
                win.style.height = winData.originalSize.height;
                win.style.left = winData.originalPosition.left;
                win.style.top = winData.originalPosition.top;
                winData.isMaximized = false;
            }
        });
    });

    // Make windows draggable (desktop) and prevent on mobile
    document.querySelectorAll('.window').forEach(win => {
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let offsetX;
        let offsetY;

        const header = win.querySelector('.window-header');
        
        // Check if device is mobile
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

        if (!isMobile) {
            header.addEventListener('mousedown', function(e) {
                if (e.target.closest('.window-controls')) return;
                
                isDragging = true;
                setActiveWindow(win.id);
                
                // Get current position
                const rect = win.getBoundingClientRect();
                offsetX = e.clientX - rect.left;
                offsetY = e.clientY - rect.top;
                
                // Add dragging class for visual feedback
                win.style.cursor = 'move';
                header.style.cursor = 'move';
                
                e.preventDefault();
            });

            document.addEventListener('mousemove', function(e) {
                if (isDragging) {
                    e.preventDefault();
                    
                    // Calculate new position
                    currentX = e.clientX - offsetX;
                    currentY = e.clientY - offsetY;
                    
                    // Get window dimensions
                    const winWidth = win.offsetWidth;
                    const winHeight = win.offsetHeight;
                    
                    // Boundary checks - keep window on screen
                    const minX = 0;
                    const minY = 35; // Account for top bar
                    const maxX = window.innerWidth - winWidth;
                    const maxY = window.innerHeight - 100; // Leave space for dock
                    
                    // Constrain position
                    currentX = Math.max(minX, Math.min(currentX, maxX));
                    currentY = Math.max(minY, Math.min(currentY, maxY));
                    
                    // Update position
                    win.style.left = currentX + 'px';
                    win.style.top = currentY + 'px';
                }
            });

            document.addEventListener('mouseup', function() {
                if (isDragging) {
                    isDragging = false;
                    win.style.cursor = '';
                    header.style.cursor = 'move';
                }
            });
        }

        // Click to activate (both mobile and desktop)
        win.addEventListener('mousedown', function() {
            setActiveWindow(win.id);
        });
        
        win.addEventListener('touchstart', function() {
            setActiveWindow(win.id);
        });
    });

    // Terminal functionality
    const terminalInput = document.getElementById('terminal-input');
    const terminalOutput = document.getElementById('terminal-output');
    let commandHistory = [];
    let historyIndex = -1;

    const commands = {
        help: () => {
            return `
<span class="prompt-line">Available Commands:</span>
<span class="output-line">help        - Show this help message</span>
<span class="output-line">about       - Display about information</span>
<span class="output-line">skills      - List technical skills</span>
<span class="output-line">experience  - Show work experience</span>
<span class="output-line">certs       - List certifications</span>
<span class="output-line">tools       - Display security tools</span>
<span class="output-line">contact     - Show contact information</span>
<span class="output-line">projects    - View GitHub projects</span>
<span class="output-line">linkedin    - Open LinkedIn profile</span>
<span class="output-line">github      - Open GitHub profile</span>
<span class="output-line">clear       - Clear terminal</span>
<span class="output-line">whoami      - Display current user</span>
<span class="output-line">ls          - List available sections</span>
<span class="output-line">neofetch    - System information</span>
            `;
        },
        about: () => {
            openWindow('about');
            return '<span class="output-line">Opening About Me window...</span>';
        },
        skills: () => {
            openWindow('skills');
            return '<span class="output-line">Opening Skills window...</span>';
        },
        experience: () => {
            openWindow('experience');
            return '<span class="output-line">Opening Experience window...</span>';
        },
        certs: () => {
            openWindow('certs');
            return '<span class="output-line">Opening Certifications window...</span>';
        },
        tools: () => {
            openWindow('tools');
            return '<span class="output-line">Opening Arsenal window...</span>';
        },
        contact: () => {
            openWindow('contact');
            return '<span class="output-line">Opening Contact window...</span>';
        },
        projects: () => {
            openWindow('resources');
            return '<span class="output-line">Opening Resources window...</span>';
        },
        linkedin: () => {
            window.open('https://in.linkedin.com/in/bhartverma', '_blank');
            return '<span class="output-line">Opening LinkedIn profile...</span>';
        },
        github: () => {
            window.open('https://github.com/CyberBhart', '_blank');
            return '<span class="output-line">Opening GitHub profile...</span>';
        },
        clear: () => {
            terminalOutput.innerHTML = `
                <p class="prompt-line">Welcome to Bhart's Security Terminal</p>
                <p class="prompt-line">Type 'help' to see available commands</p>
                <p class="prompt-line">═══════════════════════════════════════</p>
            `;
            return '';
        },
        whoami: () => {
            return `
<span class="output-line">Bhart Verma</span>
<span class="output-line">Cybersecurity Specialist | Threat Hunter</span>
<span class="output-line">Location: Mohali, Punjab, India</span>
            `;
        },
        ls: () => {
            return `
<span class="output-line">drwxr-xr-x  About_Me.txt</span>
<span class="output-line">drwxr-xr-x  Skills.exe</span>
<span class="output-line">drwxr-xr-x  Experience.log</span>
<span class="output-line">drwxr-xr-x  Arsenal/</span>
<span class="output-line">drwxr-xr-x  Badges.txt</span>
<span class="output-line">drwxr-xr-x  Contact.sh</span>
<span class="output-line">drwxr-xr-x  Resources/</span>
            `;
        },
        neofetch: () => {
            return `
<span class="prompt-line">     ___          bhart@parrot-security</span>
<span class="prompt-line">    (.. |         ─────────────────────</span>
<span class="prompt-line">    (<> |         OS: Parrot Security 6.2</span>
<span class="prompt-line">   / __  \\        Uptime: ${Math.floor(Math.random() * 24)} hours</span>
<span class="prompt-line">  ( /  \\ /|       Shell: bash 5.2.15</span>
<span class="prompt-line"> _/\\ __)/_)       Resolution: 1920x1080</span>
<span class="prompt-line"> \\/-____\\/        Terminal: xterm-256color</span>
<span class="output-line"></span>
<span class="output-line">Specialization: Cybersecurity</span>
<span class="output-line">Certifications: 9+</span>
<span class="output-line">Experience: 15+ years</span>
            `;
        },
        hack: () => {
            return '<span class="output-line">Access Granted. Welcome, Elite Hacker! 🔓</span>';
        },
        sudo: () => {
            return '<span class="error-line">Nice try! But you already have root access 😉</span>';
        }
    };

    terminalInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const command = this.value.trim().toLowerCase();
            
            if (command) {
                // Add to history
                commandHistory.push(command);
                historyIndex = commandHistory.length;

                // Display command
                terminalOutput.innerHTML += `
                    <p class="prompt-line">bhart@parrot:~$ ${command}</p>
                `;

                // Execute command
                if (commands[command]) {
                    terminalOutput.innerHTML += commands[command]();
                } else if (command.startsWith('sudo ')) {
                    const actualCommand = command.substring(5);
                    if (commands[actualCommand]) {
                        terminalOutput.innerHTML += '<span class="output-line">[sudo] password for bhart: ********</span>';
                        terminalOutput.innerHTML += commands[actualCommand]();
                    } else {
                        terminalOutput.innerHTML += `<span class="error-line">Command not found: ${actualCommand}</span>`;
                    }
                } else {
                    terminalOutput.innerHTML += `<span class="error-line">Command not found: ${command}. Type 'help' for available commands.</span>`;
                }

                // Scroll to bottom
                const terminalContent = document.querySelector('#terminal .window-content');
                terminalContent.scrollTop = terminalContent.scrollHeight;
            }

            this.value = '';
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                this.value = commandHistory[historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                this.value = commandHistory[historyIndex];
            } else {
                historyIndex = commandHistory.length;
                this.value = '';
            }
        }
    });

    // Power button
    document.querySelector('.power-btn').addEventListener('click', function() {
        const confirmed = confirm('Are you sure you want to shut down?');
        if (confirmed) {
            document.body.innerHTML = `
                <div style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: #000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #06d6a0;
                    font-family: 'Fira Code', monospace;
                    flex-direction: column;
                    gap: 20px;
                ">
                    <h2>System Shutting Down...</h2>
                    <p>Thanks for visiting Bhart's Portfolio!</p>
                    <button onclick="location.reload()" style="
                        padding: 10px 20px;
                        background: #06d6a0;
                        color: #000;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-family: 'Fira Code', monospace;
                        font-weight: bold;
                    ">Reboot System</button>
                </div>
            `;
        }
    });

    // Easter egg - Konami code
    let konamiCode = [];
    const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    
    document.addEventListener('keydown', function(e) {
        konamiCode.push(e.key);
        konamiCode = konamiCode.slice(-10);
        
        if (konamiCode.join(',') === konamiSequence.join(',')) {
            alert('🎮 Konami Code Activated! You found the easter egg! 🎉');
            document.body.style.animation = 'pulse 0.5s ease-in-out 3';
        }
    });

    // Add typing effect to boot screen
    const bootText = document.querySelector('.boot-text .typing');
    if (bootText) {
        const text = bootText.textContent;
        bootText.textContent = '';
        let i = 0;
        
        function typeWriter() {
            if (i < text.length) {
                bootText.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            }
        }
        
        setTimeout(typeWriter, 500);
    }

    // Skill bars animation when window opens
    const skillsWindow = document.getElementById('skills');
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.target.style.display === 'block') {
                const skillBars = skillsWindow.querySelectorAll('.skill-fill');
                skillBars.forEach((bar, index) => {
                    setTimeout(() => {
                        bar.style.width = bar.style.width || '0%';
                    }, index * 100);
                });
            }
        });
    });

    observer.observe(skillsWindow, { attributes: true, attributeFilter: ['style'] });

    // ==================== KALI LINUX FUNCTIONALITY ====================
    
    // Kali Boot Animation Lines
    const kaliBootLines = [
        '[ [ OK ] Started User Login Management. OK ]',
        '[ [ OK ] Started Network Manager. OK ]',
        '[ [ OK ] Reached target Network is Online. OK ]',
        '[ [ OK ] Reached target System Time Synchronized. OK ]',
        '[ [ OK ] Started Modem Manager. OK ]',
        '[ [ OK ] Started Set console font and keymap. OK ]',
        '[ [ OK ] Reached target Basic System. OK ]',
        '[ [ OK ] Started Accounts Service. OK ]',
        '[ [ OK ] Started Daemon for power management. OK ]',
        '[ [ OK ] Started GNOME Display Manager. OK ]',
        '[ [ OK ] Started Daily apt download activities. OK ]',
        '[ [ OK ] Started Update cron activities. OK ]',
        '[ [ OK ] Started Daily apt upgrade and clean activities. OK ]',
        '[ [ OK ] Reached target Graphical Interface. OK ]',
        '[ [ OK ] Starting User Manager for UID 1000... OK ]',
        '[ [ OK ] Started Session c2 of user bhart. OK ]',
        '[ Kali GNU/Linux Rolling OK ]',
        '[ bhart login: OK ]',
        '[ Password: OK ]',
        '[ Login successful. Starting desktop environment... ]',
        '[ Loading Kali desktop... OK ]',
        '[ Initializing panel and icons... OK ]'
    ];

    function showKaliBootAnimation(callback) {
        const bootScreen = document.getElementById('kali-boot-screen');
        const bootLinesContainer = document.getElementById('kali-boot-lines');
        const bootTime = document.querySelector('.kali-boot-time');
        
        bootScreen.style.display = 'flex';
        bootLinesContainer.innerHTML = '';
        
        // Update time
        const now = new Date();
        bootTime.textContent = now.toTimeString().split(' ')[0];
        
        let lineIndex = 0;
        const lineInterval = setInterval(() => {
            if (lineIndex < kaliBootLines.length) {
                const p = document.createElement('p');
                p.textContent = kaliBootLines[lineIndex];
                p.style.margin = '2px 0';
                bootLinesContainer.appendChild(p);
                bootLinesContainer.scrollTop = bootLinesContainer.scrollHeight;
                lineIndex++;
            } else {
                clearInterval(lineInterval);
                setTimeout(() => {
                    bootScreen.style.display = 'none';
                    if (callback) callback();
                }, 500);
            }
        }, 150);
    }

    // OS Switching
    function switchOS(targetOS) {
        const currentOS = document.body.getAttribute('data-os');
        
        if (currentOS === targetOS) return;
        
        // Hide current OS desktop
        document.getElementById(`${currentOS}-desktop`).style.display = 'none';
        
        if (targetOS === 'kali') {
            // Show Kali boot animation, then Kali desktop
            showKaliBootAnimation(() => {
                document.body.setAttribute('data-os', 'kali');
                document.getElementById('kali-desktop').style.display = 'block';
                updateKaliTime();
            });
        } else if (targetOS === 'parrot') {
            // Directly switch to Parrot (no boot animation)
            document.body.setAttribute('data-os', 'parrot');
            document.getElementById('parrot-desktop').style.display = 'block';
        }
    }

    // Parrot OS Switcher (dropdown)
    setTimeout(() => {
        const osSwitcherDropdown = document.querySelector('.os-switcher-dropdown');
        const osDropdownMenu = document.querySelector('.os-dropdown-menu');
        const osCurrent = document.querySelector('.os-current');
        
        console.log('OS Switcher elements:', { osSwitcherDropdown, osDropdownMenu, osCurrent });
        
        if (osSwitcherDropdown && osDropdownMenu && osCurrent) {
            osCurrent.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('OS Switcher clicked');
                const isVisible = osDropdownMenu.style.display === 'block';
                osDropdownMenu.style.display = isVisible ? 'none' : 'block';
            });
            
            document.addEventListener('click', (e) => {
                if (!osSwitcherDropdown.contains(e.target)) {
                    osDropdownMenu.style.display = 'none';
                }
            });
            
            document.querySelectorAll('.os-menu-option').forEach(option => {
                option.addEventListener('click', () => {
                    const targetOS = option.getAttribute('data-switch');
                    console.log('Switching to:', targetOS);
                    switchOS(targetOS);
                    osDropdownMenu.style.display = 'none';
                });
            });
        } else {
            console.error('OS Switcher elements not found!');
        }
    }, 100);

    // Kali Dropdown Interactions
    const kaliAppsDropdown = document.querySelector('.kali-apps-dropdown');
    const kaliAppsBtn = document.querySelector('.kali-apps-btn');
    const kaliAppsMenu = document.querySelector('.kali-apps-menu');
    
    const kaliSwitchDropdown = document.querySelector('.kali-switch-dropdown');
    const kaliSwitchBtn = document.querySelector('.kali-switch-btn');
    const kaliSwitchMenu = document.querySelector('.kali-switch-menu');
    
    if (kaliAppsBtn && kaliAppsMenu) {
        kaliAppsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = kaliAppsMenu.style.display === 'block';
            // Close other menus
            if (kaliSwitchMenu) kaliSwitchMenu.style.display = 'none';
            kaliAppsMenu.style.display = isVisible ? 'none' : 'block';
        });
    }
    
    if (kaliSwitchBtn && kaliSwitchMenu) {
        kaliSwitchBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = kaliSwitchMenu.style.display === 'block';
            // Close other menus
            if (kaliAppsMenu) kaliAppsMenu.style.display = 'none';
            kaliSwitchMenu.style.display = isVisible ? 'none' : 'block';
        });
    }
    
    // Close Kali menus when clicking outside
    document.addEventListener('click', (e) => {
        if (kaliAppsMenu && !kaliAppsDropdown?.contains(e.target)) {
            kaliAppsMenu.style.display = 'none';
        }
        if (kaliSwitchMenu && !kaliSwitchDropdown?.contains(e.target)) {
            kaliSwitchMenu.style.display = 'none';
        }
    });
    
    // Kali Switch OS options
    document.querySelectorAll('.kali-switch-option').forEach(option => {
        option.addEventListener('click', () => {
            const targetOS = option.getAttribute('data-switch');
            switchOS(targetOS);
            if (kaliSwitchMenu) kaliSwitchMenu.style.display = 'none';
        });
    });

    // Kali Reboot (from Applications menu)
    document.querySelectorAll('.kali-menu-option[data-action="kali-reboot"]').forEach(item => {
        item.addEventListener('click', () => {
            if (confirm('Reboot system?')) {
                location.reload();
            }
        });
    });

    // Kali Time Update
    function updateKaliTime() {
        const kaliTime = document.getElementById('kali-time');
        if (kaliTime) {
            const now = new Date();
            kaliTime.textContent = now.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        }
    }
    
    // Kali Menu Items (placeholders for Phase 2)
    document.querySelectorAll('.kali-menu-option[data-action]').forEach(item => {
        item.addEventListener('click', () => {
            const action = item.getAttribute('data-action');
            if (action !== 'kali-reboot') {
                alert(`${action} will be implemented in Phase 2`);
            }
            // Close menus after clicking
            if (kaliAppsMenu) kaliAppsMenu.style.display = 'none';
        });
    });

    // Update Kali time every second
    setInterval(updateKaliTime, 1000);
    updateKaliTime();

    console.log('%c Welcome to Bhart Verma\'s Portfolio! ', 'background: #06d6a0; color: #000; font-size: 20px; font-weight: bold; padding: 10px;');
    console.log('%c Cybersecurity Specialist | Ethical Hacker | Threat Hunter ', 'background: #000; color: #06d6a0; font-size: 14px; padding: 5px;');
    console.log('%c Try opening the terminal and type "help" for commands! ', 'color: #06d6a0; font-size: 12px;');
    console.log('%c Switch to Kali Linux from the ParrotOS menu! ', 'color: #00ff00; font-size: 12px;');
});
