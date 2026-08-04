document.addEventListener('DOMContentLoaded', () => {
    initPageLoader();
    initActiveNav();
    initProfileEntry();
    initProfilePage();
    initDashboardPage();
    initSelectedInstitute();

    const providerButtons = Array.from(document.querySelectorAll('[data-provider]'));
    const emailForm = document.querySelector('[data-email-form]');
    const message = document.querySelector('[data-message]');
    const roleForm = document.querySelector('[data-role-form]');
    const roleSelect = document.querySelector('[data-role-select]');
    const finalRoleForm = document.querySelector('[data-final-role-form]');
    const finalRoleSelect = document.querySelector('[data-final-role-select]');
    const agreementPanel = document.querySelector('[data-agreement-panel]');
    const alumniFields = document.querySelector('[data-alumni-fields]');
    const staffFields = document.querySelector('[data-staff-fields]');
    const yearSelects = Array.from(document.querySelectorAll('[data-year-select]'));
    const aboutStepForm = document.querySelector('[data-about-step-form]');

    function showMessage(text, tone = 'success') {
        if (message) {
            message.textContent = text;
            message.classList.toggle('is-success', tone === 'success');
            message.classList.toggle('is-error', tone === 'error');
        }
    }

    function goToRoleDetails(params = {}) {
        const route = new URL(pageHref('role-details.html'), window.location.href);

        Object.entries(params).forEach(([key, value]) => {
            if (value) {
                route.searchParams.set(key, value);
            }
        });

        window.location.href = route.href;
    }

    providerButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const provider = button.dataset.provider;

            sessionStorage.setItem('cuAuthProvider', provider);
            sessionStorage.setItem('cuProfileName', `${provider} User`);
            showMessage(`Continuing with ${provider}...`);
            window.setTimeout(() => goToRoleDetails({ provider }), 350);
        });
    });

    if (emailForm) {
        emailForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const email = new FormData(emailForm).get('email');

            sessionStorage.setItem('cuAuthEmail', email);
            sessionStorage.setItem('cuProfileName', getProfileName(email, null));
            showMessage(`Continuing with ${email}...`);
            window.setTimeout(() => goToRoleDetails({ email }), 350);
        });
    }

    if (roleForm) {
        function syncSelectState() {
            if (roleSelect) {
                roleSelect.classList.toggle('is-empty', !roleSelect.value);
            }
        }

        syncSelectState();
        roleSelect?.addEventListener('change', syncSelectState);

        roleForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const formData = new FormData(roleForm);
            const selectedInstitute = formData.get('instituteSelect')?.toString().trim();
            const typedInstitute = formData.get('institute')?.toString().trim();
            const institute = typedInstitute || selectedInstitute;

            if (!institute) {
                showMessage('Please add your institute to continue.', 'error');
                return;
            }

            sessionStorage.setItem('cuInstitute', institute);
            showMessage('Role details saved. Continuing...');
            window.setTimeout(() => {
                window.location.href = pageHref('role-access.html');
            }, 450);
        });
    }

    if (finalRoleForm) {
        populateYearSelects(yearSelects);

        function syncFinalSelectState() {
            if (finalRoleSelect) {
                finalRoleSelect.classList.toggle('is-empty', !finalRoleSelect.value);
            }

            alumniFields?.classList.toggle('is-visible', finalRoleSelect?.value === 'Alumni (Past Student)');
            staffFields?.classList.toggle('is-visible', finalRoleSelect?.value === 'Staff / Faculty');
            agreementPanel?.classList.toggle('has-role-details', finalRoleSelect?.value === 'Alumni (Past Student)' || finalRoleSelect?.value === 'Staff / Faculty');
        }

        syncFinalSelectState();
        finalRoleSelect?.addEventListener('change', syncFinalSelectState);

        finalRoleForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const formData = new FormData(finalRoleForm);
            const selectedRole = formData.get('role')?.toString().trim();
            const acceptedPrivacy = formData.get('privacyConsent');
            const acceptedConsent = formData.get('consentForm');
            const programName = formData.get('programName')?.toString().trim();
            const joiningYear = formData.get('joiningYear')?.toString().trim();
            const graduationYear = formData.get('graduationYear')?.toString().trim();
            const uid = formData.get('uid')?.toString().trim();
            const staffJoiningYear = formData.get('staffJoiningYear')?.toString().trim();
            const staffGraduationYear = formData.get('staffGraduationYear')?.toString().trim();

            if (!selectedRole) {
                showMessage('Please select your role to continue.', 'error');
                return;
            }

            if (selectedRole === 'Alumni (Past Student)' && (!programName || !joiningYear || !graduationYear || !uid)) {
                showMessage('Please complete your alumni details to continue.', 'error');
                return;
            }

            if (selectedRole === 'Staff / Faculty' && (!staffJoiningYear || !staffGraduationYear)) {
                showMessage('Please complete your staff details to continue.', 'error');
                return;
            }

            if (!acceptedPrivacy || !acceptedConsent) {
                showMessage('Please accept both confirmations to join.', 'error');
                return;
            }

            sessionStorage.setItem('cuRole', selectedRole);
            sessionStorage.setItem('cuProgramName', programName || '');
            sessionStorage.setItem('cuJoiningYear', joiningYear || staffJoiningYear || '');
            sessionStorage.setItem('cuGraduationYear', graduationYear || staffGraduationYear || '');
            sessionStorage.setItem('cuUid', uid || '');
            sessionStorage.setItem('cuJoinedNetwork', 'true');
            showMessage('Welcome to the alumni network.');
            window.setTimeout(() => {
                window.location.href = selectedRole === 'Alumni (Past Student)'
                    ? pageHref('about-step.html')
                    : pageHref('dashboard.html');
            }, 450);
        });
    }

    if (aboutStepForm) {
        aboutStepForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const currentStatus = new FormData(aboutStepForm).get('currentStatus')?.toString().trim();

            if (!currentStatus) {
                showMessage('Please select what you are doing currently.', 'error');
                return;
            }

            sessionStorage.setItem('cuCurrentStatus', currentStatus);
            showMessage('Saved. Continuing...');
            window.setTimeout(() => {
                window.location.href = pageHref('dashboard.html');
            }, 450);
        });
    }
});

