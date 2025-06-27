// script.js — versi sudah diperbaiki
document.addEventListener('DOMContentLoaded', () => {
  const navbar           = document.querySelector('.navbar');
  const authMenu         = document.getElementById('authMenu');
  const profileMenu      = document.getElementById('profileMenu');
  const navbarUsername   = document.getElementById('navbarUsername');
  const greeting         = document.getElementById('greeting');
  const signupForm       = document.getElementById('signupForm');
  const loginForm        = document.getElementById('loginForm');
  const logoutBtn        = document.getElementById('logoutBtn');
  const viewJobsBtns     = document.querySelectorAll('.view-jobs-btn');
  const profileText      = document.getElementById('profileTextLink');
  const profileIcon      = document.getElementById('profileIcon');
  const applyButtons     = document.querySelectorAll('.apply-btn');
  const lihatLowonganNav = document.getElementById('lihatLowongan');
  const lihatLowonganFoot= document.getElementById('footerLowongan');

  /* ───────────────────────── Navbar shrink ───────────────────────── */
  window.addEventListener('scroll', () => {
    if (navbar) navbar.classList.toggle('shrink', window.scrollY > 50);
  });

   /* =====================================================================
     Quick-Apply Modal Logic
     ===================================================================== */
  const applyModal = document.getElementById('applyModal');
  if (applyModal) {
    /* Prefill input posisi setiap kali modal dibuka */
    applyModal.addEventListener('show.bs.modal', (event) => {
      const btn = event.relatedTarget;                         // tombol Lamar yg diklik
      const pos = btn?.getAttribute('data-posisi') || '';
      document.getElementById('posisiInput').value = pos;
    });

    /* Validasi & “submit” form */
    document.getElementById('applyForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const cv  = e.target.cv.files[0];
      const fol = e.target.portfolio.files[0];
      if (cv  && cv.size  > 2 * 1024 * 1024) return alert('CV melebihi 2 MB');
      if (fol && fol.size > 5 * 1024 * 1024) return alert('Portofolio melebihi 5 MB');

      // Simulasi kirim → tutup modal → tampilkan modal sukses
      setTimeout(() => {
        bootstrap.Modal.getInstance(applyModal).hide();
        new bootstrap.Modal('#successModal').show();
        e.target.reset();
      }, 500);
    });
  }

  /* ───────────────────────── Auth state ───────────────────────── */
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('loggedInUser')) || null;
  } catch {
    localStorage.removeItem('loggedInUser');
  }

  if (user) {
    authMenu?.classList.add('d-none');
    profileMenu?.classList.remove('d-none');
    profileText?.classList.add('d-none');
    profileIcon?.classList.remove('d-none');
    navbarUsername && (navbarUsername.textContent = user.username || 'Profil');
  } else {
    authMenu?.classList.remove('d-none');
    profileMenu?.classList.add('d-none');
    profileText?.classList.remove('d-none');
    profileIcon?.classList.add('d-none');
  }

  /* ───────────────────────── Greeting ───────────────────────── */
  const registeredName = localStorage.getItem('registeredName');
  if (greeting && !user && registeredName) {
    greeting.textContent = `Selamat datang, ${registeredName}!`;
    localStorage.removeItem('registeredName');
  }

  /* ───────────────────────── SIGN-UP ───────────────────────── */
  signupForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const fullName        = document.getElementById('fullName')?.value.trim();
    const email           = document.getElementById('email')?.value.trim();
    const password        = document.getElementById('signupPassword')?.value;
    const confirmPassword = document.getElementById('confirmPassword')?.value;

    if (!fullName || !email || !password || !confirmPassword) {
      return alert('Mohon isi semua kolom!');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))             return alert('Format email tidak valid!');
    if (password !== confirmPassword)        return alert('Password dan konfirmasi tidak cocok!');

    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return alert('Email sudah terdaftar.');
    }

    const newUser = { username: fullName, email, password: hashPassword(password) };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('loggedInUser', JSON.stringify(newUser));
    localStorage.setItem('registeredName', fullName);
    window.location.href = 'index.html?registered=true';
  });

  /* ───────────────────────── LOGIN ───────────────────────── */
  loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username')?.value.trim();
    const password = document.getElementById('loginPassword')?.value.trim();
    if (!username || !password) return alert('Harap isi semua kolom.');

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const found = users.find(u =>
      (u.username === username || u.email === username) &&
      u.password === hashPassword(password)
    );

    if (found) {
      localStorage.setItem('loggedInUser', JSON.stringify(found));
      window.location.href = 'index.html';
    } else {
      alert('Email/username atau password salah.');
    }
  });

  /* ───────────────────────── Logout ───────────────────────── */
  logoutBtn?.addEventListener('click', () => {
    localStorage.removeItem('loggedInUser');
    window.location.href = 'index.html';
  });

  /* ───────────────────────── Lihat Lowongan ───────────────────────── */
 const handleLihatLowongan = (e) => {
  e.preventDefault();
  const logged = JSON.parse(localStorage.getItem('loggedInUser'));
  if (logged) {
    window.location.href = 'find-job.html';
  } else {
    const loginModalEl = document.getElementById('loginModal');
    if (loginModalEl) {
      const loginModal = new bootstrap.Modal(loginModalEl);
      loginModal.show();
    }
  }
};

