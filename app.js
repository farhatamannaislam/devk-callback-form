document.addEventListener('DOMContentLoaded', function () {
  const sections = document.querySelectorAll('.form-section');
  const progressSteps = document.querySelectorAll('.progress-step');
  let currentSection = 0;

  function showSection(index) {
    sections.forEach((s, i) => {
      s.classList.toggle('active', i === index);
    });
    progressSteps.forEach((step, i) => {
      step.classList.toggle('active', i <= index);
    });
    currentSection = index;
  }

  // Validation
  function validateSection(index) {
    let valid = true;
    const inputs = sections[index].querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      const error = document.getElementById(`${input.id}-error`);
      if (input.hasAttribute('required') && !input.value.trim()) {
        if (error) error.style.display = 'block';
        valid = false;
      } else {
        if (error) error.style.display = 'none';
      }
    });
    return valid;
  }

  // Next button
  document.querySelectorAll('.btn-next').forEach(btn => {
    btn.addEventListener('click', () => {
      if (validateSection(currentSection)) {
        if (currentSection < sections.length - 1) {
          showSection(currentSection + 1);
        }
      }
    });
  });

  // Prev button
  document.querySelectorAll('.btn-prev').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentSection > 0) {
        showSection(currentSection - 1);
      }
    });
  });

  // Customer check logic
  const isCustomerSelect = document.getElementById('isCustomer');
  const customerNumberGroup = document.getElementById('customerNumberGroup');
  isCustomerSelect.addEventListener('change', () => {
    if (isCustomerSelect.value === 'yes') {
      customerNumberGroup.style.display = 'block';
    } else {
      customerNumberGroup.style.display = 'none';
    }
  });
});
