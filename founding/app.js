const services = ["Neuropsychology","Neurofeedback","Women's health","Hormone therapy","Fitness + performance","Fitness classes","Self defense","Spa + recovery","Facial aesthetics","Hair","Nails","AURA Kids","Coworking","Private business suites","Podcast / creative studios","AURA Nourish","Education","Community","AURA Live"];
const groups = {
  travel_radius:["Under 15 minutes","15–30 minutes","30–45 minutes","45–60 minutes","60+ minutes"],
  visit_frequency:["Less than once per week","1–2 times per week","3–4 times per week","5+ times per week"],
  childcare_interest:["Yes","No","Not applicable"], coworking_interest:["Yes","No","Not applicable"],
  pricing_preference:["$249/month","$399/month","$599/month","None of these"]
};
const dialog = document.querySelector('#wishlist-dialog');
const form = document.querySelector('#wishlist-form');
const steps = [...document.querySelectorAll('.form-step')];
const progress = [...document.querySelectorAll('.progress li')];
const errorBox = document.querySelector('.form-error');
let currentStep = 0;

const makeChoice = (name, value, type='radio', className='choice') => `<label class="${className}"><input type="${type}" name="${name}" value="${value}" ${type==='radio'?'required':''}><span>${value}</span></label>`;
document.querySelector('.service-options').innerHTML = services.map(v=>makeChoice('service_interests',v,'checkbox')).join('');
document.querySelector('.top-options').innerHTML = services.map(v=>makeChoice('top_three_interests',v,'checkbox')).join('');
document.querySelectorAll('[data-required-group]').forEach(el=>{const name=el.dataset.requiredGroup;const cls=name==='pricing_preference'?'price-choice':'choice';el.innerHTML=groups[name].map(v=>makeChoice(name,v,'radio',cls)).join('')});

document.querySelector('.top-options').addEventListener('change', e=>{
  const selected=[...form.querySelectorAll('[name="top_three_interests"]:checked')];
  if(selected.length>3){e.target.checked=false;errorBox.textContent='Choose no more than three priorities.'}
  else errorBox.textContent='';
  document.querySelector('.selection-count span').textContent=Math.min(selected.length,3);
});

function renderStep(){steps.forEach((s,i)=>s.classList.toggle('active',i===currentStep));progress.forEach((p,i)=>{p.classList.toggle('active',i===currentStep);p.classList.toggle('done',i<currentStep)});document.querySelector('.button-back').style.display=currentStep?'block':'none';document.querySelector('.button-next').style.display=currentStep===steps.length-1?'none':'inline-flex';document.querySelector('.button-submit').style.display=currentStep===steps.length-1?'inline-flex':'none';errorBox.textContent='';dialog.scrollTo({top:0,behavior:'smooth'})}
function validateStep(){const controls=[...steps[currentStep].querySelectorAll('input,textarea')];for(const el of controls){if(!el.checkValidity()){el.reportValidity();return false}}if(currentStep===1){if(!form.querySelector('[name="service_interests"]:checked')){errorBox.textContent='Select at least one part of AURA you would use.';return false}if(!form.querySelector('[name="top_three_interests"]:checked')){errorBox.textContent='Select at least one top priority.';return false}}return true}
document.querySelector('.button-next').addEventListener('click',()=>{if(validateStep()){window.dataLayer?.push({event:'wishlist_step_complete',step:currentStep+1});currentStep++;renderStep()}});
document.querySelector('.button-back').addEventListener('click',()=>{currentStep=Math.max(0,currentStep-1);renderStep()});
document.querySelectorAll('[data-open-form]').forEach(btn=>btn.addEventListener('click',()=>{currentStep=0;renderStep();dialog.showModal();document.body.style.overflow='hidden';window.dataLayer?.push({event:'wishlist_form_start'})}));
function closeDialog(){dialog.close();document.body.style.overflow=''}
document.querySelector('.dialog-close').addEventListener('click',closeDialog);document.querySelector('.dialog-done').addEventListener('click',closeDialog);
dialog.addEventListener('cancel',e=>{e.preventDefault();closeDialog()});

const normalizePhone = value => value.replace(/\D/g,'');
const attribution = Object.fromEntries(['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].map(key=>[key,new URLSearchParams(location.search).get(key)]));
form.addEventListener('submit',async e=>{
  e.preventDefault();if(!validateStep())return;
  const submit=document.querySelector('.button-submit');submit.disabled=true;submit.firstChild.textContent='SAVING… ';
  const fd=new FormData(form);const data=Object.fromEntries(fd.entries());
  data.email=data.email.trim().toLowerCase();data.phone=normalizePhone(data.phone);
  data.service_interests=fd.getAll('service_interests');data.top_three_interests=fd.getAll('top_three_interests');
  Object.assign(data,attribution,{referrer:document.referrer||null});delete data.consent;
  const cfg=window.AURA_CONFIG||{};
  try{
    if(!cfg.supabaseUrl||!cfg.supabaseAnonKey)throw new Error('The Wish List database is not connected yet. Add the Supabase environment variables and rebuild.');
    const response=await fetch(`${cfg.supabaseUrl.replace(/\/$/,'')}/rest/v1/rpc/submit_aura_rewire_wishlist`,{method:'POST',headers:{apikey:cfg.supabaseAnonKey,Authorization:`Bearer ${cfg.supabaseAnonKey}`,'Content-Type':'application/json'},body:JSON.stringify({payload:data})});
    if(!response.ok){const body=await response.json().catch(()=>({}));throw new Error(body.message||'We could not save your application. Please try again.')}
    form.style.display='none';document.querySelector('.progress').style.display='none';document.querySelector('.success-state').style.display='block';window.dataLayer?.push({event:'wishlist_submit'});
  }catch(err){errorBox.textContent=err.message;submit.disabled=false;submit.firstChild.textContent='JOIN THE FOUNDING WISH LIST '}
});

const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
