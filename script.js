// PixelDev MX — catálogo público desde GitHub
const OWNER = "angelisaidchl-lgtm";
const REPO = "pixeldev-mx";
const BRANCH = "main";
// Enlaces de donación: pega aquí TU URL pública cuando tengas una (Ko-fi, Buy Me a Coffee, etc.).
const DONATION_URL = ""; 
const API_ROOT = `https://api.github.com/repos/${OWNER}/${REPO}/contents`;
const RAW_ROOT = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/`;
const grid = document.getElementById("scriptGrid");
const statusEl = document.getElementById("scriptStatus");
const search = document.getElementById("scriptSearch");
const filters = document.getElementById("scriptFilters");
let files = [], filter = "all";
document.getElementById("year").textContent = new Date().getFullYear();

const menuToggle=document.getElementById("menuToggle"), nav=document.getElementById("navMenu");
menuToggle.addEventListener("click",()=>{const open=nav.classList.toggle("open");menuToggle.setAttribute("aria-expanded",String(open));});
nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>nav.classList.remove("open")));

function safeName(s){return s.replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function extension(name){return name.split(".").pop().toLowerCase();}
function renderScripts(){
 const q=search.value.trim().toLowerCase();
 const list=files.filter(f=>["lua","luau"].includes(extension(f.name)))
  .filter(f=>(filter==="all"||extension(f.name)===filter)&&f.name.toLowerCase().includes(q));
 grid.innerHTML="";
 if(!list.length){grid.innerHTML='<div class="status">No hay scripts que coincidan. Cuando el creador publique archivos .lua o .luau en la raíz, aparecerán aquí.</div>';return;}
 list.forEach(f=>{
  const ext=extension(f.name).toUpperCase(), url=RAW_ROOT+encodeURIComponent(f.name);
  const card=document.createElement("article");card.className="resource-card";
  card.innerHTML=`<div class="card-top"><div class="file-icon"> { }</div><span class="tag">${ext}</span></div><h3>${safeName(f.name)}</h3><p>Script de Roblox Studio / Luau publicado en PixelDev MX.</p><div class="card-actions"><a class="download" href="${url}" download="${safeName(f.name)}">Descargar ↓</a><a href="${f.html_url}" target="_blank" rel="noopener">Ver código ↗</a></div>`;
  grid.appendChild(card);
 });
}
async function loadScripts(){
 try{
  const res=await fetch(`${API_ROOT}?ref=${BRANCH}`,{cache:"no-store"});
  if(!res.ok) throw new Error("GitHub respondió "+res.status);
  files=await res.json();
  statusEl.textContent=`${files.filter(f=>["lua","luau"].includes(extension(f.name))).length} scripts encontrados · sincronizado con GitHub`;
  renderScripts();
 }catch(e){statusEl.textContent="No se pudo cargar GitHub. Puedes visitar el repositorio directamente.";grid.innerHTML=`<div class="status"><a href="https://github.com/${OWNER}/${REPO}" target="_blank" rel="noopener">Abrir repositorio de scripts ↗</a><br>Comprueba que GitHub Pages y el repositorio estén públicos.</div>`;}
}
search.addEventListener("input",renderScripts);
filters.addEventListener("click",e=>{const b=e.target.closest("button[data-filter]");if(!b)return;filter=b.dataset.filter;filters.querySelectorAll("button").forEach(x=>x.classList.toggle("active",x===b));renderScripts();});

// Tutoriales: el creador administra tutoriales.json en la raíz del repositorio.
// Formato: [{"title":"Título","description":"Descripción","url":"https://youtu.be/ID","platform":"YouTube"}]
async function loadTutorials(){
 const box=document.getElementById("tutorialGrid"), st=document.getElementById("tutorialStatus");
 try{
  const r=await fetch(RAW_ROOT+"tutoriales.json?cache="+Date.now(),{cache:"no-store"});
  if(!r.ok) throw new Error("No existe tutoriales.json todavía");
  const data=await r.json();
  if(!Array.isArray(data)||!data.length) throw new Error("Lista vacía");
  st.textContent=`${data.length} tutorial(es) publicados`;
  box.innerHTML="";
  data.forEach(t=>{
   if(!t.title||!t.url)return;
   const card=document.createElement("article");card.className="tutorial-card";
   const title=safeName(String(t.title)),desc=safeName(String(t.description||"Tutorial de PixelDev MX")),url=String(t.url);
   if(!/^https:\/\/(www\.)?(youtube\.com|youtu\.be|tiktok\.com|www\.tiktok\.com|vimeo\.com|drive\.google\.com)/i.test(url)){return;}
   card.innerHTML=`<div class="video-thumb">▶</div><span class="tag">${safeName(t.platform||"VIDEO")}</span><h3>${title}</h3><p>${desc}</p><div class="card-actions"><a class="download" href="${url}" target="_blank" rel="noopener noreferrer">Ver tutorial ↗</a></div>`;
   box.appendChild(card);
  });
  if(!box.children.length) throw new Error("No hay enlaces válidos");
 }catch(e){
  st.textContent="Próximamente: el creador añadirá los videos.";
  box.innerHTML='<article class="tutorial-card"><div class="video-thumb">＋</div><h3>Próximamente</h3><p>Los tutoriales aparecerán aquí cuando el creador publique la lista en GitHub.</p></article>';
 }
}
const donate=document.getElementById("donateLink");
if(DONATION_URL && /^https:\/\//i.test(DONATION_URL)){donate.href=DONATION_URL;donate.target="_blank";donate.rel="noopener noreferrer";donate.innerHTML='Apoyar el proyecto <span>♡</span>';}
else{donate.addEventListener("click",e=>{e.preventDefault();alert("El creador aún no ha configurado un enlace de donación. ¡Gracias por querer apoyar PixelDev MX!");});}
loadScripts();loadTutorials();