// Pasang event listener ke tombol navbar dan footer
lihatLowonganNav?.addEventListener('click', handleLihatLowongan);
lihatLowonganFoot?.addEventListener('click', handleLihatLowongan);

  /* ───────────────────────── Profil display/edit ───────────────────────── */
  const updateProfileDisplay = (cur) => {
    const g = (id) => document.getElementById(id);
    g('profileUsername')      && (g('profileUsername').textContent   = cur.username      || '-');
    g('profileEmail')         && (g('profileEmail').textContent      = cur.email         || '-');
    g('profilePhone')         && (g('profilePhone').textContent      = cur.phone         || '-');
    g('profileDOB')           && (g('profileDOB').textContent        = cur.DOB           || '-');
    g('profileLocation')      && (g('profileLocation').textContent   = cur.location      || '-');
    g('profileEducation')     && (g('profileEducation').textContent  = cur.education     || '-');
    g('profileSummary')       && (g('profileSummary').textContent    = cur.summary       || '-');
    g('experienceText')       && (g('experienceText').textContent    = cur.experience    || '-');
    g('educationDetail')      && (g('educationDetail').textContent   = cur.educationDetail || '-');
    g('achievementText')      && (g('achievementText').textContent   = cur.achievement   || '-');
    g('certificateText')      && (g('certificateText').textContent   = cur.certificate   || '-');
    fillTags('softwareTags',  cur.software);
    fillTags('languageTags',  cur.languages);
    fillTags('interestTags',  cur.interests);
  };

  const fillTags = (id, txt) => {
    const c = document.getElementById(id); if (!c) return;
    c.innerHTML = '';
    const items = (txt || '').split(',').map(t => t.trim()).filter(Boolean);
    if (!items.length) return c.innerHTML = '<span class="text-muted">-</span>';
    items.forEach(item => {
      const tag = document.createElement('span');
      tag.className = 'badge rounded-pill text-bg-primary me-1 mb-1';
      tag.textContent = item;
      c.appendChild(tag);
    });
  };

  /* tampilkan profil jika login */
  user && updateProfileDisplay(user);

  /* ───────── Edit profil modal ───────── */
  const editBtn  = document.getElementById('editProfileBtn');
  const editForm = document.getElementById('editProfileForm');

  editBtn?.addEventListener('click', () => {
    if (!user) return alert('Kamu belum login');
    const f = (id, val='') => (document.getElementById(id).value = val);
    f('editName',           user.username        || '');
    f('editEmail',          user.email           || '');
    f('editPhone',          user.phone           || '');
    f('editDOB',            user.DOB             || '');
    f('editLocation',       user.location        || '');
    f('editEducation',      user.education       || '');
    f('editSummary',        user.summary         || '');
    f('editJobHistory',     user.experience      || '');
    f('editEducationDetails', user.educationDetail || '');
    f('editAchievements',   user.achievement     || '');
    f('editCertificates',   user.certificate     || '');
    f('editSoftware',       user.software        || '');
    f('editLanguages',      user.languages       || '');
    f('editInterests',      user.interests       || '');
  });

  editForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const old   = JSON.parse(localStorage.getItem('loggedInUser'));
    const idx   = users.findIndex(u => u.email.toLowerCase() === old.email.toLowerCase());
    if (idx === -1) return alert('User tidak ditemukan.');

    const get = (id) => document.getElementById(id).value.trim();
    const updated = {
      ...old,
      username        : get('editName'),
      email           : get('editEmail'),
      phone           : get('editPhone'),
      DOB             : get('editDOB'),
      location        : get('editLocation'),
      education       : get('editEducation'),
      summary         : get('editSummary'),
      experience      : get('editJobHistory'),
      educationDetail : get('editEducationDetails'),
      achievement     : get('editAchievements'),
      certificate     : get('editCertificates'),
      software        : get('editSoftware'),
      languages       : get('editLanguages'),
      interests       : get('editInterests'),
    };

    const dup = users.some((u,i)=> i!==idx && u.email.toLowerCase() === updated.email.toLowerCase());
    if (dup) return alert('Email sudah digunakan oleh akun lain.');

    users[idx] = updated;
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('loggedInUser', JSON.stringify(updated));
    alert('Profil berhasil diperbarui.');
    setTimeout(()=>location.reload(),100);
  });
});

/* ───────── Listener di luar DOMContentLoaded (pakai ?.) ───────── */
document.getElementById('editProfileImage')?.addEventListener('change', function () {
  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById('previewProfileImage').src = e.target.result;
    document.getElementById('profilePicture').src      = e.target.result;
  };
  this.files[0] && reader.readAsDataURL(this.files[0]);
});

document.getElementById('editProfileForm')?.addEventListener('submit', function (e) {
  e.preventDefault();
  // fungsi renderTags sudah tersedia di blok DOMContentLoaded
});

/* ───────── Helper ───────── */
function hashPassword(str) {
  return btoa(unescape(encodeURIComponent(str)));
}
