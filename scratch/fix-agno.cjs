const fs = require('fs');
let content = fs.readFileSync('src/pages/agno-hesaplama.astro', 'utf8');
const scriptStart = content.indexOf('<script>');
const scriptEnd = content.indexOf('</script>') + 9;
const oldScript = content.substring(scriptStart, scriptEnd);

if (!oldScript.includes("document.addEventListener('astro:page-load'")) {
  const importRegex = /import\s+[^;]+;\s*/g;
  let imports = '';
  let rest = oldScript.replace(/<script>([\s\S]*?)<\/script>/, '$1').replace(importRegex, (m) => { imports += m; return ''; });
  
  const newScript = `<script>\n${imports}\n  document.addEventListener('astro:page-load', () => {\n${rest}\n  });\n</script>`;
  content = content.substring(0, scriptStart) + newScript + content.substring(scriptEnd);
  fs.writeFileSync('src/pages/agno-hesaplama.astro', content);
}
