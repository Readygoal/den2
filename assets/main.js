import {TOOLS} from './tools.js';
import {T,VIEW_META,TASKS,BUILDERS} from './config.js';
import {runDiagnostic} from './diagnostics.js';
import {citationMatch,paraphraseOverlap} from './source_tools.js';

const $=(s,p=document)=>p.querySelector(s),$$=(s,p=document)=>[...p.querySelectorAll(s)];
const KEY='aw-workbench-v5:';
const store={get:(k,d)=>{try{return JSON.parse(localStorage.getItem(KEY+k))??d}catch{return d}},set:(k,v)=>localStorage.setItem(KEY+k,JSON.stringify(v))};
let PROBLEMS=[],lang=store.get('lang','en'),theme=store.get('theme','light'),builder='rq',sourceTab='match',selectedTool=1,problemStage='All';
const tx=k=>T[lang]?.[k]||T.en[k]||k;
const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
function norm(s){return (s||'').toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9çğıöşü\s-]/gi,' ').replace(/\s+/g,' ').trim()}
const STOP=new Set('the a an and or of to in on for with is are was were be been being this that these those it its as by from at into than then how what why who which where when not no do does did can could should would may might study research article paper section data result results finding findings çalışma araştırma makale bölüm veri bulgu sonuç ve veya bir bu şu o ile için gibi daha çok nasıl neden ne hangi olarak olan'.split(' '));
const toks=s=>norm(s).split(' ').filter(x=>x.length>2&&!STOP.has(x));
function toast(s){const e=$('#toast');e.textContent=s;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),1700)}

function defaultProject(){return{id:'p'+Date.now(),name:lang==='tr'?'Yeni çalışma':'New project',type:'Article',purpose:'',rq:'',contribution:'',keywords:'',builders:{},tools:{},synthesis:[],diagnostics:[]}}
let projects=store.get('projects',[]);if(!projects.length){projects=[defaultProject()];store.set('projects',projects)}
let currentId=store.get('currentProject',projects[0].id);if(!projects.some(p=>p.id===currentId))currentId=projects[0].id;
const current=()=>projects.find(p=>p.id===currentId)||projects[0];
function saveProjects(){store.set('projects',projects);store.set('currentProject',currentId)}

async function loadProblems(){const paths=Array.from({length:12},(_,i)=>`data/problems-${String(i+1).padStart(2,'0')}.json`);const chunks=await Promise.all(paths.map(p=>fetch(p).then(r=>r.json())));PROBLEMS=chunks.flat()}

function applyTheme(){document.documentElement.dataset.theme=theme;$('#themeSelect').value=theme}
function applyLang(){document.documentElement.lang=lang;$$('[data-t]').forEach(e=>e.textContent=tx(e.dataset.t));$$('[data-ph]').forEach(e=>e.placeholder=tx(e.dataset.ph));$('#langSelect').value=lang;renderAll()}
function bindNav(){$$('[data-view]').forEach(b=>b.onclick=()=>showView(b.dataset.view))}
function showView(v){$$('.view').forEach(x=>x.classList.toggle('active',x.id===v));$$('.sidebar nav button').forEach(x=>x.classList.toggle('active',x.dataset.view===v));const m=VIEW_META[v];$('#viewTitle').textContent=lang==='tr'?({dashboard:'Çalışma Masası',guide:'Rehbere Sor',diagnose:'Tanıla',build:'Bölüm Kur',sources:'Kaynak & Atıf',toolkit:'25 Araç',publish:'Gönderim',books:'Kitaplar'}[v]||m[0]):m[0];$('#viewSub').textContent=m[1];window.scrollTo({top:0,behavior:'smooth'})}

function renderProjectSelect(){const s=$('#projectSelect');s.innerHTML=projects.map(p=>`<option value="${p.id}" ${p.id===currentId?'selected':''}>${esc(p.name)}</option>`).join('');s.onchange=()=>{currentId=s.value;saveProjects();renderAll()};$('#newProjectBtn').onclick=()=>{const p=defaultProject();projects.push(p);currentId=p.id;saveProjects();renderProjectSelect();openProjectDialog()};$$('[data-open-project]').forEach(b=>b.onclick=openProjectDialog)}
function openProjectDialog(){const p=current();$('#pName').value=p.name;$('#pType').value=p.type;$('#pPurpose').value=p.purpose;$('#pRQ').value=p.rq;$('#pContribution').value=p.contribution;$('#pKeywords').value=p.keywords;$('#projectDialog').showModal()}
$('#saveProjectBtn').addEventListener('click',e=>{e.preventDefault();const p=current();p.name=$('#pName').value.trim()||p.name;p.type=$('#pType').value;p.purpose=$('#pPurpose').value.trim();p.rq=$('#pRQ').value.trim();p.contribution=$('#pContribution').value.trim();p.keywords=$('#pKeywords').value.trim();saveProjects();$('#projectDialog').close();renderProjectSelect();renderAll();toast(lang==='tr'?'Proje kaydedildi':'Project saved')});

function renderDashboard(){const p=current();$('#dashProjectTitle').textContent=p.name||'—';$('#dashPurpose').textContent=p.purpose||'—';$('#dashRQ').textContent=p.rq||'—';$('#dashContribution').textContent=p.contribution||'—';$('#taskGrid').innerHTML=TASKS.map(t=>`<button class="task" data-task="${t.key}"><span>Guide ${t.problems}</span><b>${lang==='tr'?t.tr:t.en}</b><p>${lang==='tr'?t.descTr:t.descEn}</p></button>`).join('');$$('[data-task]').forEach(b=>b.onclick=()=>openTask(TASKS.find(t=>t.key===b.dataset.task)));let nm;if(!p