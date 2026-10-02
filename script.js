(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  // Premium, short loading sequence.
  const loader = $("#loader");
  const loaderBar = $("#loaderBar");
  const loaderPercent = $("#loaderPercent");
  let progress = 0;

  const loaderTimer = setInterval(() => {
    progress = Math.min(progress + Math.floor(Math.random() * 12) + 5, 100);
    loaderBar.style.width = `${progress}%`;
    loaderPercent.textContent = `${progress}%`;
    if (progress >= 100) {
      clearInterval(loaderTimer);
      setTimeout(() => loader.classList.add("is-hidden"), 180);
    }
  }, 55);

  // Header state and scroll progress.
  const header = $("#siteHeader");
  const progressBar = $("#scrollProgress");

  const updateScrollUI = () => {
    const scrollTop = window.scrollY;
    header.classList.toggle("scrolled", scrollTop > 18);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = `${max > 0 ? (scrollTop / max) * 100 : 0}%`;
  };
  window.addEventListener("scroll", updateScrollUI, { passive: true });
  updateScrollUI();

  // Accessible mobile navigation.
  const menuToggle = $("#menuToggle");
  const mobileMenu = $("#mobileMenu");

  const closeMenu = () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    mobileMenu.classList.remove("is-open");
    mobileMenu.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-open");
  };

  const openMenu = () => {
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Close menu");
    mobileMenu.classList.add("is-open");
    mobileMenu.setAttribute("aria-hidden", "false");
    document.body.classList.add("menu-open");
  };

  menuToggle.addEventListener("click", () => {
    menuToggle.getAttribute("aria-expanded") === "true" ? closeMenu() : openMenu();
  });

  $$("#mobileMenu a").forEach(link => link.addEventListener("click", closeMenu));

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) closeMenu();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeMenu();
  });

  // Scroll reveal using IntersectionObserver.
  const revealItems = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("is-visible"));
  }

  // Lightweight particles: fixed count, CSS-driven movement.
  const particleHost = $("#particles");
  const particleCount = window.matchMedia("(max-width: 600px)").matches ? 18 : 30;
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("span");
    particle.className = "particle";
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.setProperty("--dx", `${(Math.random() - 0.5) * 55}px`);
    particle.style.setProperty("--duration", `${4 + Math.random() * 5}s`);
    particle.style.animationDelay = `${Math.random() * -6}s`;
    particleHost.appendChild(particle);
  }

  // Desktop pointer glow and subtle parallax. Disabled on coarse pointers.
  const pointerGlow = $("#pointerGlow");
  const parallaxItems = $$("[data-parallax]");
  const finePointer = window.matchMedia("(pointer:fine)").matches;

  if (finePointer) {
    let targetX = 50, targetY = 50, currentX = 50, currentY = 50;
    let ticking = false;

    window.addEventListener("pointermove", event => {
      targetX = (event.clientX / window.innerWidth) * 100;
      targetY = (event.clientY / window.innerHeight) * 100;
      if (!ticking) {
        requestAnimationFrame(() => {
          currentX += (targetX - currentX) * 0.12;
          currentY += (targetY - currentY) * 0.12;
          pointerGlow.style.left = `${currentX}%`;
          pointerGlow.style.top = `${currentY}%`;

          parallaxItems.forEach(item => {
            const strength = Number(item.dataset.parallax || 0);
            const x = (targetX - 50) * strength;
            const y = (targetY - 50) * strength;
            item.style.transform = `translate3d(${x}%, ${y}%, 0)`;
          });
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  } else {
    pointerGlow.remove();
  }


  // Mobile-safe motion: gently shift the hero layers with page scroll.
  // This does not require hover or a mouse and is disabled for reduced motion.
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hero = $(".hero");
  const mobileMotionItems = $$(".hero .orb, .hero .ring, .hero .hero-grid");
  if (!reducedMotion && hero && mobileMotionItems.length) {
    let mobileScrollTick = false;
    const updateMobileMotion = () => {
      if (window.innerWidth <= 900) {
        const rect = hero.getBoundingClientRect();
        const progress = Math.max(-0.2, Math.min(1.2, -rect.top / Math.max(hero.offsetHeight, 1)));
        mobileMotionItems.forEach((item, index) => {
          const depth = [0.025, 0.04, 0.012, 0.018, 0.028, 0.01][index] || 0.02;
          item.style.setProperty("--scroll-shift", `${progress * depth * 100}%`);
        });
      }
      mobileScrollTick = false;
    };
    window.addEventListener("scroll", () => {
      if (!mobileScrollTick) {
        requestAnimationFrame(updateMobileMotion);
        mobileScrollTick = true;
      }
    }, { passive: true });
    updateMobileMotion();
  }

  // Button/contact ripple. Works for mouse and touch.
  $$(".ripple").forEach(element => {
    element.addEventListener("pointerdown", event => {
      const rect = element.getBoundingClientRect();
      const dot = document.createElement("span");
      dot.className = "ripple-dot";
      const size = Math.max(rect.width, rect.height) * 0.32;
      dot.style.width = `${size}px`;
      dot.style.height = `${size}px`;
      dot.style.left = `${event.clientX - rect.left - size / 2}px`;
      dot.style.top = `${event.clientY - rect.top - size / 2}px`;
      element.appendChild(dot);
      dot.addEventListener("animationend", () => dot.remove(), { once: true });
    }, { passive: true });
  });

  // Prevent accidental stale loading state if the browser restores a page.
  window.addEventListener("pageshow", () => {
    if (loader && loader.classList.contains("is-hidden") === false && document.readyState === "complete") {
      setTimeout(() => loader.classList.add("is-hidden"), 250);
    }
  });

  // Active navigation state.
  const sections = $$("main section[id]");
  const navLinks = $$(".desktop-nav a, .mobile-menu a");
  if (sections.length && navLinks.length && "IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`));
      });
    }, {rootMargin:"-35% 0px -55% 0px"});
    sections.forEach(s => navObserver.observe(s));
  }

  // Magnetic buttons on mouse/trackpad; mobile remains touch-first.
  if (window.matchMedia("(pointer:fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    $$(".btn-primary,.btn-ghost").forEach(btn => {
      btn.addEventListener("pointermove", e => {
        const r=btn.getBoundingClientRect(), x=(e.clientX-r.left-r.width/2)*.1, y=(e.clientY-r.top-r.height/2)*.1;
        btn.style.transform=`translate(${x}px,${y}px)`;
      });
      btn.addEventListener("pointerleave",()=>btn.style.transform="");
    });
  }


  // LE-Tech rank predictor — data is limited to verified 2024 HS/General/Gender Neutral records.
  const cutoffData = [
    // BPUT Rourkela
    ['BPUT, Rourkela','Civil Engineering',2024,461,1613],
    ['BPUT, Rourkela','Computer Science and Engineering',2024,505,667],
    ['BPUT, Rourkela','Electrical Engineering',2024,1,307],
    ['BPUT, Rourkela','Electronics & Communication Engineering',2024,1198,3003],
    ['BPUT, Rourkela','Mechanical Engineering',2024,323,799],
    // GCE Kalahandi
    ['GCE Kalahandi, Bhawanipatna','Civil Engineering',2024,544,9483],
    ['GCE Kalahandi, Bhawanipatna','Computer Science and Engineering',2024,638,2302],
    ['GCE Kalahandi, Bhawanipatna','Electrical Engineering',2024,763,3282],
    ['GCE Kalahandi, Bhawanipatna','Mechanical Engineering',2024,67,23854],
    // GCE Keonjhar
    ['GCE Keonjhar','Civil Engineering',2024,844,5116],
    ['GCE Keonjhar','Computer Science and Engineering',2024,1129,1800],
    ['GCE Keonjhar','Electrical Engineering',2024,567,1268],
    ['GCE Keonjhar','Mechanical Engineering',2024,834,1735],
    ['GCE Keonjhar','Metallurgical and Materials Engineering',2024,853,5429],
    ['GCE Keonjhar','Mineral Engineering',2024,348,21484],
    ['GCE Keonjhar','Mining Engineering',2024,41,409],
    // IGIT Sarang
    ['IGIT, Sarang','Chemical Engineering',2024,1411,15838],
    ['IGIT, Sarang','Civil Engineering',2024,93,1488],
    ['IGIT, Sarang','Computer Science and Engineering (SSC)',2024,239,1189],
    ['IGIT, Sarang','Electrical Engineering',2024,297,694],
    ['IGIT, Sarang','Electronics & Telecommunication Engineering (SSC)',2024,1745,3872],
    ['IGIT, Sarang','Mechanical Engineering',2024,321,788],
    ['IGIT, Sarang','Metallurgical and Materials Engineering',2024,464,4521],
    ['IGIT, Sarang','Production Engineering',2024,8118,15994],
    // OUTR Bhubaneswar
    ['OUTR, Bhubaneswar','Bio Technology (SSC)',2024,1226,7735],
    ['OUTR, Bhubaneswar','Civil Engineering',2024,10,392],
    ['OUTR, Bhubaneswar','Computer Science and Engineering (SSC)',2024,16,196],
    ['OUTR, Bhubaneswar','CSE with AI & ML (SSC)',2024,26,385],
    ['OUTR, Bhubaneswar','Electrical Engineering',2024,3,276],
    ['OUTR, Bhubaneswar','Electronics & Communication Engineering',2024,60,1524],
    ['OUTR, Bhubaneswar','Information Technology (SSC)',2024,218,666],
    ['OUTR, Bhubaneswar','Instrumentation and Electronics Engineering',2024,532,2137],
    ['OUTR, Bhubaneswar','Mechanical Engineering (AI & Robotics)',2024,566,2449],
    ['OUTR, Bhubaneswar','Mechanical Engineering',2024,70,538],
    ['OUTR, Bhubaneswar','Textile Engineering',2024,127,22479],
    // PMEC Berhampur
    ['PMEC, Berhampur','Automobile Engineering',2024,755,20503],
    ['PMEC, Berhampur','Chemical Engineering',2024,3827,17946],
    ['PMEC, Berhampur','Civil Engineering',2024,391,7143],
    ['PMEC, Berhampur','Computer Science and Engineering',2024,225,1282],
    ['PMEC, Berhampur','Electrical Engineering',2024,285,966],
    ['PMEC, Berhampur','Electronics & Telecommunication Engineering',2024,1589,3052],
    ['PMEC, Berhampur','Mechanical Engineering',2024,419,11050],
    ['PMEC, Berhampur','Metallurgical and Materials Engineering',2024,173,21638],
    // SUIIT Burla
    ['SUIIT, Sambalpur','Computer Science and Engineering (SSC)',2024,1245,8558],
    ['SUIIT, Sambalpur','CSE AIML (SSC)',2024,3285,12094],
    ['SUIIT, Sambalpur','CSE ICS (SSC)',2024,160,21690],
    ['SUIIT, Sambalpur','Electrical and Electronics Engineering (SSC)',2024,16,22486],
    ['SUIIT, Sambalpur','Electronics & Communication Engineering (SSC)',2024,272,24081],
    // VSSUT Burla
    ['VSSUT, Burla','Chemical Engineering',2024,81,1124],
    ['VSSUT, Burla','Civil Engineering',2024,27,299],
    ['VSSUT, Burla','Civil Engineering (SSC)',2024,555,772],
    ['VSSUT, Burla','Computer Science and Engineering',2024,17,37],
    ['VSSUT, Burla','Computer Science and Engineering (SSC)',2024,216,401],
    ['VSSUT, Burla','Electrical and Electronics Engineering',2024,108,247],
    ['VSSUT, Burla','Electrical and Electronics Engineering (SSC)',2024,952,1136],
    ['VSSUT, Burla','Electrical Engineering',2024,5,189],
    ['VSSUT, Burla','Electronics & Telecommunication Engineering',2024,104,711],
    ['VSSUT, Burla','Information Technology',2024,208,268],
    ['VSSUT, Burla','Information Technology (SSC)',2024,564,823],
    ['VSSUT, Burla','Mechanical Engineering',2024,15,355],
    ['VSSUT, Burla','Metallurgical and Materials Engineering',2024,138,1691],
    ['VSSUT, Burla','Production Engineering',2024,936,5801]
  ].map(([college, branch, year, opening, closing]) => ({college, branch, year, opening, closing}));

  const rankTab = $("#rankModeTab"), collegeTab = $("#collegeModeTab");
  const rankPanel = $("#rankModePanel"), collegePanel = $("#collegeModePanel");
  const rankCollege = $("#rankCollegeSelect"), rankBranch = $("#rankBranchSelect");
  const collegeSelect = $("#collegeSelect"), branchSelect = $("#branchSelect");
  const results = $("#predictorResults");

  const colleges = [...new Set(cutoffData.map(x => x.college))].sort();
  const branches = [...new Set(cutoffData.map(x => x.branch))].sort();
  const addOptions = (select, items, firstLabel) => {
    select.innerHTML = `<option value="">${firstLabel}</option>` + items.map(x => `<option value="${x.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;')}">${x}</option>`).join("");
  };
  addOptions(rankCollege, colleges, "Any College");
  addOptions(collegeSelect, colleges, "Select College");
  addOptions(rankBranch, branches, "Any Branch");

  const refreshRankBranches = () => {
    const c = rankCollege.value;
    const list = c ? [...new Set(cutoffData.filter(x=>x.college===c).map(x=>x.branch))].sort() : branches;
    addOptions(rankBranch, list, "Any Branch");
  };
  rankCollege.addEventListener('change', refreshRankBranches);
  const refreshCollegeBranches = () => {
    const c = collegeSelect.value;
    const list = c ? [...new Set(cutoffData.filter(x=>x.college===c).map(x=>x.branch))].sort() : [];
    addOptions(branchSelect, list, c ? "Select Branch" : "Select College First");
  };
  collegeSelect.addEventListener('change', refreshCollegeBranches);

  const switchMode = mode => {
    const rank = mode === 'rank';
    rankTab.classList.toggle('active', rank); collegeTab.classList.toggle('active', !rank);
    rankTab.setAttribute('aria-selected', String(rank)); collegeTab.setAttribute('aria-selected', String(!rank));
    rankPanel.classList.toggle('hidden', !rank); collegePanel.classList.toggle('hidden', rank);
  };
  rankTab.addEventListener('click', () => switchMode('rank'));
  collegeTab.addEventListener('click', () => switchMode('college'));

  const escapeHtml = v => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const renderMatches = (rank, rows) => {
    const sorted = rows.sort((a,b) => a.closing-b.closing).slice(0, 30);
    results.innerHTML = `<div class="predictor-result-head"><div><h3>Historical College &amp; Branch Matches</h3><p>General rank entered: <strong>${rank}</strong></p></div><div class="predictor-count">${sorted.length} matching records shown</div></div>
      <div class="predictor-table-wrap"><table class="predictor-table"><thead><tr><th>College</th><th>Branch</th><th>2024 Opening</th><th>2024 Closing</th><th>Historical position</th></tr></thead><tbody>
      ${sorted.map(x=>`<tr><td><strong>${escapeHtml(x.college)}</strong></td><td>${escapeHtml(x.branch)}</td><td>${x.opening}</td><td>${x.closing}</td><td><span class="predictor-match">Within closing rank</span></td></tr>`).join('')}</tbody></table></div>`;
  };
  const renderNoMatches = rank => {
    results.innerHTML = `<div class="predictor-error"><strong>No 2024 record matched the selected filters for General Rank ${rank}.</strong><br>Try another college/branch or a different rank. This only reflects the verified records currently loaded; it is not a statement about actual admission eligibility.</div>`;
  };
  $("#findCollegesBtn").addEventListener('click', () => {
    const rank = Number($("#rankInput").value);
    if (!Number.isInteger(rank) || rank < 1) { results.innerHTML = '<div class="predictor-error">Please enter a valid General Rank.</div>'; return; }
    const c = rankCollege.value, b = rankBranch.value;
    const rows = cutoffData.filter(x => (!c || x.college===c) && (!b || x.branch===b) && rank >= x.opening && rank <= x.closing);
    rows.length ? renderMatches(rank, rows) : renderNoMatches(rank);
  });

  const renderDetail = row => {
    results.innerHTML = `<div class="predictor-result-head"><div><h3>${escapeHtml(row.college)}</h3><p>${escapeHtml(row.branch)}</p></div><div class="predictor-count">Verified record: ${row.year}</div></div>
      <div class="predictor-detail"><div class="predictor-stat"><span>Opening Rank</span><strong>${row.opening}</strong></div><div class="predictor-stat"><span>Closing Rank</span><strong>${row.closing}</strong></div><div class="predictor-stat"><span>Historical Range</span><strong>${row.opening}–${row.closing}</strong></div><div class="predictor-stat"><span>Data Years</span><strong>1 verified</strong></div></div>
      <div class="predictor-history"><div class="predictor-history-row"><span>${row.year}</span><span>Opening rank: <strong>${row.opening}</strong></span><span>Closing rank: <strong>${row.closing}</strong></span></div></div>`;
  };
  $("#checkCutoffBtn").addEventListener('click', () => {
    const c = collegeSelect.value, b = branchSelect.value;
    if (!c || !b) { results.innerHTML = '<div class="predictor-error">Select both a college and a branch to check the historical cutoff.</div>'; return; }
    const row = cutoffData.find(x => x.college===c && x.branch===b);
    row ? renderDetail(row) : results.innerHTML = '<div class="predictor-error">No verified cutoff record is currently loaded for this combination.</div>';
  });


  // Premium interaction layer: smooth pointer glow, touch feedback and subtle card tilt.
  const root = document.documentElement;
  const finePointerPremium = window.matchMedia('(pointer:fine)').matches;
  if (finePointerPremium && !reducedMotion) {
    let glowFrame = 0;
    window.addEventListener('pointermove', e => {
      if (glowFrame) return;
      glowFrame = requestAnimationFrame(() => {
        root.style.setProperty('--mx', `${(e.clientX / window.innerWidth) * 100}%`);
        root.style.setProperty('--my', `${(e.clientY / window.innerHeight) * 100}%`);
        glowFrame = 0;
      });
    }, {passive:true});

    $$('.feature-card, .contact-card, .predictor-card').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        card.style.setProperty('--card-x', `${x * 2}deg`);
        card.style.setProperty('--card-y', `${y * -2}deg`);
        card.style.setProperty('--shine-x', `${(x + .5) * 100}%`);
        card.style.setProperty('--shine-y', `${(y + .5) * 100}%`);
      }, {passive:true});
      card.addEventListener('pointerleave', () => {
        card.style.removeProperty('--card-x'); card.style.removeProperty('--card-y');
      });
    });
  }

  // Touch press feedback without interfering with links or scrolling.
  $$('a, button, .feature-card, .contact-card').forEach(el => {
    el.addEventListener('touchstart', () => el.classList.add('touch-active'), {passive:true});
    el.addEventListener('touchend', () => setTimeout(() => el.classList.remove('touch-active'), 120), {passive:true});
    el.addEventListener('touchcancel', () => el.classList.remove('touch-active'), {passive:true});
  });

})();
