document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("matches-grid");
  const dateInput = document.getElementById("match-date");
  const prevBtn = document.getElementById("prev-day");
  const nextBtn = document.getElementById("next-day");
  const dayTitle = document.getElementById("day-title");
  const themeToggle = document.getElementById("theme-toggle");
  const menuIcon = document.getElementById("menu-icon");
  const navLinks = document.getElementById("nav-links");
  const modal = document.getElementById("modal");
  const modalClose = document.getElementById("modal-close");

  let matchesData = [];
  let newsData = [];
  let transfersData = [];

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const minDate = new Date(today);
  minDate.setDate(today.getDate() - 3);
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 3);
  
  dateInput.min = minDate.toISOString().split("T")[0];
  dateInput.max = maxDate.toISOString().split("T")[0];
  dateInput.value = todayStr;

  // تحميل البيانات
  fetch("data.json")
    .then(res => res.json())
    .then(data => {
      matchesData = data;
      showMatchesForDate(todayStr);
      updateButtons();
    })
    .catch(err => console.error("خطأ في تحميل المباريات:", err));

  fetch("news.json")
    .then(res => res.json())
    .then(data => {
      newsData = data;
      showNews();
    })
    .catch(err => console.error("خطأ في تحميل الأخبار:", err));

  fetch("transfers.json")
    .then(res => res.json())
    .then(data => {
      transfersData = data;
      showTransfers();
    })
    .catch(err => console.error("خطأ في تحميل الانتقالات:", err));

  // أحداث التاريخ
  dateInput.addEventListener("change", () => {
    showMatchesForDate(dateInput.value);
    updateButtons();
  });

  prevBtn.addEventListener("click", () => changeDay(-1));
  nextBtn.addEventListener("click", () => changeDay(1));

  function changeDay(step) {
    const current = new Date(dateInput.value);
    current.setDate(current.getDate() + step);
    const newDate = current.toISOString().split("T")[0];
    dateInput.value = newDate;
    showMatchesForDate(newDate);
    updateButtons();
  }

  function updateButtons() {
    prevBtn.disabled = dateInput.value <= dateInput.min;
    nextBtn.disabled = dateInput.value >= dateInput.max;
  }

  // عرض المباريات
  function showMatchesForDate(dateStr) {
    grid.innerHTML = "";
    const selectedDate = new Date(dateStr);
    dayTitle.textContent = getArabicDay(selectedDate);

    const sameDayMatches = matchesData.filter(
      m => new Date(m.time).toDateString() === selectedDate.toDateString()
    );

    if (sameDayMatches.length === 0) {
      grid.innerHTML = '<div class="no-matches">😔 لا توجد مباريات في هذا اليوم</div>';
      return;
    }

    sameDayMatches.forEach(match => {
      const matchTime = new Date(match.time);
      const status = getStatus(matchTime, match.scoreA, match.scoreB);

      const card = document.createElement("div");
      card.classList.add("match-card");
      card.innerHTML = `
        <div class="match-league">
          <img src="${match.leagueLogo}" alt="${match.leagueName}">
          <span>${match.leagueName}</span>
        </div>
        <div class="match-teams">
          <div class="team">
            <img src="${match.logoA}" alt="${match.teamA}">
            <span class="team-name">${match.teamA}</span>
          </div>
          <div class="match-info">
            <div class="match-score">${getScoreDisplay(matchTime, match.scoreA, match.scoreB)}</div>
            <span class="match-status ${status.class}">${status.text}</span>
          </div>
          <div class="team">
            <img src="${match.logoB}" alt="${match.teamB}">
            <span class="team-name">${match.teamB}</span>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  function getArabicDay(date) {
    const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    const months = ["يناير", "فبراير", "مارس", "أبريل", "ماي", "يونيو", "يوليوز", "غشت", "شتنبر", "أكتوبر", "نونبر", "دجنبر"];
    return `مباريات يوم ${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
  }

  function getStatus(time, scoreA, scoreB) {
    const now = new Date();
    
    if (scoreA !== null && scoreB !== null) {
      return { text: "انتهت", class: "" };
    }
    
    if (now < time) {
      return { text: "لم تبدأ", class: "" };
    }
    
    const end = new Date(time.getTime() + 1000 * 60 * 110);
    if (now >= time && now <= end) {
      return { text: "🔴 مباشر", class: "live" };
    }
    
    return { text: "انتهت", class: "" };
  }

  function getScoreDisplay(matchTime, scoreA, scoreB) {
    if (scoreA !== null && scoreB !== null) {
      return `${scoreA} - ${scoreB}`;
    }
    return matchTime.toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' });
  }

  // عرض الأخبار
  function showNews() {
    const container = document.getElementById("news-container");
    container.innerHTML = "";
    
    newsData.forEach(news => {
      const card = document.createElement("div");
      card.classList.add("news-card");
      card.innerHTML = `
        <img src="${news.image}" alt="${news.title}">
        <div class="news-card-content">
          <h4>${news.title}</h4>
        </div>
      `;
      card.addEventListener("click", () => {
        openModal(news.image, news.title, news.description || "");
      });
      container.appendChild(card);
    });
  }

  // عرض الانتقالات
  function showTransfers() {
    const container = document.getElementById("transfers-container");
    container.innerHTML = "";
    
    transfersData.forEach(transfer => {
      const card = document.createElement("div");
      card.classList.add("news-card");
      card.innerHTML = `
        <img src="${transfer.image}" alt="${transfer.title}">
        <div class="news-card-content">
          <h4>${transfer.title}</h4>
        </div>
      `;
      card.addEventListener("click", () => {
        openModal(transfer.image, transfer.title, transfer.description || "");
      });
      container.appendChild(card);
    });
  }

  // Modal
  function openModal(image, title, description) {
    document.getElementById("modal-image").src = image;
    document.getElementById("modal-title").textContent = title;
    document.getElementById("modal-description").textContent = description;
    modal.style.display = "block";
  }

  modalClose.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  // الوضع الليلي
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light");
    const icon = themeToggle.querySelector("i");
    if (document.body.classList.contains("light")) {
      icon.className = "fas fa-moon";
    } else {
      icon.className = "fas fa-sun";
    }
  });

  // قائمة الهاتف
  menuIcon.addEventListener("click", () => {
    navLinks.classList.toggle("show");
  });

  // إغلاق القائمة عند النقر خارجها
  document.addEventListener("click", (e) => {
    if (!menuIcon.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove("show");
    }
  });
});
