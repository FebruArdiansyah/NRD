document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (navbar) navbar.classList.toggle('shrink', window.scrollY > 50);
  });

  const authMenu = document.getElementById('authMenu');
  const profileMenu = document.getElementById('profileMenu');
  const navbarUsername = document.getElementById('navbarUsername');
  const greeting = document.getElementById('greeting');
  const signupForm = document.getElementById('signupForm');
  const loginForm = document.getElementById('loginForm');
  const logoutBtn = document.getElementById('logoutBtn');
  const viewJobsBtns = document.querySelectorAll('.view-jobs-btn');
  const profileText = document.getElementById('profileTextLink');
  const profileIcon = document.getElementById('profileIcon');
  const applyButtons = document.querySelectorAll('.apply-btn');
  const lihatLowonganNavbar = document.getElementById('lihatLowongan');
  const lihatLowonganFooter = document.getElementById('footerLowongan');

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('loggedInUser')) || null;
  } catch {
    localStorage.removeItem('loggedInUser');
  }

  // Update navbar berdasarkan login
  if (user) {
    authMenu?.classList.add('d-none');
    profileMenu?.classList.remove('d-none');
    profileText?.classList.add('d-none');
    profileIcon?.classList.remove('d-none');
    if (navbarUsername) navbarUsername.textContent = user.username || 'Profil';
  } else {
    authMenu?.classList.remove('d-none');
    profileMenu?.classList.add('d-none');
    profileText?.classList.remove('d-none');
    profileIcon?.classList.add('d-none');
  }

  // Sambutan setelah sign-up
  const registeredName = localStorage.getItem('registeredName');
  if (greeting && !user && registeredName) {
    greeting.textContent = `Selamat datang, ${registeredName}!`;
    localStorage.removeItem('registeredName');
  }

  // === SIGNUP ===
  signupForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const fullName = document.getElementById('fullName')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const password = document.getElementById('password')?.value;
    const confirmPassword = document.getElementById('confirmPassword')?.value;

    if (!fullName || !email || !password || !confirmPassword) {
      return alert("Mohon isi semua kolom!");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return alert("Format email tidak valid!");
    }

    if (password !== confirmPassword) {
      return alert("Password dan konfirmasi tidak cocok!");
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return alert("Email sudah terdaftar.");
    }

    const newUser = {
      username: fullName,
      email,
      password: hashPassword(password),
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('loggedInUser', JSON.stringify(newUser));
    localStorage.setItem('registeredName', fullName);
    window.location.href = 'index.html?registered=true';
  });

  // === LOGIN ===
  loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username')?.value.trim();
    const password = document.getElementById('password')?.value.trim();

    if (!username || !password) return alert("Harap isi semua kolom.");

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const foundUser = users.find(u =>
      (u.username === username || u.email === username) &&
      u.password === hashPassword(password)
    );

    if (foundUser) {
      localStorage.setItem('loggedInUser', JSON.stringify(foundUser));
      window.location.href = 'index.html';
    } else {
      alert('Email/username atau password salah.');
    }
  });

  logoutBtn?.addEventListener('click', () => {
    localStorage.removeItem('loggedInUser');
    window.location.href = 'index.html';
  });

  const handleLihatLowonganClick = (e) => {
    e.preventDefault();
    const userNow = JSON.parse(localStorage.getItem('loggedInUser'));
    window.location.href = userNow ? 'find-job.html' : 'sign-in.html';
  };

  viewJobsBtns.forEach(btn => btn?.addEventListener('click', handleLihatLowonganClick));
  lihatLowonganNavbar?.addEventListener('click', handleLihatLowonganClick);
  lihatLowonganFooter?.addEventListener('click', handleLihatLowonganClick);

  // === APPLY JOB ===
  applyButtons.forEach(btn => {
    btn?.addEventListener('click', function (e) {
      const userNow = JSON.parse(localStorage.getItem('loggedInUser'));
      const jobTitle = this.closest('.card')?.querySelector('h5')?.textContent?.trim();

      if (!userNow) {
        e.preventDefault();
        return window.location.href = 'sign-in.html';
      }

      if (jobTitle) {
        const encodedTitle = encodeURIComponent(jobTitle);
        window.location.href = `form.html?posisi=${encodedTitle}`;
      } else {
        alert('Gagal mengambil data posisi.');
      }
    });
  });

  // === FORM LAMARAN ===
  const formLamaran = document.getElementById('lamaranForm');
  if (formLamaran) {
    formLamaran.addEventListener('submit', (e) => {
      e.preventDefault();
      const modalEl = document.getElementById('notifikasiModal');
      if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
      }
      formLamaran.reset();
    });
  }

  // === TAMPILKAN PROFIL USER ===
  if (user) {
    updateProfileDisplay(user);
  }

  // === EDIT PROFIL ===
  const editBtn = document.getElementById('editProfileBtn');
  const editForm = document.getElementById('editProfileForm');

  editBtn?.addEventListener('click', () => {
    if (!user) return alert("Kamu belum login");

    document.getElementById('editName').value = user.username || '';
    document.getElementById('editEmail').value = user.email || '';
    document.getElementById('editPhone').value = user.phone || '';
    document.getElementById('editDOB').value = user.DOB || '';
    document.getElementById('editLocation').value = user.location || '';
    document.getElementById('editEducation').value = user.education || '';
    document.getElementById('editSummary').value = user.summary || '';
    document.getElementById('editJobHistory').value = user.experience || '';
    document.getElementById('editEducationDetails').value = user.educationDetail || '';
    document.getElementById('editAchievements').value = user.achievement || '';
    document.getElementById('editCertificates').value = user.certificate || '';
    document.getElementById('editSoftware').value = user.software || '';
    document.getElementById('editLanguages').value = user.languages || '';
    document.getElementById('editInterests').value = user.interests || '';
  });

  editForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const oldUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const index = users.findIndex(u => u.email.toLowerCase() === oldUser.email.toLowerCase());
    if (index === -1) return alert("User tidak ditemukan.");

    const updatedUser = {
      ...oldUser,
      username: document.getElementById('editName').value.trim(),
      email: document.getElementById('editEmail').value.trim(),
      phone: document.getElementById('editPhone').value.trim(),
      DOB: document.getElementById('editDOB').value.trim(),
      location: document.getElementById('editLocation').value.trim(),
      education: document.getElementById('editEducation').value.trim(),
      summary: document.getElementById('editSummary').value.trim(),
      experience: document.getElementById('editJobHistory').value.trim(),
      educationDetail: document.getElementById('editEducationDetails').value.trim(),
      achievement: document.getElementById('editAchievements').value.trim(),
      certificate: document.getElementById('editCertificates').value.trim(),
      software: document.getElementById('editSoftware').value.trim(),
      languages: document.getElementById('editLanguages').value.trim(),
      interests: document.getElementById('editInterests').value.trim(),
    };

    const duplicateEmail = users.some((u, i) => i !== index && u.email.toLowerCase() === updatedUser.email.toLowerCase());
    if (duplicateEmail) return alert("Email sudah digunakan oleh akun lain.");

    users[index] = updatedUser;
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
    alert("Profil berhasil diperbarui.");
    setTimeout(() => location.reload(), 100); // beri delay kecil agar update tersimpan dulu
  });

  function updateProfileDisplay(currentUser) {
    const get = (id) => document.getElementById(id);

    get('profileUsername') && (get('profileUsername').textContent = currentUser.username || '-');
    get('profileEmail') && (get('profileEmail').textContent = currentUser.email || '-');
    get('profilePhone') && (get('profilePhone').textContent = currentUser.phone || '-');
    get('profileDOB') && (get('profileDOB').textContent = currentUser.DOB || '-');
    get('profileLocation') && (get('profileLocation').textContent = currentUser.location || '-');
    get('profileEducation') && (get('profileEducation').textContent = currentUser.education || '-');
    get('profileSummary') && (get('profileSummary').textContent = currentUser.summary || '-');
    get('experienceText') && (get('experienceText').textContent = currentUser.experience || '-');
    get('educationDetail') && (get('educationDetail').textContent = currentUser.educationDetail || '-');
    get('achievementText') && (get('achievementText').textContent = currentUser.achievement || '-');
    get('certificateText') && (get('certificateText').textContent = currentUser.certificate || '-');

    fillTags('softwareTags', currentUser.software);
    fillTags('languageTags', currentUser.languages);
    fillTags('interestTags', currentUser.interests);
  }

  function fillTags(id, text) {
    const container = document.getElementById(id);
    if (!container) return;
    container.innerHTML = '';
    const items = (text || '').split(',').map(i => i.trim()).filter(Boolean);
    if (items.length === 0) {
      return container.innerHTML = '<span class="text-muted">-</span>';
    }
    items.forEach(item => {
      const span = document.createElement('span');
      span.className = 'badge rounded-pill text-bg-primary';
      span.textContent = item;
      container.appendChild(span);
    });
  }
});

