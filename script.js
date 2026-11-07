// Edita esta lista para agregar recursos a tu web.
const resources=[
 {title:"Mi primer script",category:"SCRIPT",description:"Ejemplo de ficha. Reemplázala por un script que hayas probado.",url:"",button:"Próximamente"},
 {title:"Modelo de ejemplo",category:"MODELO",description:"Publica aquí modelos y explica cómo utilizarlos.",url:"",button:"Próximamente"},
 {title:"Guía de Studio Lite",category:"TUTORIAL",description:"Consejos para crear y aprender desde Android.",url:"",button:"Próximamente"}
];
const cards=document.getElementById("cards"),search=document.getElementById("search"),empty=document.getElementById("empty");
document.getElementById("year").textContent=new Date().getFullYear();
function render(){let q=search.value.toLowerCase();let list=resources.filter(x=>(x.title+x.category+x.description).toLowerCase().includes(q));cards.innerHTML=list.map(x=>`<article class="card"><span class="tag">${x.category}</span><h3>${x.title}</h3><p>${x.description}</p><a href="${x.url||'#'}" ${x.url?'target="_blank" rel="noopener"':''}>${x.url?(x.button||'Abrir recurso'):(x.button||'Próximamente')} ↗</a></article>`).join("");empty.hidden=list.length>0}
search.addEventListener("input",render);render();