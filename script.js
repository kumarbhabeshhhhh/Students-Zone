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
  

  // Active navigation state
  const sections = $$("main section[id]");
  const navLinks = $$(".nav-link");
  if (sections.length && navLinks.length) {
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
});
})();

/* =========================
   LE-TECH RANK PREDICTOR
   Added as a self-contained feature; existing effects remain untouched.
========================= */
(() => {
  const data = Array.isArray(window.LETECH_CUTOFFS) ? window.LETECH_CUTOFFS : [];
  const rankTab = document.getElementById('rankModeTab');
  const cutoffTab = document.getElementById('cutoffModeTab');
  const rankMode = document.getElementById('rankMode');
  const cutoffMode = document.getElementById('cutoffMode');
  const studentRank = document.getElementById('studentRank');
  const rankBranch = document.getElementById('rankBranch');
  const rankCollege = document.getElementById('rankCollege');
  const cutoffCollege = document.getElementById('cutoffCollege');
  const cutoffBranch = document.getElementById('cutoffBranch');
  const results = document.getElementById('predictorResults');
  if (!rankTab || !cutoffTab || !results) return;

  const unique = key => [...new Set(data.map(item => item[key]).filter(Boolean))].sort((a,b) => a.localeCompare(b));
  const fill = (select, values, firstLabel) => {
    select.innerHTML = `<option value="">${firstLabel}</option>` + values.map(v => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join('');
  };
  const escapeHtml = value => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

  fill(rankBranch, unique('branch'), 'Any Branch');
  fill(rankCollege, unique('college'), 'Any College');
  fill(cutoffCollege, unique('college'), 'Select College');

  const updateCutoffBranches = () => {
    const college = cutoffCollege.value;
    const branches = unique('branch').filter(branch => !college || data.some(x => x.college === college && x.branch === branch));
    fill(cutoffBranch, branches, 'Select Branch');
  };
  cutoffCollege.addEventListener('change', updateCutoffBranches);

  const activate = mode => {
    const rank = mode === 'rank';
    rankTab.classList.toggle('is-active', rank);
    cutoffTab.classList.toggle('is-active', !rank);
    rankTab.setAttribute('aria-selected', String(rank));
    cutoffTab.setAttribute('aria-selected', String(!rank));
    rankMode.classList.toggle('is-hidden', !rank);
    cutoffMode.classList.toggle('is-hidden', rank);
    results.innerHTML = `<div class="predictor-empty"><span class="result-orbit"></span><strong>YOUR RESULT WILL APPEAR HERE</strong><span>Use the selected mode to explore the available historical data.</span></div>`;
  };
  rankTab.addEventListener('click', () => activate('rank'));
  cutoffTab.addEventListener('click', () => activate('cutoff'));

  const median = nums => {
    const a = [...nums].sort((x,y)=>x-y), m=Math.floor(a.length/2);
    return a.length % 2 ? a[m] : Math.round((a[m-1]+a[m])/2);
  };
  const weightedMean = rows => {
    const sorted = [...rows].sort((a,b)=>a.year-b.year);
    let total=0, weightTotal=0;
    sorted.forEach((r,i)=>{ const w=i+1; total += r.closing*w; weightTotal += w; });
    return Math.round(total/weightTotal);
  };
  const fmt = n => Number(n).toLocaleString('en-IN');

  const groupedHistory = rows => {
    const closing = rows.map(r=>r.closing);
    const opening = rows.map(r=>r.opening);
    return {
      opening: Math.min(...opening),
      closing: Math.max(...closing),
      central: Math.round((weightedMean(rows)*0.6)+(median(closing)*0.4)),
      low: Math.min(...closing),
      high: Math.max(...closing)
    };
  };

  const renderHistory = (college, branch) => {
    const rows = data.filter(r=>r.college===college && r.branch===branch).sort((a,b)=>b.year-a.year);
    if (!rows.length) {
      results.innerHTML = `<div class="predictor-error"><strong>No verified record is currently available for this exact college and branch.</strong><br>We will only show a result when matching cutoff data has been verified and added to the database.</div>`;
      return;
    }
    const h = groupedHistory(rows);
    results.innerHTML = `
      <div class="predictor-result-head"><div><div class="predictor-result-kicker">Historical LE-Tech General Rank</div><h3>${escapeHtml(college)} — ${escapeHtml(branch)}</h3></div><div class="predictor-result-count">${rows.length} verified year${rows.length>1?'s':''}</div></div>
      <div class="predictor-range">
        <div class="predictor-stat"><span>Historical range</span><strong>${fmt(h.low)} – ${fmt(h.high)}</strong></div>
        <div class="predictor-stat"><span>Central estimate</span><strong>${fmt(h.central)}</strong></div>
        <div class="predictor-stat"><span>Opening rank seen</span><strong>${fmt(h.opening)}</strong></div>
      </div>
      <div class="predictor-result-list" style="margin-top:18px">
        ${rows.map(r=>`<div class="predictor-result-card"><div><strong>${r.year}</strong><span>Official OJEE dataset</span></div><div><span>Opening</span><strong class="rank-value">${fmt(r.opening)}</strong></div><div><span>Closing</span><strong class="rank-value gold">${fmt(r.closing)}</strong></div><div><span>Source</span><strong class="rank-value">${escapeHtml(r.source)}</strong></div></div>`).join('')}
      </div>
      <div class="predictor-source">The central estimate uses a recent-year weighted mean combined with the historical median. It is a statistical summary, not an official cutoff prediction.</div>`;
  };

  document.getElementById('checkCutoff')?.addEventListener('click', () => {
    const college=cutoffCollege.value, branch=cutoffBranch.value;
    if (!college || !branch) { results.innerHTML='<div class="predictor-error">Please select both a college and a branch.</div>'; return; }
    renderHistory(college, branch);
  });

  document.getElementById('findColleges')?.addEventListener('click', () => {
    const rank=Number(studentRank.value), branch=rankBranch.value, college=rankCollege.value;
    if (!Number.isInteger(rank) || rank < 1) { results.innerHTML='<div class="predictor-error">Please enter a valid OJEE LE-Tech General Rank.</div>'; return; }
    const matches=data.filter(r=>(!branch || r.branch===branch) && (!college || r.college===college));
    const grouped=new Map();
    matches.forEach(r=>{ const key=`${r.college}|||${r.branch}`; if(!grouped.has(key)) grouped.set(key,[]); grouped.get(key).push(r); });
    const out=[...grouped.entries()].map(([key,rows])=>{
      const [c,b]=key.split('|||'), h=groupedHistory(rows), within=rank<=h.high;
      const distance=rank<=h.high ? h.high-rank : rank-h.high;
      return {c,b,h,within,distance};
    }).sort((a,b)=>Number(b.within)-Number(a.within)||a.distance-b.distance);
    if(!out.length){results.innerHTML='<div class="predictor-error">No verified historical records match the selected filters yet.</div>';return;}
    results.innerHTML=`<div class="predictor-result-head"><div><div class="predictor-result-kicker">Rank Search</div><h3>Historical matches for General Rank ${fmt(rank)}</h3></div><div class="predictor-result-count">${out.length} record${out.length>1?'s':''}</div></div><div class="predictor-result-list">${out.map(x=>`<div class="predictor-result-card"><div><strong>${escapeHtml(x.c)}</strong><span>${escapeHtml(x.b)}</span></div><div><span>Historical closing</span><strong class="rank-value gold">${fmt(x.h.high)}</strong></div><div><span>Historical range</span><strong class="rank-value">${fmt(x.h.low)} – ${fmt(x.h.high)}</strong></div><div><span>Coverage</span><strong class="rank-value">${x.within?'Within range':'Outside range'}</strong></div></div>`).join('')}</div><div class="predictor-source">“Within range” means the entered rank is numerically at or better than the highest verified historical closing rank in the available records. It is not an admission guarantee.</div>`;
  });
})();
