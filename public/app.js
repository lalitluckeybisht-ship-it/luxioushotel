const $ = s => document.querySelector(s);

async function getJSON(url, options = {}) {
  const r = await fetch(url, options);
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || "Request failed");
  return data;
}
function esc(v) {
  return String(v ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}
async function loadMenu() {
  try {
    const data = await getJSON("/api/menu");
    $("#menu-grid").innerHTML = data.map(c => `
      <article class="menu-category"><h3>${esc(c.category)}</h3>
      ${c.items.map(i => `<div class="menu-item"><div class="menu-top"><strong>${esc(i.name)}</strong><span class="price">₹${Number(i.price).toLocaleString("en-IN")}</span></div><p>${esc(i.description)}</p></div>`).join("")}
      </article>`).join("");
  } catch { $("#menu-grid").innerHTML = "<p class='loading'>Menu could not be loaded.</p>"; }
}
async function loadExperiences() {
  try {
    const data = await getJSON("/api/experiences");
    $("#experience-grid").innerHTML = data.map(i => `<article class="experience-card"><span class="eyebrow">${esc(i.audience)}</span><h3>${esc(i.name)}</h3><p>${esc(i.description)}</p><span class="price">${esc(i.price)}</span></article>`).join("");
  } catch { $("#experience-grid").innerHTML = "<p class='loading'>Experiences unavailable.</p>"; }
}
async function loadReviews() {
  try {
    const data = await getJSON("/api/reviews");
    $("#reviews-list").innerHTML = data.length ? data.map(r => `<article class="review"><div class="stars">${"★".repeat(r.rating)}${"☆".repeat(5-r.rating)}</div><p>${esc(r.message)}</p><small>${esc(r.name || "Anonymous")}</small></article>`).join("") : "<p class='loading'>Be the first guest to leave a review.</p>";
  } catch { $("#reviews-list").innerHTML = "<p class='loading'>Reviews are currently unavailable.</p>"; }
}
$("#enquiry-form").addEventListener("submit", async e => {
  e.preventDefault(); const form=e.currentTarget, status=$("#enquiry-status"); status.textContent="Sending...";
  try { await getJSON("/api/enquiries",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Object.fromEntries(new FormData(form)))}); status.textContent="Thank you. Our team will contact you shortly."; form.reset(); }
  catch(err){ status.textContent=err.message; }
});
$("#review-form").addEventListener("submit", async e => {
  e.preventDefault(); const form=e.currentTarget, status=$("#review-status"); status.textContent="Posting...";
  try { await getJSON("/api/reviews",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Object.fromEntries(new FormData(form)))}); status.textContent="Review posted. Thank you!"; form.reset(); loadReviews(); }
  catch(err){ status.textContent=err.message; }
});
$(".menu-toggle").addEventListener("click",()=>{const n=document.querySelector("nav");n.classList.toggle("open");});
document.querySelectorAll("nav a").forEach(a=>a.addEventListener("click",()=>document.querySelector("nav").classList.remove("open")));
loadMenu(); loadExperiences(); loadReviews();
