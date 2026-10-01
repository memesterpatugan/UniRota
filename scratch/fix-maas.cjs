const fs = require('fs');
let content = fs.readFileSync('src/pages/maas-hesaplama.astro', 'utf8');

const scriptStart = content.indexOf('<script>');
const scriptEnd = content.indexOf('</script>', scriptStart) + 9;

const newScript = `<script>
  import { calculateYearlySalary } from '../lib/calculate-salary';

  document.addEventListener('astro:page-load', () => {
    try {
      const dataScript = document.getElementById('tax-data');
      if (!dataScript) return;
      
      const taxRates = JSON.parse(dataScript.textContent || '{}');
      const params = taxRates;
      
      const grossInput = document.getElementById('gross-input');
      const setMinWageBtn = document.getElementById('set-min-wage-btn');
      const tbody = document.querySelector('#salary-table tbody');
      
      if (!grossInput || !setMinWageBtn || !tbody) return;

      const formatter = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      function parseTRNumber(val) {
        if (!val) return 0;
        const cleanStr = val.replace(/\\./g, '').replace(',', '.');
        const parsed = parseFloat(cleanStr);
        return isNaN(parsed) ? 0 : parsed;
      }

      function renderTable() {
        const grossVal = parseTRNumber(grossInput.value);
        if (grossVal <= 0) {
          tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Geçerli bir maaş giriniz.</td></tr>';
          return;
        }

        const results = calculateYearlySalary(grossVal, params);
        const monthsTR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
        
        tbody.innerHTML = results.map(r => {
          const sgkTotal = r.sgkDeduction + r.unemploymentDeduction;
          return \`<tr>
            <td><strong>\${monthsTR[r.month - 1]}</strong></td>
            <td>\${formatter.format(r.gross)} ₺</td>
            <td style="color: #6c757d;">\${formatter.format(r.cumulativeIncomeTaxBase)} ₺</td>
            <td class="deduction">-\${formatter.format(sgkTotal)} ₺</td>
            <td class="deduction">-\${formatter.format(r.payableIncomeTax)} ₺</td>
            <td class="deduction">-\${formatter.format(r.payableStampTax)} ₺</td>
            <td class="net-salary"><strong>\${formatter.format(r.netSalary)} ₺</strong></td>
          </tr>\`;
        }).join('');
      }

      grossInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/[^0-9,]/g, '');
        if (val.split(',').length > 2) {
          val = val.substring(0, val.lastIndexOf(','));
        }
        e.target.value = val;
        renderTable();
      });

      setMinWageBtn.addEventListener('click', () => {
        const minWage = parseFloat(setMinWageBtn.dataset.val || '33030');
        grossInput.value = formatter.format(minWage);
        renderTable();
        if (typeof window.showToast === 'function') {
          window.showToast('Asgari ücret uygulandı!', 'success');
        }
      });

      renderTable();
    } catch (err) {
      console.error('Maaş hesaplama hatası:', err);
    }
  });
</script>`;

content = content.substring(0, scriptStart) + newScript + content.substring(scriptEnd);
fs.writeFileSync('src/pages/maas-hesaplama.astro', content);