function populateYearSelects(selects) {
    if (!selects.length) return;

    const currentYear = new Date().getFullYear();

    selects.forEach((select) => {
        if (select.options.length > 1) return;

        for (let year = currentYear; year >= 1990; year -= 1) {
            const option = document.createElement('option');
            option.value = String(year);
            option.textContent = String(year);
            select.append(option);
        }
    });
}

function initProfileEntry() {
    const entry = document.querySelector('[data-auth-entry]');
    if (!entry) return;

    const email = sessionStorage.getItem('cuAuthEmail');
    const provider = sessionStorage.getItem('cuAuthProvider');
    const profileName = sessionStorage.getItem('cuProfileName') || getProfileName(email, provider);

    if (!email && !provider) return;

    const initial = profileName.trim().charAt(0).toUpperCase() || 'U';
    entry.outerHTML = `
        <div class="profile-menu" data-profile-menu>
            <button class="profile-entry" type="button" data-profile-trigger aria-label="Open profile menu" aria-haspopup="true" aria-expanded="false">
                <span class="profile-avatar">${escapeHtml(initial)}</span>
            </button>
            <div class="profile-dropdown" data-profile-dropdown>
                <div class="profile-dropdown-head">
                    <span class="profile-avatar">${escapeHtml(initial)}</span>
                    <div>
                        <strong>${escapeHtml(profileName)}</strong>
                        <small>${escapeHtml(email || provider || 'Alumni Profile')}</small>
                    </div>
                </div>
                <a href="${pageHref('dashboard.html')}"><i class="ph-fill ph-house"></i> Dashboard</a>
                <a href="${pageHref('profile.html')}"><i class="ph-fill ph-user"></i> My Profile</a>
                <a href="${pageHref('role-details.html')}"><i class="ph-fill ph-bank"></i> Role Details</a>
                <button type="button" data-profile-logout><i class="ph-bold ph-sign-out"></i> Logout</button>
            </div>
        </div>
    `;

    const menu = document.querySelector('[data-profile-menu]');
    const trigger = menu?.querySelector('[data-profile-trigger]');

    trigger?.addEventListener('click', (event) => {
        event.stopPropagation();
        const isOpen = menu.classList.toggle('is-open');
        trigger.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('click', () => closeProfileMenu(menu, trigger));
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeProfileMenu(menu, trigger);
        }
    });

    menu?.querySelector('[data-profile-logout]')?.addEventListener('click', () => {
        clearProfileSession();
        window.location.href = rootHref('auth.html');
    });
}

