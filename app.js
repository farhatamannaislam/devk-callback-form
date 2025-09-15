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

  document.querySelectorAll('.btn-next').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentSection < sections.length - 1) {
        showSection(currentSection + 1);
      }
    });
  });

  document.querySelectorAll('.btn-prev').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentSection > 0) {
        showSection(currentSection - 1);
      }
    });
  });
});
