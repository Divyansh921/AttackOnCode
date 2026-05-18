/* ========================================================================
   ATTACK ON CODE — Main JavaScript
   Shared logic across all pages
   ======================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ── Auto-active nav link based on filename ──
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.remove('active');
    const href = a.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
  document.querySelectorAll('.nav-mobile-menu a').forEach(a => {
    a.classList.remove('active');
    const href = a.getAttribute('href');
    if (href === currentPage) a.classList.add('active');
  });

  // ── Mobile Nav Toggle ──
  const toggle = document.getElementById('nav-mobile-toggle');
  const mobileMenu = document.getElementById('nav-mobile-menu');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      const icon = toggle.querySelector('i');
      icon.className = mobileMenu.classList.contains('open') ? 'ti ti-x' : 'ti ti-menu-2';
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        toggle.querySelector('i').className = 'ti ti-menu-2';
      });
    });
  }

  // ── Filter Pill Toggles ──
  document.querySelectorAll('.filter-bar').forEach(bar => {
    bar.querySelectorAll('.filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        if (bar.dataset.single === 'true') {
          bar.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        }
        pill.classList.toggle('active');
      });
    });
  });

  // ── Tab Switching ──
  document.querySelectorAll('.tabs').forEach(tabBar => {
    const tabs = tabBar.querySelectorAll('.tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const panels = document.querySelectorAll('[data-tab-panel]');
        panels.forEach(p => {
          p.style.display = p.dataset.tabPanel === tab.dataset.tab ? '' : 'none';
        });
      });
    });
  });

  // ── Search Filtering ──
  const searchInput = document.querySelector('.search-box input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const cards = document.querySelectorAll('.builder-card, .team-card, .project-card, .hackathon-card, .mission-card');
      cards.forEach(card => {
        card.style.display = card.textContent.toLowerCase().includes(query) ? '' : 'none';
      });
    });
  }

  // ── Scroll-based nav shadow ──
  const nav = document.querySelector('.nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.style.boxShadow = window.scrollY > 10 ? '0 1px 3px rgba(0,0,0,0.08)' : 'none';
    }, { passive: true });
  }

  // ── Countdown Timer ──
  document.querySelectorAll('[data-countdown]').forEach(el => {
    const deadline = new Date(el.dataset.countdown);
    function update() {
      const diff = deadline - new Date();
      if (diff <= 0) {
        el.innerHTML = '<span class="badge badge-red">Deadline Passed</span>';
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      el.innerHTML = `
        <div class="countdown-block"><div class="countdown-val">${d}</div><div class="countdown-label">Days</div></div>
        <div class="countdown-block"><div class="countdown-val">${h}</div><div class="countdown-label">Hours</div></div>
        <div class="countdown-block"><div class="countdown-val">${m}</div><div class="countdown-label">Mins</div></div>
        <div class="countdown-block"><div class="countdown-val">${s}</div><div class="countdown-label">Secs</div></div>
      `;
    }
    update();
    setInterval(update, 1000);
  });

  // ── Activity Feed Cycling ──
  const feed = document.getElementById('activity-feed');
  if (feed) {
    const activities = [
      { icon: 'ti-users-plus', text: '<strong>Aryan Sharma</strong> joined team <strong>QuantumForge</strong> as Frontend Developer', time: '2 min ago' },
      { icon: 'ti-rocket', text: 'Team <strong>NeuralPulse</strong> registered for <strong>HackCBS 7.0</strong>', time: '8 min ago' },
      { icon: 'ti-git-merge', text: '<strong>Rohan Mehta</strong> pushed 12 commits to <strong>CampusSync</strong>', time: '15 min ago' },
      { icon: 'ti-user-plus', text: '<strong>Priya Gupta</strong> set status to <strong style="color:var(--green);">Looking for Team</strong>', time: '23 min ago' },
      { icon: 'ti-trophy', text: '<strong>SIH 2026</strong> team formation deadline extended to Jun 15', time: '1 hr ago' },
      { icon: 'ti-check', text: 'Team <strong>CodeForge</strong> completed project <strong>StudyBuddy</strong>', time: '2 hr ago' },
      { icon: 'ti-star', text: '<strong>Neha Kapoor</strong> earned the <strong>Design Pioneer</strong> badge', time: '3 hr ago' },
      { icon: 'ti-message', text: '<strong>Vikram Thakur</strong> posted a question in <strong>#backend</strong>', time: '4 hr ago' },
    ];
    let actIndex = 0;
    setInterval(() => {
      const row = feed.querySelector('.activity-row');
      if (row) {
        row.style.opacity = '0';
        row.style.transform = 'translateY(-10px)';
        setTimeout(() => {
          row.remove();
          const act = activities[actIndex % activities.length];
          const newRow = document.createElement('div');
          newRow.className = 'activity-row';
          newRow.style.opacity = '0';
          newRow.style.transform = 'translateY(10px)';
          newRow.innerHTML = `
            <div class="activity-icon"><i class="ti ${act.icon}"></i></div>
            <div class="activity-text">${act.text}</div>
            <span class="activity-time">${act.time}</span>
          `;
          feed.appendChild(newRow);
          requestAnimationFrame(() => {
            newRow.style.transition = 'all 0.3s ease';
            newRow.style.opacity = '1';
            newRow.style.transform = 'translateY(0)';
          });
          actIndex++;
        }, 300);
      }
    }, 5000);
  }

  // ── Intersection Observer for fade-in ──
  const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -40px 0px' };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-in').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });

  // ── Modal System ──
  document.querySelectorAll('[data-modal]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const modal = document.getElementById(trigger.dataset.modal);
      if (modal) modal.classList.add('open');
    });
  });
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.modal-overlay').classList.remove('open');
    });
  });

  // ── Toast System ──
  window.showToast = function(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icons = { success: 'ti-check', error: 'ti-x', warning: 'ti-alert-triangle' };
    toast.innerHTML = `<i class="ti ${icons[type] || icons.success}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(16px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  // ── Chip Multi-select ──
  document.querySelectorAll('.chip-option').forEach(chip => {
    chip.addEventListener('click', () => chip.classList.toggle('selected'));
  });

  // ── OTP Input Auto-focus ──
  const otpInputs = document.querySelectorAll('.otp-input');
  if (otpInputs.length) {
    otpInputs.forEach((input, i) => {
      input.addEventListener('input', (e) => {
        if (e.target.value && i < otpInputs.length - 1) otpInputs[i + 1].focus();
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !e.target.value && i > 0) otpInputs[i - 1].focus();
      });
    });
  }

  // ── Invite / Apply button toast feedback ──
  document.querySelectorAll('.btn-invite, .btn-apply, .btn-start, .btn-register, .btn-rsvp').forEach(btn => {
    if (btn.classList.contains('disabled') || btn.classList.contains('ended')) return;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const text = btn.textContent.trim();
      if (text.includes('Invite')) showToast('Invitation sent successfully!', 'success');
      else if (text.includes('Apply')) showToast('Application submitted!', 'success');
      else if (text.includes('Start') || text.includes('Accept') || text.includes('Claim')) showToast('Mission accepted! Good luck.', 'success');
      else if (text.includes('Register')) showToast('Team registered successfully!', 'success');
      else if (text.includes('RSVP')) showToast('RSVP confirmed!', 'success');
      else showToast('Action completed!', 'success');
    });
  });
  });

  // ── Glass Interactive Cards (Spotlight Glow) ──
  document.querySelectorAll('.builder-card, .team-card, .hackathon-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // ── Staggered Reveal Observer ──
  const staggerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const items = entry.target.querySelectorAll('.stagger-item');
        items.forEach((item, index) => {
          setTimeout(() => {
            item.classList.add('is-visible');
          }, index * 100); // 100ms stagger
        });
        staggerObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.stagger-fade').forEach(container => {
    staggerObserver.observe(container);
  });

});