function closeProfileMenu(menu, trigger) {
    menu?.classList.remove('is-open');
    trigger?.setAttribute('aria-expanded', 'false');
}

function initProfilePage() {
    const profilePage = document.querySelector('[data-profile-page]');
    if (!profilePage) return;

    const email = sessionStorage.getItem('cuAuthEmail');
    const provider = sessionStorage.getItem('cuAuthProvider');
    const institute = sessionStorage.getItem('cuInstitute');
    const role = sessionStorage.getItem('cuRole');
    const programName = sessionStorage.getItem('cuProgramName');
    const joiningYear = sessionStorage.getItem('cuJoiningYear');
    const graduationYear = sessionStorage.getItem('cuGraduationYear');
    const uid = sessionStorage.getItem('cuUid');
    const profileName = sessionStorage.getItem('cuProfileName') || getProfileName(email, provider);
    const displayRole = role === 'Alumni (Past Student)' ? 'Alumni' : role || 'Alumni';
    const displayInstitute = institute || 'UNIVERSITY INSTITUTE OF ENGINEERING (UIE)';
    const displayProgram = programName || 'Master of Engineering - Civil Engineering';
    const displayYears = joiningYear && graduationYear ? `${joiningYear} - ${graduationYear}` : '2018 - 2022';

    setText('[data-profile-name]', profileName);
    setText('[data-profile-email]', email || 'Not added');
    setText('[data-profile-provider]', provider || 'Email');
    setText('[data-profile-institute]', displayInstitute.toUpperCase());
    setText('[data-profile-institute-main]', displayInstitute.toUpperCase());
    setText('[data-profile-role]', displayRole);
    setText('[data-profile-program]', displayProgram);
    setText('[data-profile-program-main]', displayProgram);
    setText('[data-profile-class]', graduationYear || '2022');
    setText('[data-profile-uid]', uid || '16BAB');
    setText('[data-profile-years]', displayYears);
    setText('[data-profile-photo]', profileName.trim().charAt(0).toUpperCase() || 'U');
    initProfileModals();

    document.querySelector('[data-logout]')?.addEventListener('click', () => {
        clearProfileSession();
        window.location.href = rootHref('auth.html');
    });
}

function initDashboardPage() {
    const dashboardPage = document.querySelector('[data-dashboard-page]');
    if (!dashboardPage) return;

    const email = sessionStorage.getItem('cuAuthEmail');
    const provider = sessionStorage.getItem('cuAuthProvider');
    const institute = sessionStorage.getItem('cuInstitute');
    const programName = sessionStorage.getItem('cuProgramName');
    const graduationYear = sessionStorage.getItem('cuGraduationYear');
    const profileName = sessionStorage.getItem('cuProfileName') || getProfileName(email, provider);
    const displayInstitute = institute || 'UNIVERSITY INSTITUTE OF ENGINEERING (UIE)';
    const displayProgram = programName || 'Master of Engineering - Civil Engineering';
    const initial = profileName.trim().charAt(0).toUpperCase() || 'U';

    setText('[data-profile-name]', profileName);
    setText('[data-dashboard-name]', profileName);
    setText('[data-profile-institute]', displayInstitute.toUpperCase());
    setText('[data-profile-program]', displayProgram);
    setText('[data-profile-class]', graduationYear || '2022');
    setText('[data-profile-photo]', initial);
    setText('[data-dashboard-avatar]', initial);
    initDashboardModals(dashboardPage);
}