// Preview gambar profil saat dipilih
document.getElementById('editProfileImage').addEventListener('change', function () {
  const reader = new FileReader();
  reader.onload = function (e) {
    document.getElementById('previewProfileImage').src = e.target.result;
    document.getElementById('profilePicture').src = e.target.result;
  };
  if (this.files[0]) {
    reader.readAsDataURL(this.files[0]);
  }
});

// Saat form edit profil disubmit
document.getElementById('editProfileForm').addEventListener('submit', function (e) {
  e.preventDefault();

  // Ambil nilai input dari form
  const username = document.getElementById('editUsername').value.trim();
  const email = document.getElementById('editEmail').value.trim();
  const phone = document.getElementById('editPhone').value.trim();
  const location = document.getElementById('editLocation').value.trim();
  const dob = document.getElementById('editDOB').value.trim();
  const education = document.getElementById('editEducation').value.trim();
  const summary = document.getElementById('editSummary').value.trim();
  const jobHistory = document.getElementById('editJobHistory').value.trim();
  const achievements = document.getElementById('editAchievements').value.trim();
  const certificates = document.getElementById('editCertificates').value.trim();
  const educationDetails = document.getElementById('editEducationDetails').value.trim();
  const software = document.getElementById('editSoftware').value.trim().split(',');
  const languages = document.getElementById('editLanguages').value.trim().split(',');
  const interests = document.getElementById('editInterests').value.trim().split(',');

  // Tampilkan data yang sudah diinput ke halaman utama
  document.getElementById('profileUsername').textContent = username || 'User';
  document.getElementById('profileUsernameSidebar').textContent = username || 'User';
  document.getElementById('profileEmail').textContent = email || '-';
  document.getElementById('profilePhone').textContent = phone || '-';
  document.getElementById('profileLocation').textContent = location || '-';
  document.getElementById('profileDOB').textContent = dob || '-';
  document.getElementById('profileEducation').textContent = education || '-';
  document.getElementById('profileSummary').textContent = summary || '-';
  document.getElementById('experienceText').textContent = jobHistory || '-';
  document.getElementById('achievementText').textContent = achievements || '-';
  document.getElementById('certificateText').textContent = certificates || '-';
  document.getElementById('educationDetail').textContent = educationDetails || '-';

  // Fungsi untuk menampilkan tag seperti badge
  function renderTags(containerId, items) {
    const container = document.getElementById(containerId);
    container.innerHTML = ''; // kosongkan dulu
    items.forEach(item => {
      const cleanItem = item.trim();
      if (cleanItem) {
        const tag = document.createElement('span');
        tag.className = 'badge bg-secondary me-1 mb-1';
        tag.textContent = cleanItem;
        container.appendChild(tag);
      }
    });
  }

  renderTags('softwareTags', software);
  renderTags('languageTags', languages);
  renderTags('interestTags', interests);

  // Tutup modal setelah simpan
  const modalElement = document.getElementById('editProfileModal');
  const modalInstance = bootstrap.Modal.getInstance(modalElement);
  if (modalInstance) modalInstance.hide();
});

// (Opsional) Auto isi preview saat halaman dimuat dari localStorage
// Bisa ditambahkan kalau kamu ingin menyimpan data profil ke localStorage.


// Function hash password
function hashPassword(str) {
  return btoa(unescape(encodeURIComponent(str)));
}
