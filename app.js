document.addEventListener('DOMContentLoaded', function () {
    // ===== refs =====
    const sections = document.querySelectorAll('.form-section');
    const progressSteps = document.querySelectorAll('.progress-step');
    const form = document.getElementById('callback-form');
    const successMessage = document.getElementById('success-message');
    const summaryElement = document.getElementById('summary');

    const isCustomerSelect = document.getElementById('isCustomer');
    const customerNumberGroup = document.getElementById('customerNumberGroup');

    let currentSection = 0; // 0..3

    // pick API base by environment (GH Pages vs local)
    const PROD_URL = 'https://devk-callback-form.onrender.com';
    const LOCAL_URL = 'http://localhost:3000';

    const isGhPages = /github\.io$/.test(location.hostname);
    const API_BASE = isGhPages ? PROD_URL : LOCAL_URL;

    // ===== helpers =====
    function sectionToStep(sectionIdx) {
        // sections 0 and 1 belong to progress step 0
        if (sectionIdx <= 1) return 0;
        // section 2 -> step 1, section 3 -> step 2
        return sectionIdx - 1;
    }

    function showSection(index) {
        // show only the requested section
        sections.forEach((s, i) => s.classList.toggle('active', i === index));

        // highlight only the mapped progress step
        const stepIdx = sectionToStep(index);
        progressSteps.forEach((step, i) =>
            step.classList.toggle('active', i === stepIdx)
        );

        currentSection = index;
    }



    // Basic validators
    const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    const isPLZ = (v) => /^\d{5}$/.test(v);

    function validateSection(index) {
        let valid = true;

        if (index === 0) {
            // Section 1: Kunde?
            const cust = isCustomerSelect.value;
            const custErr = document.getElementById('isCustomer-error');
            custErr.style.display = cust ? 'none' : 'block';
            valid = !!cust && valid;

            if (cust === 'yes') {
                const cn = document.getElementById('customerNumber').value.trim();
                const cnErr = document.getElementById('customerNumber-error');
                cnErr.style.display = cn ? 'none' : 'block';
                valid = !!cn && valid;
            }
        }

        if (index === 1) {
            // Section 2: Personen-Daten (nur wenn Nicht-Kunde)
            if (isCustomerSelect.value === 'yes') return true; // skip
            const first = document.getElementById('firstName').value.trim();
            const last = document.getElementById('lastName').value.trim();
            const zip = document.getElementById('zipCode').value.trim();
            const city = document.getElementById('city').value.trim();

            document.getElementById('firstName-error').style.display = first ? 'none' : 'block';
            document.getElementById('lastName-error').style.display = last ? 'none' : 'block';
            document.getElementById('zipCode-error').style.display = isPLZ(zip) ? 'none' : 'block';
            document.getElementById('city-error').style.display = city ? 'none' : 'block';

            valid = first && last && isPLZ(zip) && city && valid;
        }

        if (index === 2) {
            // Section 3: Kontakt & Interessen
            const email = document.getElementById('email').value.trim();
            const time = document.getElementById('contactTime').value;
            const inter = document.getElementById('insuranceInterests');
            const chosen = Array.from(inter.selectedOptions).map(o => o.value);
            const privacy = document.getElementById('privacy').checked;

            document.getElementById('email-error').style.display = isEmail(email) ? 'none' : 'block';
            document.getElementById('contactTime-error').style.display = time ? 'none' : 'block';
            document.getElementById('insuranceInterests-error').style.display = chosen.length ? 'none' : 'block';
            document.getElementById('privacy-error').style.display = privacy ? 'none' : 'block';

            valid = isEmail(email) && !!time && chosen.length > 0 && privacy && valid;
        }

        return !!valid;
    }

    function updateSummary() {
        const get = (id) => document.getElementById(id)?.value || '';
        const isCust = isCustomerSelect.value;
        const interestsText = Array.from(document.getElementById('insuranceInterests').selectedOptions)
            .map(o => o.text).join(', ');

        summaryElement.innerHTML = `
      <ul>
        <li><strong>Kunde:</strong> ${isCust === 'yes' ? 'Ja' : 'Nein'}</li>
        ${isCust === 'yes'
                ? `<li><strong>Kundennummer:</strong> ${get('customerNumber')}</li>`
                : `
            <li><strong>Vorname:</strong> ${get('firstName')}</li>
            <li><strong>Nachname:</strong> ${get('lastName')}</li>
            <li><strong>PLZ:</strong> ${get('zipCode')}</li>
            <li><strong>Wohnort:</strong> ${get('city')}</li>
            <li><strong>Beruf:</strong> ${get('profession')}</li>
            <li><strong>Arbeitgeber:</strong> ${get('employer')}</li>
          `}
        <li><strong>E-Mail:</strong> ${get('email')}</li>
        <li><strong>Kontaktzeit:</strong> ${document.getElementById('contactTime').selectedOptions[0]?.text || ''}</li>
        <li><strong>Interessiert an:</strong> ${interestsText}</li>
        <li><strong>Kommentar:</strong> ${get('comments')}</li>
      </ul>
    `;
    }

    // ===== events =====
    // next
    document.querySelectorAll('.btn-next').forEach((btn) => {
        btn.addEventListener('click', () => {
            if (!validateSection(currentSection)) return;

            // custom flow after section 1
            if (currentSection === 0 && isCustomerSelect.value === 'yes') {
                showSection(2); // skip personal data → go to section 3
                return;
            }

            // before entering section 4, build summary
            if (currentSection === 2) updateSummary();

            if (currentSection < sections.length - 1) showSection(currentSection + 1);
        });
    });

    // prev
    document.querySelectorAll('.btn-prev').forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentSection === 2 && isCustomerSelect.value === 'yes') {
                // coming back from section 3 when customer=yes → go back to section 1
                showSection(0);
                return;
            }
            if (currentSection > 0) showSection(currentSection - 1);
        });
    });

    // customer toggle
    isCustomerSelect.addEventListener('change', () => {
        customerNumberGroup.style.display = (isCustomerSelect.value === 'yes') ? 'block' : 'none';
    });

    // ===== submit → POST to backend =====
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // ensure last required section valid
        if (!validateSection(2)) {
            showSection(2);
            return;
        }

        const submitBtn = form.querySelector('.btn-submit');
        if (submitBtn) submitBtn.disabled = true;

        const payload = {
            isCustomer: document.getElementById('isCustomer').value,
            customerNumber: document.getElementById('customerNumber').value,
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            zipCode: document.getElementById('zipCode').value,
            city: document.getElementById('city').value,
            profession: document.getElementById('profession').value,
            employer: document.getElementById('employer').value,
            email: document.getElementById('email').value,
            contactTime: document.getElementById('contactTime').value,
            insuranceInterests: Array.from(document.getElementById('insuranceInterests').selectedOptions).map(o => o.value),
            comments: document.getElementById('comments').value,
            privacy: document.getElementById('privacy').checked
        };

        try {
            const res = await fetch(`${API_BASE}/api/callback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await res.json();

            if (result.success) {
                form.style.display = 'none';
                successMessage.style.display = 'block';

                // Keep success visible for 5s, then reload (adjust as needed)
                setTimeout(() => {
                    window.location.reload();
                }, 5000);
            } else {
                alert('Fehler: ' + (result.error || 'Bitte Eingaben prüfen.'));
            }
        } catch (err) {
            console.error(err);
            alert('Serverfehler – Backend erreichbar unter ' + API_BASE + ' ?');
        } finally {
            if (submitBtn) submitBtn.disabled = false;
        }
    });

    // init
    showSection(0);
});
