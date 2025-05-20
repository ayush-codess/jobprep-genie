document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('themeToggle');
  const toast = document.getElementById('toast');
  const jobSearch = document.getElementById('jobSearch');

  let jobList = JSON.parse(localStorage.getItem('jobList')) || [];

  // Apply saved theme
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
  }

  // Theme toggle with persistence
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    showToast('Theme toggled!');
  });

  // Toast notification helper
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }

  // Add a new job
  function addJob() {
    const jobTitle = document.getElementById('jobTitle').value.trim();
    const jobLink = document.getElementById('jobLink').value.trim();

    if (!jobTitle || !jobLink) {
      alert('Please enter both job title and link.');
      return;
    }

    // Prevent duplicates by title
    if (jobList.find(job => job.title.toLowerCase() === jobTitle.toLowerCase())) {
      alert('Job title already exists.');
      return;
    }

    const job = {
      title: jobTitle,
      link: jobLink,
      status: 'wishlist',
    };

    jobList.push(job);
    saveJobs();
    renderJobs();
    document.getElementById('jobTitle').value = '';
    document.getElementById('jobLink').value = '';
    showToast('Job added!');
  }

  // Save jobs to localStorage
  function saveJobs() {
    localStorage.setItem('jobList', JSON.stringify(jobList));
  }

  // Render jobs to columns with filter & update counts
  function renderJobs() {
    const columns = document.querySelectorAll('.column');
    const filterText = jobSearch.value.trim().toLowerCase();

    columns.forEach((column) => {
      const status = column.getAttribute('data-status');
      const cardContainer = column.querySelector('.card-container');
      cardContainer.innerHTML = '';

      // Filter jobs by status and search
      const filteredJobs = jobList.filter(job => {
        return job.status === status &&
          (!filterText || job.title.toLowerCase().includes(filterText));
      });

      filteredJobs.forEach((job) => {
        const jobCard = document.createElement('div');
        jobCard.classList.add('card');
        jobCard.setAttribute('draggable', true);
        jobCard.innerHTML = `<a href="${job.link}" target="_blank" rel="noopener noreferrer">${job.title}</a>`;
        jobCard.addEventListener('dragstart', (e) => onDragStart(e, job));
        cardContainer.appendChild(jobCard);
      });

      // Update badge counts
      const countBadge = document.getElementById(`${status}Count`);
      const totalCount = jobList.filter(job => job.status === status).length;
      countBadge.textContent = totalCount;
    });
  }

  // Drag and drop handlers
  function onDragStart(e, job) {
    e.dataTransfer.setData('text/plain', JSON.stringify(job));
  }

  const columns = document.querySelectorAll('.column');
  columns.forEach((column) => {
    column.addEventListener('dragover', (e) => e.preventDefault());
    column.addEventListener('drop', (e) => {
      e.preventDefault();
      const jobData = JSON.parse(e.dataTransfer.getData('text/plain'));
      const newStatus = column.getAttribute('data-status');
      jobData.status = newStatus;

      // Update the job in jobList
      const index = jobList.findIndex(job => job.title === jobData.title);
      if (index > -1) {
        jobList[index] = jobData;
        saveJobs();
        renderJobs();
        showToast(`Moved to "${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}"`);
      }
    });
  });

  // Resume optimizer functions
  function optimizeResume() {
    const jobDescription = document.getElementById('jobDescription').value.trim();
    const resumeText = document.getElementById('resumeText').value.trim();

    if (!jobDescription || !resumeText) {
      alert('Please enter both job description and resume text.');
      return;
    }

    const keywords = extractKeywords(jobDescription);
    if (keywords.length === 0) {
      alert('Job description has no valid keywords to match.');
      return;
    }

    const resumeScore = calculateResumeScore(resumeText, keywords);
    displayScore(resumeScore);
    showToast('Resume optimized!');
  }

  function extractKeywords(text) {
    // Remove punctuation, split by spaces, filter words > 3 letters, lowercase
    return text
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .map(word => word.toLowerCase());
  }

  function calculateResumeScore(resumeText, keywords) {
    const words = resumeText
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
      .split(/\s+/)
      .map(word => word.toLowerCase());

    const matched = keywords.filter(keyword => words.includes(keyword));
    return (matched.length / keywords.length) * 100;
  }

  function displayScore(score) {
    const scoreElement = document.getElementById('score');
    const progressBar = document.getElementById('progressBar');
    const rounded = Math.min(Math.round(score), 100);
    scoreElement.textContent = `${rounded}%`;
    progressBar.style.width = `${rounded}%`;

    if (rounded >= 80) {
      progressBar.style.background = 'linear-gradient(270deg, #4caf50, #81c784, #4caf50)';
    } else if (rounded >= 50) {
      progressBar.style.background = 'linear-gradient(270deg, #ffc107, #ffca28, #ffc107)';
    } else {
      progressBar.style.background = 'linear-gradient(270deg, #f44336, #ef5350, #f44336)';
    }
  }

  // Reset resume optimizer inputs and score
  document.getElementById('resetOptimizer').addEventListener('click', () => {
    document.getElementById('jobDescription').value = '';
    document.getElementById('resumeText').value = '';
    document.getElementById('score').textContent = '0%';
    document.getElementById('progressBar').style.width = '0';
    showToast('Resume optimizer reset!');
  });

  // Job search input event
  jobSearch.addEventListener('input', renderJobs);

  // Expose functions globally for buttons in HTML
  window.addJob = addJob;
  window.optimizeResume = optimizeResume;

  // Initial render
  renderJobs();
});
