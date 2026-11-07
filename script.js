const searchInput=document.getElementById('searchInput');
const categoryFilter=document.getElementById('categoryFilter');
const cards=[...document.querySelectorAll('.resource-card')];
const emptyState=document.getElementById('emptyState');
function filterResources(){
  const term=searchInput.value.trim().toLowerCase();
  const category=categoryFilter.value;
  let visible=0;
  cards.forEach(card=>{
    const matchesText=(card.dataset.search+' '+card.innerText).toLowerCase().includes(term);
    const matchesCategory=category==='todos'||card.dataset.category===category;
    const show=matchesText&&matchesCategory;
    card.hidden=!show;
    if(show)visible++;
  });
  emptyState.hidden=visible!==0;
}
searchInput.addEventListener('input',filterResources);
categoryFilter.addEventListener('change',filterResources);
document.getElementById('year').textContent=new Date().getFullYear();
