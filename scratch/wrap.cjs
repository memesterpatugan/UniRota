const fs = require('fs');

function wrapScript(file) {
  let content = fs.readFileSync(file, 'utf8');
  
  if (content.includes("document.addEventListener('astro:page-load'")) {
    console.log("Already has page-load: " + file);
    return;
  }
  
  if (content.includes("document.addEventListener('DOMContentLoaded'")) {
    content = content.replace(/document\.addEventListener\('DOMContentLoaded',\s*\(\)\s*=>\s*\{/g, "document.addEventListener('astro:page-load', () => {");
    fs.writeFileSync(file, content);
    console.log("Replaced DOMContentLoaded: " + file);
    return;
  }
  
  content = content.replace(/<script>([\s\S]*?)<\/script>/, (match, inner) => {
    const importRegex = /import\s+[^;]+;\s*/g;
    let imports = '';
    let rest = inner.replace(importRegex, (m) => { imports += m; return ''; });
    
    return `<script>\n${imports}\n  document.addEventListener('astro:page-load', () => {\n${rest}\n  });\n</script>`;
  });
  
  fs.writeFileSync(file, content);
  console.log("Wrapped with astro:page-load: " + file);
}

wrapScript('src/pages/sinav-takvimi.astro');
wrapScript('src/pages/agno-hesaplama.astro');
wrapScript('src/pages/maas-hesaplama.astro');
