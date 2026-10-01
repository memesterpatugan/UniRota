const fs = require('fs');
let content = fs.readFileSync('src/pages/sinav-takvimi.astro', 'utf8');
const scriptStart = content.indexOf('<script>');
const scriptEnd = content.indexOf('</script>') + 9;
const newScript = `<script>
  import { generateICS } from '../lib/ics';

  document.addEventListener('astro:page-load', () => {
    // ICS Indirme
    document.querySelectorAll('.add-calendar-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.target.closest('.exam-card');
        const name = card.dataset.name;
        const date = card.dataset.date.split('T')[0];
        
        const icsContent = generateICS(name, date);
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '.ics';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        if (typeof window.showToast === 'function') {
          window.showToast('Takvim cihazınıza indirildi!', 'success');
        }
      });
    });

    // Kalan Gun
    function updateCountdowns() {
      const now = new Date().getTime();
      document.querySelectorAll('.exam-card').forEach(card => {
        const dateStr = card.dataset.date;
        const examTime = new Date(dateStr).getTime();
        const distance = examTime - now;
        const timeSpan = card.querySelector('.time-left');
        
        if (!timeSpan) return;
        
        if (distance < 0) {
          timeSpan.textContent = 'Sınav zamanı geçti veya devam ediyor.';
          return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        
        timeSpan.textContent = 'Kaldı: ' + days + ' gün, ' + hours + ' saat, ' + minutes + ' dakika';
      });
    }

    updateCountdowns();
    // Clear old intervals if they exist
    if (window.countdownInterval) clearInterval(window.countdownInterval);
    window.countdownInterval = setInterval(updateCountdowns, 60000);
  });
</script>`;

content = content.substring(0, scriptStart) + newScript + content.substring(scriptEnd);
fs.writeFileSync('src/pages/sinav-takvimi.astro', content);