function initDashboardModals(dashboardPage) {
    const modal = document.querySelector('[data-dashboard-modal]');
    const form = document.querySelector('[data-dashboard-modal-form]');
    const title = document.querySelector('[data-dashboard-modal-title]');
    const fields = document.querySelector('[data-dashboard-modal-fields]');
    const message = document.querySelector('[data-dashboard-modal-message]');

    if (!modal || !form || !title || !fields) return;

    const triggers = Array.from(dashboardPage.querySelectorAll(`
        a[href="#"],
        .notification-btn,
        .dash-profile-head button,
        .composer-card > button,
        .post-tools button,
        .post-author button,
        .post-actions button
    `)).filter((trigger) => !trigger.closest('[data-dashboard-modal]'));

    if (!triggers.length) return;

    let activeConfig;

    function getTriggerLabel(trigger) {
        return trigger.dataset.dashboardModalOpen
            || trigger.getAttribute('aria-label')
            || trigger.textContent.replace(/\s+/g, ' ').trim()
            || 'Add Details';
    }

    function getConfig(label) {
        const key = label.toLowerCase();
        const baseTitle = label.replace(/^\+\s*/, '').trim();

        if (key.includes('photo') || key.includes('image')) {
            return {
                title: baseTitle,
                fields: [
                    ['caption', 'Caption', 'text', 'Write a caption'],
                    ['description', 'Description', 'textarea', 'Add photo details'],
                ],
            };
        }

        if (key.includes('video')) {
            return {
                title: 'Add Video',
                fields: [
                    ['videoTitle', 'Video Title', 'text', 'Video title'],
                    ['videoUrl', 'Video URL', 'url', 'https://'],
                ],
            };
        }

        if (key.includes('event') || key.includes('campaign')) {
            return {
                title: baseTitle,
                fields: [
                    ['eventTitle', 'Title', 'text', 'Event or campaign title'],
                    ['eventDate', 'Date', 'date', ''],
                    ['eventDetails', 'Details', 'textarea', 'Add details'],
                ],
            };
        }

        if (key.includes('job') || key.includes('internship') || key.includes('hiring')) {
            return {
                title: baseTitle,
                fields: [
                    ['jobTitle', 'Job Title', 'text', 'Role / position'],
                    ['company', 'Company', 'text', 'Company name'],
                    ['details', 'Details', 'textarea', 'Add job details'],
                ],
            };
        }

        if (key.includes('mentor') || key.includes('connect')) {
            return {
                title: baseTitle,
                fields: [
                    ['topic', 'Topic', 'text', 'What do you want guidance on?'],
                    ['message', 'Message', 'textarea', 'Write a short message'],
                ],
            };
        }

        if (key.includes('poll')) {
            return {
                title: 'Create Poll',
                fields: [
                    ['question', 'Question', 'text', 'Ask a question'],
                    ['options', 'Options', 'textarea', 'Add options, one per line'],
                ],
            };
        }

        if (key.includes('wish') || key.includes('birthday')) {
            return {
                title: baseTitle,
                fields: [
                    ['recipient', 'Recipient', 'text', 'Name'],
                    ['message', 'Message', 'textarea', 'Write your wish'],
                ],
            };
        }

        if (key.includes('fund')) {
            return {
                title: baseTitle,
                fields: [
                    ['cause', 'Cause', 'text', 'Fundraising cause'],
                    ['amount', 'Amount', 'number', 'Amount'],
                    ['details', 'Details', 'textarea', 'Tell people why this matters'],
                ],
            };
        }

        if (key.includes('privacy')) {
            return {
                title: 'Manage Privacy',
                fields: [
                    ['profileVisibility', 'Profile Visibility', 'select', 'Alumni only', ['Alumni only', 'Public', 'Private']],
                    ['contactVisibility', 'Contact Visibility', 'select', 'Connections only', ['Connections only', 'Alumni only', 'Private']],
                ],
            };
        }

        if (key.includes('notification')) {
            return {
                title: 'Notification Settings',
                fields: [
                    ['emailAlerts', 'Email Alerts', 'select', 'Enabled', ['Enabled', 'Disabled']],
                    ['eventAlerts', 'Event Alerts', 'select', 'Enabled', ['Enabled', 'Disabled']],
                ],
            };
        }

        if (key.includes('help') || key.includes('support')) {
            return {
                title: baseTitle,
                fields: [
                    ['subject', 'Subject', 'text', 'What do you need help with?'],
                    ['message', 'Message', 'textarea', 'Describe your issue'],
                ],
            };
        }

        if (key.includes('profile') || key.includes('edit')) {
            return {
                title: baseTitle,
                fields: [
                    ['name', 'Name', 'text', 'Your name'],
                    ['headline', 'Headline', 'text', 'Your headline'],
                    ['details', 'Details', 'textarea', 'Add profile details'],
                ],
            };
        }

        return {
            title: baseTitle,
            fields: [
                ['title', 'Title', 'text', baseTitle],
                ['details', 'Details', 'textarea', 'Add details'],
            ],
        };
    }

    function renderField([name, label, inputType, placeholder, options]) {
        if (inputType === 'textarea') {
            return `<label><span>${escapeHtml(label)}</span><textarea name="${escapeHtml(name)}" placeholder="${escapeHtml(placeholder)}" required></textarea></label>`;
        }

        if (inputType === 'select') {
            const optionMarkup = options.map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`).join('');
            return `<label><span>${escapeHtml(label)}</span><select name="${escapeHtml(name)}" required>${optionMarkup}</select></label>`;
        }

        return `<label><span>${escapeHtml(label)}</span><input type="${escapeHtml(inputType)}" name="${escapeHtml(name)}" placeholder="${escapeHtml(placeholder)}" required></label>`;
    }

    function openModal(label) {
        activeConfig = getConfig(label);
        title.textContent = activeConfig.title;
        fields.innerHTML = activeConfig.fields.map(renderField).join('');
        if (message) {
            message.textContent = '';
            message.classList.remove('is-success', 'is-error');
        }
        modal.hidden = false;
        modal.classList.add('is-open');
        fields.querySelector('input, textarea, select')?.focus();
    }

    function closeModal() {
        modal.hidden = true;
        modal.classList.remove('is-open');
        form.reset();
    }

    triggers.forEach((trigger) => {
        trigger.addEventListener('click', (event) => {
            event.preventDefault();
            openModal(getTriggerLabel(trigger));
        });
    });

    modal.querySelectorAll('[data-dashboard-modal-close]').forEach((button) => {
        button.addEventListener('click', closeModal);
    });

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !modal.hidden) {
            closeModal();
        }
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (message) {
            message.textContent = `${activeConfig?.title || 'Details'} saved successfully.`;
            message.classList.remove('is-error');
            message.classList.add('is-success');
        }
        window.setTimeout(closeModal, 650);
    });
}

function initSelectedInstitute() {
    const selectedInstitute = document.querySelector('[data-selected-institute]');
    if (!selectedInstitute) return;

    const institute = sessionStorage.getItem('cuInstitute');
    if (institute) {
        selectedInstitute.textContent = institute.toUpperCase();
    }
}

function initProfileModals() {
    const modal = document.querySelector('[data-profile-modal]');
    const form = document.querySelector('[data-profile-modal-form]');
    const title = document.querySelector('[data-profile-modal-title]');
    const fields = document.querySelector('[data-profile-modal-fields]');
    const message = document.querySelector('[data-profile-modal-message]');
    const triggers = Array.from(document.querySelectorAll('[data-profile-modal-open]'));

    if (!modal || !form || !title || !fields || !triggers.length) return;

    const modalConfigs = {
        photo: {
            title: 'Update Profile',
            fields: [['displayName', 'Display Name', 'text', 'Your name']],
            updates: {
                displayName: { selector: '[data-profile-name]', storageKey: 'cuProfileName' },
            },
            avatarField: 'displayName',
        },
        contact: {
            title: 'Edit Contact Information',
            fields: [
                ['phone', 'Phone Number', 'tel', '+91 98765 43210'],
                ['email', 'Email', 'email', 'name@example.com'],
            ],
            updates: {
                phone: { selector: '[data-profile-phone]' },
                email: { selector: '[data-profile-email]', storageKey: 'cuAuthEmail' },
            },
        },
        linkedin: {
            title: 'Add LinkedIn Profile URL',
            fields: [['linkedin', 'LinkedIn URL', 'url', 'https://www.linkedin.com/in/your-profile']],
            updates: {
                linkedin: { selector: '[data-profile-linkedin]', href: true },
            },
        },
        address: {
            title: 'Add Address',
            fields: [['address', 'Address', 'textarea', 'Enter your address']],
            updates: {
                address: { selector: '[data-profile-address]' },
            },
        },
        membership: {
            title: 'Become a Member',
            fields: [
                ['membershipType', 'Membership Type', 'select', 'Annual Membership', ['Annual Membership', 'Lifetime Membership']],
                ['membershipNote', 'Note', 'textarea', 'Any note for membership team'],
            ],
            updates: {
                membershipType: { selector: '[data-membership-copy]', prefix: 'Selected: ' },
            },
        },
        basic: {
            title: 'Edit Basic Information',
            fields: [
                ['birthDate', 'Date of Birth', 'date', ''],
                ['location', 'Location', 'text', 'City, State'],
            ],
            updates: {
                birthDate: { selector: '[data-profile-birth-date]' },
                location: { selector: '[data-profile-location]' },
            },
        },
        location: {
            title: 'Add Your Location',
            fields: [['location', 'Location', 'text', 'City, State']],
            updates: {
                location: { selector: '[data-profile-location]' },
            },
        },
        work: {
            title: 'Add Work Experience',
            output: 'work',
            multi: true,
            renderOutput: 'work',
            fields: [
                ['company', 'Company', 'text', 'Company name'],
                ['designation', 'Designation', 'text', 'Your role'],
                ['workPeriod', 'Period', 'text', '2023 - Present'],
                ['workDescription', 'Description', 'textarea', 'What did you work on? Add key responsibilities and achievements.'],
            ],
        },
        education: {
            title: 'Add Education',
            output: 'education',
            multi: true,
            fields: [
                ['school', 'Institute', 'text', 'Institute name'],
                ['degree', 'Degree', 'text', 'Degree / qualification'],
                ['educationPeriod', 'Period', 'text', '2018 - 2022'],
            ],
        },
        summary: {
            title: 'Add Summary',
            output: 'summary',
            fields: [['summary', 'Summary', 'textarea', 'Write a short profile summary']],
        },
        help: {
            title: 'Need Help?',
            fields: [
                ['subject', 'Subject', 'text', 'What do you need help with?'],
                ['message', 'Message', 'textarea', 'Describe your issue'],
            ],
        },
    };

    let activeConfig;

    function closeModal() {
        modal.hidden = true;
        modal.classList.remove('is-open');
        form.reset();
        if (message) {
            message.textContent = '';
            message.classList.remove('is-success', 'is-error');
        }
    }

    function openModal(type) {
        activeConfig = modalConfigs[type];
        if (!activeConfig) return;

        title.textContent = activeConfig.title;
        fields.innerHTML = activeConfig.fields.map(([name, label, inputType, placeholder, options]) => {
            if (inputType === 'textarea') {
                return `<label><span>${escapeHtml(label)}</span><textarea name="${escapeHtml(name)}" placeholder="${escapeHtml(placeholder)}" required></textarea></label>`;
            }

            if (inputType === 'select') {
                const optionMarkup = options.map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`).join('');
                return `<label><span>${escapeHtml(label)}</span><select name="${escapeHtml(name)}" required>${optionMarkup}</select></label>`;
            }

            return `<label><span>${escapeHtml(label)}</span><input type="${escapeHtml(inputType)}" name="${escapeHtml(name)}" placeholder="${escapeHtml(placeholder)}" required></label>`;
        }).join('');

        modal.hidden = false;
        modal.classList.add('is-open');
        fields.querySelector('input, textarea, select')?.focus();
    }

    triggers.forEach((trigger) => {
        trigger.addEventListener('click', (event) => {
            event.preventDefault();
            openModal(trigger.dataset.profileModalOpen);
        });
    });

    modal.querySelectorAll('[data-profile-modal-close]').forEach((button) => {
        button.addEventListener('click', closeModal);
    });

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !modal.hidden) {
            closeModal();
        }
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const entries = {};

        formData.forEach((value, key) => {
            entries[key] = value.toString().trim();
        });

        const values = Object.values(entries).filter(Boolean);

        if (!values.length) {
            if (message) {
                message.textContent = 'Please add details before saving.';
                message.classList.add('is-error');
            }
            return;
        }

        if (activeConfig?.output) {
            const output = document.querySelector(`[data-profile-output="${activeConfig.output}"]`);
            if (output) {
                const itemMarkup = activeConfig.renderOutput === 'work'
                    ? `
                        <strong>${escapeHtml(entries.company || values[0])}</strong>
                        <span>${escapeHtml([entries.designation, entries.workPeriod].filter(Boolean).join(' • '))}</span>
                        <p>${escapeHtml(entries.workDescription || '')}</p>
                    `
                    : `
                        <strong>${escapeHtml(values[0])}</strong>
                        <span>${escapeHtml(values.slice(1).join(' • ') || activeConfig.title)}</span>
                    `;

                if (activeConfig.multi) {
                    if (!output.classList.contains('profile-saved-list')) {
                        output.innerHTML = '';
                    }

                    output.className = 'profile-saved-list';

                    const item = document.createElement('div');
                    item.className = 'profile-saved-item';
                    item.innerHTML = itemMarkup;
                    output.append(item);
                } else {
                    output.className = 'profile-saved-item';
                    output.innerHTML = itemMarkup;
                }
            }
        }

        if (activeConfig?.updates) {
            Object.entries(activeConfig.updates).forEach(([fieldName, rule]) => {
                const value = entries[fieldName];
                if (!value) return;

                document.querySelectorAll(rule.selector).forEach((element) => {
                    element.textContent = `${rule.prefix || ''}${value}`;

                    if (rule.href) {
                        element.setAttribute('href', value);
                        element.setAttribute('target', '_blank');
                        element.setAttribute('rel', 'noopener noreferrer');
                    }
                });

                if (rule.storageKey) {
                    sessionStorage.setItem(rule.storageKey, value);
                }
            });
        }

        if (activeConfig?.avatarField) {
            const avatarValue = entries[activeConfig.avatarField];
            if (avatarValue) {
                setText('[data-profile-photo]', avatarValue.charAt(0).toUpperCase());
            }
        }

        if (message) {
            message.textContent = 'Saved successfully.';
            message.classList.remove('is-error');
            message.classList.add('is-success');
        }

        window.setTimeout(closeModal, 550);
    });
}

