/* =========================================================================
   Quick-Apply Modal Logic
   ======================================================================= */
document.addEventListener('DOMContentLoaded', () => {

  // Prefill posisi berdasarkan attr `data-posisi`
  const applyModal = document.getElementById('applyModal');
  applyModal.addEventListener('show.bs.modal', event => {
    const btn   = event.relatedTarget;                 // tombol Lamar
    const pos   = btn?.getAttribute('data-posisi') || '';
    document.getElementById('posisiInput').value = pos;
  });

  // Handle submit
  document.getElementById('applyForm').addEventListener('submit', e => {
    e.preventDefault();

    // --- Validasi file size sederhana (≤2 MB) ------------------
    const cv  = e.target.cv.files[0];
    const fol = e.target.portfolio.files[0];
    if (cv && cv.size  > 2*1024*1024)  return alert('CV melebihi 2 MB');
    if (fol && fol.size > 5*1024*1024) return alert('Portofolio melebihi 5 MB');

    // --- Kirim ke backend / AJAX di sini ---
    // Contoh dummy delay:
    setTimeout(() => {
      bootstrap.Modal.getInstance(applyModal).hide();
      new bootstrap.Modal('#successModal').show();
      e.target.reset();
    }, 500);
  });

});
