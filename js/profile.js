/* =========================================================
   Helper
   ========================================================= */
const hashPassword = s => btoa(unescape(encodeURIComponent(s)));
const readFileAsDataURL = f =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(f);
  });

/* =========================================================
   Main
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const $id = id => document.getElementById(id);

  /* ── form / tombol ── */
  const signupForm = $id('signupForm');
  const loginForm  = $id('loginForm');
  const logoutBtn  = $id('logoutBtn');
  const editForm   = $id('editProfileForm');
  const editBtn    = $id('editProfileBtn');

  /* ── ambil user login ── */
  let me = null;
  try { me = JSON.parse(localStorage.getItem('loggedInUser') || 'null'); }
  catch { localStorage.removeItem('loggedInUser'); }

  /* ───────────────────────────────────────────────────────
       Render profil
     ─────────────────────────────────────────────────────── */
  function showProfile(u){
    const set = (id,val)=>{ const e=$id(id); e && (e.textContent = val || '-'); };

    set('profileUsername',        u.username);
    set('profileUsernameSidebar', u.username);
    set('profileEmail',           u.email);
    set('profilePhone',           u.phone);
    set('profileLocation',        u.location);
    set('profileDOB',             u.DOB);
    set('showBirthPlace',         u.birthPlace);
    set('showGender',             u.gender);
    set('showKTP',                u.ktp);
    set('profileEducation',       u.education);
    set('showAddress',            u.address);
    set('profileSummary',         u.summary);
    set('experienceText',         u.experience);
    set('educationDetail',        u.educationDetail);
    set('achievementText',        u.achievement);
    set('certificateText',        u.certificateDesc);

    if (u.photoData) $id('profilePicture')?.setAttribute('src', u.photoData);

    renderTags('softwareTags',  u.software);
    renderTags('languageTags',  u.languages);
    renderTags('interestTags',  u.interests);
  }

  function renderTags(wrapperId, csv){
    const box = $id(wrapperId); if (!box) return;
    box.innerHTML = '';
    const arr = (csv || '').split(',').map(t => t.trim()).filter(Boolean);
    if (!arr.length){
      box.innerHTML = '<span class="text-muted">-</span>';
      return;
    }
    arr.forEach(t=>{
      const b=document.createElement('span');
      b.className='badge bg-secondary me-1 mb-1';
      b.textContent=t;
      box.appendChild(b);
    });
  }

  me && showProfile(me);

  /* ───────────────────────── SIGN-UP ───────────────────────── */
  signupForm?.addEventListener('submit', e=>{
    e.preventDefault();
    const fn   = $id('fullName').value.trim();
    const mail = $id('email').value.trim();
    const pw   = $id('password').value;
    const cpw  = $id('confirmPassword').value;
    if(!fn||!mail||!pw||!cpw)           return alert('Lengkapi data.');
    if(!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(mail)) return alert('Email salah.');
    if(pw!==cpw)                        return alert('Konfirmasi password salah.');

    const db = JSON.parse(localStorage.getItem('users')||'[]');
    if(db.some(u=>u.email.toLowerCase()===mail.toLowerCase()))
      return alert('Email sudah terdaftar.');

    const nu = { username:fn, email:mail, password:hashPassword(pw) };
    db.push(nu);
    localStorage.setItem('users',JSON.stringify(db));
    localStorage.setItem('loggedInUser',JSON.stringify(nu));
    location='index.html';
  });

  /* ───────────────────────── LOGIN ───────────────────────── */
  loginForm?.addEventListener('submit', e=>{
    e.preventDefault();
    const user = $id('username').value.trim();
    const pw   = hashPassword($id('password').value.trim());
    const db   = JSON.parse(localStorage.getItem('users')||'[]');
    const found=db.find(u=>(u.username===user||u.email===user)&&u.password===pw);
    if(!found) return alert('Login gagal.');
    localStorage.setItem('loggedInUser',JSON.stringify(found));
    location='index.html';
  });

  /* ───────────────────────── LOGOUT ───────────────────────── */
  logoutBtn?.addEventListener('click',()=>{
    localStorage.removeItem('loggedInUser');
    location='index.html';
  });

  /* ───────────────────────── PREFILL MODAL EDIT ───────────────────────── */
  editBtn?.addEventListener('click',()=>{
    if(!me) return;
    const pf=(id,val='')=>($id(id).value=val);
    pf('editUsername',        me.username);
    pf('editEmail',           me.email);
    pf('editPhone',           me.phone);
    pf('editLocation',        me.location);
    pf('editDOB',             me.DOB);
    pf('birthPlace',          me.birthPlace);
    $id('gender').value       = me.gender || '';
    pf('editKtp',             me.ktp);
    $id('editEducation').value= me.education || '';
    pf('address',             me.address);
    pf('editSummary',         me.summary);
    pf('editJobHistory',      me.experience);
    pf('editEducationDetail', me.educationDetail);
    pf('editAchievements',    me.achievement);
    pf('editCertificatesDesc',me.certificateDesc);
    pf('editSoftware',        me.software);
    pf('editLanguages',       me.languages);
    pf('editInterests',       me.interests);
  });

  /* ───────────────────────── SIMPAN PROFIL ───────────────────────── */
  editForm?.addEventListener('submit', async e=>{
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const idx   = users.findIndex(u=>u.email===me.email);
    if(idx===-1) return alert('User hilang.');

    /* foto profil */
    let photoData = me.photoData || '';
    const photoFile = $id('editProfileImage')?.files?.[0] || null;
    if (photoFile){
      if(!photoFile.type.startsWith('image/')) return alert('Foto harus gambar.');
      if(photoFile.size>2*1024*1024)           return alert('Foto maks 2 MB.');
      photoData = await readFileAsDataURL(photoFile);
    }

    /* ambil nilai input */
    const g=id=>$id(id).value.trim();
    const upd = {
      ...me,
      username        : g('editUsername'),
      email           : g('editEmail'),
      phone           : g('editPhone'),
      location        : g('editLocation'),
      DOB             : g('editDOB'),
      birthPlace      : g('birthPlace'),
      gender          : $id('gender').value,
      ktp             : g('editKtp'),
      education       : $id('editEducation').value,
      address         : g('address'),
      summary         : g('editSummary'),
      experience      : g('editJobHistory'),
      educationDetail : g('editEducationDetail'),
      achievement     : g('editAchievements'),
      certificateDesc : g('editCertificatesDesc'),
      software        : g('editSoftware'),
      languages       : g('editLanguages'),
      interests       : g('editInterests'),
      photoData
    };

    if(users.some((u,i)=>i!==idx && u.email.toLowerCase()===upd.email.toLowerCase()))
      return alert('Email sudah dipakai akun lain.');

    users[idx]=upd;
    localStorage.setItem('users',JSON.stringify(users));
    localStorage.setItem('loggedInUser',JSON.stringify(upd));
    me=upd;
    showProfile(me);
    bootstrap.Modal.getInstance($id('editProfileModal'))?.hide();
    alert('Profil tersimpan.');
  });

  /* ───────────────────────── PREVIEW FOTO ───────────────────────── */
  $id('editProfileImage')?.addEventListener('change',function(){
    const f=this.files?.[0]; if(!f) return;
    const r=new FileReader();
    r.onload=e=>{ $id('profilePicture').src=e.target.result; };
    r.readAsDataURL(f);
  });

  /* ───────────────────────── AUTO-GROW TEXTAREA ───────────────────────── */
  document.querySelectorAll('textarea.autogrow').forEach(t=>{
    const resize=()=>{ t.style.height='auto'; t.style.height=t.scrollHeight+'px'; };
    ['input','change','keyup'].forEach(evt=>t.addEventListener(evt,resize));
    resize();
  });
});