function clearProfileSession() {
    sessionStorage.removeItem('cuAuthEmail');
    sessionStorage.removeItem('cuAuthProvider');
    sessionStorage.removeItem('cuProfileName');
    sessionStorage.removeItem('cuInstitute');
    sessionStorage.removeItem('cuRole');
    sessionStorage.removeItem('cuProgramName');
    sessionStorage.removeItem('cuJoiningYear');
    sessionStorage.removeItem('cuGraduationYear');
    sessionStorage.removeItem('cuUid');
    sessionStorage.removeItem('cuJoinedNetwork');
    sessionStorage.removeItem('cuCurrentStatus');
}

function pageHref(file) {
    return isPagesRoute() ? file : `pages/${file}`;
}

function rootHref(file) {
    return isPagesRoute() ? `../${file}` : file;
}

function isPagesRoute() {
    return window.location.pathname.includes('/pages/');
}

function setText(selector, value) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
        element.textContent = value;
    });
}

function getProfileName(email, provider) {
    if (email) {
        const name = email.split('@')[0].replace(/[._-]+/g, ' ').trim();
        return name ? name.replace(/\b\w/g, (letter) => letter.toUpperCase()) : 'My Profile';
    }

    return provider ? `${provider} User` : 'My Profile';
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    }[character]));
}

function initActiveNav() {
    const navLinks = Array.from(document.querySelectorAll('.main-nav .nav-link'));
    if (!navLinks.length) return;

    navLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            const href = link.getAttribute('href');

            if (!href || href === '#') {
                event.preventDefault();
            }

            navLinks.forEach((item) => item.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

function initPageLoader() {
    const loader = document.querySelector('[data-page-loader]');
    if (!loader) return;

    function hideLoader() {
        loader.classList.add('is-hidden');
        window.setTimeout(() => loader.remove(), 550);
    }

    if (document.readyState === 'complete') {
        window.setTimeout(hideLoader, 350);
    } else {
        window.addEventListener('load', () => window.setTimeout(hideLoader, 350), { once: true });
        window.setTimeout(hideLoader, 2500);
    }
}
