// Tareas - gestor simple con localStorage
const STORAGE_KEY = 'gestor_tareas_v1';

// Elementos
const tasksEl = document.getElementById('tasks');
const emptyState = document.getElementById('emptyState');
const taskModal = document.getElementById('taskModal');
const taskForm = document.getElementById('taskForm');
const modalTitle = document.getElementById('modalTitle');
const closeModal = document.getElementById('closeModal');
const newTaskBtn = document.getElementById('newTaskBtn');
const cancelBtn = document.getElementById('cancelBtn');
const taskIdInput = document.getElementById('taskId');

const searchInput = document.getElementById('search');
const filterCategory = document.getElementById('filterCategory');
const sortBy = document.getElementById('sortBy');
const clearAllBtn = document.getElementById('clearAll');
const viewFilter = document.getElementById('viewFilter');
const exportVisibleBtn = document.getElementById('exportVisible');
const exportAllBtn = document.getElementById('exportAll');
const themeSelect = document.getElementById('themeSelect');
const userBtn = document.getElementById('userBtn');
const userDropdown = document.getElementById('userDropdown');
const userNameEl = document.getElementById('userName');

// simple user store
const USER_KEY = 'gestor_user';
function loadUser(){
	try{ const raw = localStorage.getItem(USER_KEY); return raw? JSON.parse(raw): { name: 'Usuario', email: '' }; } catch(e){ return { name: 'Usuario', email: '' }; }
}
function saveUser(u){ localStorage.setItem(USER_KEY, JSON.stringify(u)); }
let currentUser = loadUser();
if(userNameEl) userNameEl.textContent = currentUser.name || 'Usuario';

if(userBtn){
	userBtn.addEventListener('click', (e)=>{
		e.stopPropagation();
		const open = userDropdown.getAttribute('aria-hidden') === 'false';
		userDropdown.setAttribute('aria-hidden', open? 'true':'false');
		userBtn.setAttribute('aria-expanded', open? 'false':'true');
	});
}

// user modal elements
const userModal = document.getElementById('userModal');
const userModalClose = document.getElementById('userModalClose');
const userSettingsForm = document.getElementById('userSettingsForm');
const userNameInput = document.getElementById('userNameInput');
const userEmailInput = document.getElementById('userEmailInput');
const currentPasswordInput = document.getElementById('currentPasswordInput');
const newPasswordInput = document.getElementById('newPasswordInput');
const saveNameBtn = document.getElementById('saveNameBtn');
const saveEmailBtn = document.getElementById('saveEmailBtn');
const savePasswordBtn = document.getElementById('savePasswordBtn');
const cancelLogoutBtn = document.getElementById('cancelLogoutBtn');
const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');

function openUserModal(section){
	if(!userModal) return;
	// prefill
	if(userNameInput) userNameInput.value = currentUser.name || '';
	if(userEmailInput) userEmailInput.value = currentUser.email || '';
	// show modal
	userModal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
	// select section
	[...userModal.querySelectorAll('.user-section')].forEach(el=> el.style.display = 'none');
	const target = userModal.querySelector(`.user-section[data-section="${section}"]`);
	if(target) target.style.display = '';
}

function closeUserModal(){ if(!userModal) return; userModal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }

if(userModalClose) userModalClose.addEventListener('click', closeUserModal);
// tab buttons inside modal
if(userModal){ userModal.querySelectorAll('.user-tabs .btn').forEach(b=>{ b.addEventListener('click', ()=>{ const s = b.dataset.section; [...userModal.querySelectorAll('.user-section')].forEach(el=> el.style.display='none'); const t = userModal.querySelector(`.user-section[data-section="${s}"]`); if(t) t.style.display=''; }); }); }

// Wire dropdown actions to open modal instead of prompt
if(userDropdown){
	userDropdown.addEventListener('click',(e)=>{
		e.stopPropagation();
		const btn = e.target.closest && e.target.closest('button[data-action]');
		if(!btn) return;
		const act = btn.dataset.action;
		if(act === 'changeName') openUserModal('name');
		else if(act === 'changeEmail') openUserModal('email');
		else if(act === 'changePassword') openUserModal('password');
		else if(act === 'logout') openUserModal('logout');
		// hide the dropdown after handling
		userDropdown.setAttribute('aria-hidden','true'); userBtn.setAttribute('aria-expanded','false');
	});
}



// close user dropdown when clicking outside
document.addEventListener('click',(e)=>{
	if(userDropdown && userBtn && !userBtn.contains(e.target) && !userDropdown.contains(e.target)){
		userDropdown.setAttribute('aria-hidden','true'); userBtn.setAttribute('aria-expanded','false');
	}
	// close user modal when clicking outside
	if(userModal && userModal.getAttribute('aria-hidden')==='false' && !userModal.querySelector('.modal-dialog').contains(e.target)){
		closeUserModal();
	}
});

// Save name
if(saveNameBtn){
	saveNameBtn.addEventListener('click', ()=>{
		const newName = (userNameInput && userNameInput.value || '').trim();
		if(!newName){ alert('Escribe un nombre válido'); return; }
		fetch('/api/user/update-name',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email: currentUser.email, newName }) })
		.then(r=>r.json()).then(j=>{
			if(j.ok){ currentUser.name = newName; saveUser(currentUser); if(userNameEl) userNameEl.textContent = newName; alert('Nombre actualizado'); closeUserModal(); }
			else alert(j.message || 'No se pudo actualizar el nombre');
		}).catch(err=>{ console.error(err); alert('Error al actualizar nombre'); });
	});
}

// Save email
if(saveEmailBtn){
	saveEmailBtn.addEventListener('click', ()=>{
		const newEmail = (userEmailInput && userEmailInput.value || '').trim();
		if(!newEmail || !newEmail.includes('@')){ alert('Escribe un correo válido'); return; }
		fetch('/api/user/update-email',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email: currentUser.email, newEmail }) })
		.then(r=>r.json()).then(j=>{
			if(j.ok){ currentUser.email = newEmail; saveUser(currentUser); alert('Correo actualizado'); closeUserModal(); }
			else alert(j.message || 'No se pudo actualizar el correo');
		}).catch(err=>{ console.error(err); alert('Error al actualizar correo'); });
	});
}

// Save password
if(savePasswordBtn){
	savePasswordBtn.addEventListener('click', ()=>{
		const cur = (currentPasswordInput && currentPasswordInput.value) || '';
		const nxt = (newPasswordInput && newPasswordInput.value) || '';
		if(!cur || !nxt){ alert('Completa la contraseña actual y la nueva'); return; }
		if(nxt.length < 6){ alert('La nueva contraseña debe tener al menos 6 caracteres'); return; }
		fetch('/api/user/update-password',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email: currentUser.email, currentPassword: cur, newPassword: nxt }) })
		.then(r=>r.json()).then(j=>{
			if(j.ok){ alert('Contraseña actualizada'); closeUserModal(); }
			else alert(j.message || 'No se pudo actualizar la contraseña');
		}).catch(err=>{ console.error(err); alert('Error al actualizar contraseña'); });
	});
}

// Logout confirm/cancel
if(cancelLogoutBtn) cancelLogoutBtn.addEventListener('click', ()=>{ openUserModal('name'); });
if(confirmLogoutBtn) confirmLogoutBtn.addEventListener('click', ()=>{
	// remove local user and redirect
	localStorage.removeItem(USER_KEY); closeUserModal(); window.location.href = '/index.html';
});

// Form fields
const titleInput = document.getElementById('title');
const descInput = document.getElementById('description');
const categoryInput = document.getElementById('category');
const priorityInput = document.getElementById('priority');
const startInput = document.getElementById('start');
const endInput = document.getElementById('end');
const newCategoryInput = document.getElementById('newCategoryInput');
const tagsInput = document.getElementById('tags');
const subtasksContainer = document.getElementById('subtasksContainer');
const newSubtaskInput = document.getElementById('newSubtaskInput');
const addSubtaskBtn = document.getElementById('addSubtaskBtn');
const recurrenceInput = document.getElementById('recurrence');
const completedSelect = document.getElementById('completedSelect');
const measurementType = document.getElementById('measurementType');
const targetValueInput = document.getElementById('targetValue');
const periodScope = document.getElementById('periodScope');

let tareas = [];
let categorias = ['entrenar','estudiar','jugar','descanso','aseo'];

function load() {
	try{
		const raw = localStorage.getItem(STORAGE_KEY);
		tareas = raw ? JSON.parse(raw) : [];
	}catch(e){tareas = []}
}

function save(){
	localStorage.setItem(STORAGE_KEY, JSON.stringify(tareas));
}

function formatDate(iso){
	if(!iso) return '';
	const d = new Date(iso);
	return d.toLocaleString();
}

function calcDuration(startIso,endIso){
	const a = new Date(startIso), b = new Date(endIso);
	const diff = b - a; if(isNaN(diff) || diff<0) return null;
	const mins = Math.floor(diff / 60000);
	const h = Math.floor(mins/60); const m = mins%60;
	return h>0 ? `${h}h ${m}m` : `${m}m`;
}

function render(){
	// aplicar filtros y orden
	let list = [...tareas];
	const q = searchInput.value.trim().toLowerCase();
	if(filterCategory.value !== 'all') list = list.filter(t => t.category === filterCategory.value);
	// filter by viewFilter (active/completed/all)
	if(viewFilter && viewFilter.value){
		if(viewFilter.value === 'active') list = list.filter(t => !t.completed);
		else if(viewFilter.value === 'completed') list = list.filter(t => t.completed);
	}
	if(q) list = list.filter(t => (t.title||'').toLowerCase().includes(q) || (t.description||'').toLowerCase().includes(q));
	switch(sortBy.value){
		case 'startAsc': list.sort((a,b)=> new Date(a.start)-new Date(b.start)); break;
		case 'startDesc': list.sort((a,b)=> new Date(b.start)-new Date(a.start)); break;
		default: list.sort((a,b)=> b.created - a.created);
	}

	tasksEl.innerHTML = '';
		if(!list.length){ emptyState.style.display = 'block'; return; }
	emptyState.style.display = 'none';

	for(const t of list){
		const card = document.createElement('article');
			card.className = 'task-card';
			card.dataset.id = t.id;
			if(t.completed) card.classList.add('completed');
			// prioridad visual
			if(t.priority) card.classList.add(`prio-${t.priority}`);
			card.setAttribute('draggable','true');
		const duration = calcDuration(t.start,t.end);
			// tags: show up to 3 chips and a +N more
			const allTags = t.tags || [];
			const visibleTags = allTags.slice(0,3);
			const moreCount = allTags.length - visibleTags.length;
			const tagsHtml = visibleTags.map(tag=>`<span class="tag">${escapeHtml(tag)}</span>`).join(' ')
				+ (moreCount>0 ? ` <span class="tag more" data-action="expand-tags" data-id="${t.id}">+${moreCount}</span>` : '');
			const subtasksHtml = (t.subtasks||[]).map((s,idx)=>`<div class="subtask"><input data-task="${t.id}" data-sub="${idx}" type="checkbox" ${s.done? 'checked':''}><div class="label">${escapeHtml(s.text)}</div></div>`).join('');
			// métricas y progreso
			const progress = calcProgress(t);
			const pct = Math.min(100, Math.round(progress*100));
			// description truncation
			const fullDesc = t.description || '';
			const isLong = fullDesc.length > 140;
			const descHtml = `<div class="task-desc ${isLong? 'truncated':''}">${escapeHtml(fullDesc)}</div>` + (isLong? `<span class="desc-more" data-action="expand-desc" data-id="${t.id}">Ver más</span>` : '');

			card.innerHTML = `
			<div class="task-head">
				<div>
					<div style="display:flex;gap:8px;align-items:center">
						<div class="task-title">${escapeHtml(t.title)}</div>
						<div class="priority-badge prio-${t.priority||'medium'}">${(t.priority||'medium').toUpperCase()}</div>
					</div>
						${descHtml}
						<div class="tags">${tagsHtml}</div>
				</div>
				<div class="task-actions">
						<button class="icon-btn" data-id="${t.id}" data-action="toggle">✔</button>
						<button class="icon-btn" data-id="${t.id}" data-action="edit">✎</button>
						<button class="icon-btn" data-id="${t.id}" data-action="delete">🗑</button>
				</div>
			</div>
			<div class="meta-row">
				<span class="tag">${t.category}</span>
				<span class="task-meta">Inicio: ${formatDate(t.start)}</span>
				<span class="task-meta">Fin: ${formatDate(t.end)}</span>
				<span class="task-meta">Duración: ${duration||'—'}</span>
				<span class="task-meta time-remaining">Quedan: ${formatTimeRemaining(t.start,t.end)}</span>
				<span class="task-meta">Medición: ${escapeHtml(t.measurementType || 'binary')}${t.targetValue? ' — objetivo: '+escapeHtml(String(t.targetValue)) : ''}${t.periodScope? ' ('+escapeHtml(t.periodScope)+')':''}</span>
			</div>
				<div class="subtasks-list">${subtasksHtml}</div>
				<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><div class="bar" style="width:${pct}%;"></div></div>
				<div class="metrics">
					<div><strong>${pct}%</strong> progreso</div>
					<div class="small">Cumplimiento: ${Math.round(getCompletionRate(t)*100)}%</div>
					<div class="small">Tiempo total: ${formatSeconds(totalLoggedSeconds(t))}</div>
				</div>
				<div style="display:flex;gap:8px;margin-top:8px">
					${(t.measurementType === 'daily') ? '' : `<button class="btn" data-action="logTime" data-id="${t.id}">+15 min</button>`}
				</div>
		`;

		tasksEl.appendChild(card);
	}

	// after appending all, highlight and scroll first visible
	const first = tasksEl.querySelector('.task-card');
	if(first){
		first.classList.add('highlight');
		first.scrollIntoView({behavior:'smooth', block:'center'});
		setTimeout(()=> first.classList.remove('highlight'), 1800);
	}

	// Update progress visuals after rendering
	updateProgressUI();
	updateProgressUI();
}

	// métricas: logs, tiempo y counters
	function ensureMetricsFields(task){
		task.logs = task.logs || [];
		task.totalSeconds = task.totalSeconds || 0; // acumulado en seconds
		task.count = task.count || 0; // repeticiones realizadas
	}

	function totalLoggedSeconds(task){ ensureMetricsFields(task); return task.totalSeconds || 0; }

	function startOfPeriod(ts, scope){
		const d = new Date(ts);
		if(scope === 'week'){
			// Monday as first day
			const day = d.getDay() || 7; // Sunday->7
			const diff = d.getDate() - day + 1;
			return new Date(d.getFullYear(), d.getMonth(), diff).setHours(0,0,0,0);
		}
		if(scope === 'month'){
			return new Date(d.getFullYear(), d.getMonth(), 1).setHours(0,0,0,0);
		}
		if(scope === 'year'){
			return new Date(d.getFullYear(), 0, 1).setHours(0,0,0,0);
		}
		return new Date().setHours(0,0,0,0);
	}

	function sumLogsInPeriod(task, scope){
		ensureMetricsFields(task);
		const start = startOfPeriod(Date.now(), scope);
		return (task.logs||[]).filter(l=> new Date(l.ts).getTime() >= start).reduce((s,l)=>{
			if(l.seconds) return s + (l.seconds||0);
			return s;
		}, 0);
	}

	function formatTimeRemaining(startIso,endIso){
		if(!endIso) return '—';
		const now = Date.now();
		const end = new Date(endIso).getTime();
		if(isNaN(end)) return '—';
		const diff = end - now;
		if(diff <= 0) return '0d 0h';
		const days = Math.floor(diff / (24*3600*1000));
		const hours = Math.floor((diff % (24*3600*1000)) / (3600*1000));
		const mins = Math.floor((diff % (3600*1000)) / (60*1000));
		if(days > 0) return `${days}d ${hours}h`;
		if(hours > 0) return `${hours}h ${mins}m`;
		return `${mins}m`;
	}

	function formatSeconds(s){ const h = Math.floor(s/3600); const m = Math.floor((s%3600)/60); if(h>0) return `${h}h ${m}m`; return `${m}m`; }

	function getCompletionRate(task){ // tasa de cumplimiento = completadas/subtasks o 0..1
		if(task.subtasks && task.subtasks.length) return task.subtasks.filter(s=>s.done).length / task.subtasks.length;
		return task.completed? 1 : 0;
	}

	function calcProgress(task){
		ensureMetricsFields(task);
		const type = task.measurementType || 'binary';
		const target = Number(task.targetValue) || 0;
		// Helper to clamp 0..1
		const clamp01 = v => Math.max(0, Math.min(1, v));
		// Binary: prefer subtasks ratio, then time-based if start/end present, else completed flag
		if(type === 'binary'){
			if(task.subtasks && task.subtasks.length) return clamp01(task.subtasks.filter(s=>s.done).length / task.subtasks.length);
			// If start/end present, use day-based progression (discrete per day)
			if(task.start && task.end){
				const sDate = new Date(task.start);
				const eDate = new Date(task.end);
				if(!isNaN(sDate) && !isNaN(eDate) && eDate.getTime() >= sDate.getTime()){
					// normalize to midnight to count full days
					const toMidnight = d => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
					const sMid = toMidnight(sDate);
					const eMid = toMidnight(eDate);
					const nowMid = toMidnight(new Date());
					const totalDays = Math.max(1, Math.floor((eMid - sMid) / (24*3600*1000)) + 1);
					if(nowMid < sMid) return 0; // not started yet
					const daysPassed = Math.floor((Math.min(nowMid, eMid) - sMid) / (24*3600*1000)) + 1;
					return clamp01(daysPassed / totalDays);
				}
			}
			return task.completed ? 1 : 0;
		}

		// Daily: days-with-logs / totalDays
		if(type === 'daily'){
			// If logs of type 'day' exist, use unique days logged; otherwise use calendar days between start and end
			const dayLogs = new Set((task.logs||[]).filter(l=> l.type==='day').map(l=> new Date(l.ts).toDateString()));
			if(dayLogs.size) return clamp01(dayLogs.size / (target>0? target : Math.max(1, dayLogs.size)));
			if(task.start && task.end){
				const s = new Date(task.start); const e = new Date(task.end);
				const totalDays = Math.max(1, Math.floor((new Date(e.getFullYear(), e.getMonth(), e.getDate()).getTime() - new Date(s.getFullYear(), s.getMonth(), s.getDate()).getTime())/(24*3600*1000)) + 1);
				const nowMid = new Date(); const daysPassed = Math.max(0, Math.min(totalDays, Math.floor((new Date(nowMid.getFullYear(), nowMid.getMonth(), nowMid.getDate()).getTime() - new Date(s.getFullYear(), s.getMonth(), s.getDate()).getTime())/(24*3600*1000)) + 1));
				return clamp01(daysPassed / totalDays);
			}
			return task.completed? 1:0;
		}

		// Hours: total logged seconds / (target hours)
		if(type === 'hours'){
			// Use totalLoggedSeconds or period-scoped logged seconds if periodScope is set
			const scope = task.periodScope || period || 'week';
			const secs = (task.periodScope || task.measurementType==='hours') ? sumLogsInPeriod(task, scope) : totalLoggedSeconds(task);
			if((Number(task.targetValue)||target) <= 0) return clamp01(secs > 0 ? 0.5 : 0);
			const targetHours = Number(task.targetValue)||target;
			return clamp01((secs/3600) / targetHours);
		}

		// periodGoal / repeatX: count / target
		if(type === 'periodGoal' || type === 'repeatX'){
			// For period-based goals, consider counts in current period
			const scope = task.periodScope || period || 'week';
			let achieved = 0;
			if(type === 'periodGoal'){
				// if logs carry "count" entries, sum them; otherwise use task.count
				achieved = (task.count||0) + (task.logs||[]).filter(l=> l.type==='count' && new Date(l.ts).getTime() >= startOfPeriod(Date.now(), scope)).length;
			}
			if(type === 'repeatX'){
				achieved = task.count || 0;
			}
			const tgt = Number(task.targetValue) || target;
			if(tgt <= 0) return clamp01(achieved > 0 ? 0.5 : 0);
			return clamp01(achieved / tgt);
		}

		return 0;
	}

	// Update only the progress bars and related small metrics in the DOM without full re-render
	function updateProgressUI(){
		try{
			if(!tareas || !tareas.length) return;
			const toComplete = [];
			for(const t of tareas){
				const card = document.querySelector(`.task-card[data-id="${t.id}"]`);
				if(!card) continue;
				const progress = calcProgress(t);
				const pct = Math.min(100, Math.round(progress*100));
				const bar = card.querySelector('.progress .bar');
				const progressRoot = card.querySelector('.progress');
				if(bar) bar.style.width = pct + '%';
				if(progressRoot) progressRoot.setAttribute('aria-valuenow', pct);
				const pctStrong = card.querySelector('.metrics strong');
				if(pctStrong) pctStrong.textContent = pct + '%';
				const smalls = card.querySelectorAll('.metrics .small');
				if(smalls && smalls.length>0){
					// cumplimiento
					if(smalls[0]) smalls[0].textContent = 'Cumplimiento: ' + Math.round(getCompletionRate(t)*100) + '%';
					if(smalls[1]) smalls[1].textContent = 'Tiempo total: ' + formatSeconds(totalLoggedSeconds(t));
				}
				// update time remaining display
				const tr = card.querySelector('.time-remaining'); if(tr) tr.textContent = 'Quedan: ' + formatTimeRemaining(t.start, t.end);
				// if progress reached 100% and task not yet marked completed and it has start/end, consider auto-complete
				if(pct >= 100 && !t.completed && t.start && t.end){
					// ensure this progress is the time-based one (binary without subtasks)
					const type = t.measurementType || 'binary';
					if(type === 'binary') toComplete.push(t.id);
				}
			}
			if(toComplete.length){
				// mark them completed and save once
				for(const id of toComplete){ const tt = tareas.find(x=> x.id===id); if(tt){ tt.completed = true; tt.completedAt = Date.now(); tt.logs = tt.logs || []; tt.logs.push({ ts: Date.now(), type:'auto', text: 'Autocompletada por fecha' }); } }
				save(); render();
			}
		}catch(e){ console.error('Error updating progress UI', e); }
	}

	// Periodically refresh progress visuals so time-based progress advances
	setInterval(()=>{
		updateProgressUI();
	}, 15000);


// escapado simple para evitar HTML injection
function escapeHtml(s){ return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

// eventos
newTaskBtn.addEventListener('click', ()=> openModal());
closeModal.addEventListener('click', ()=> closeModalFn());
cancelBtn.addEventListener('click', ()=> closeModalFn());
taskModal.addEventListener('click', (e)=>{ if(e.target===taskModal) closeModalFn(); });

taskForm.addEventListener('submit', (e)=>{
	e.preventDefault();
	try{
		if(!taskForm){ console.error('taskForm not found'); return; }
	const id = taskIdInput.value;
	const title = titleInput.value.trim();
	const desc = descInput.value.trim();
	const category = categoryInput.value;
	const priority = priorityInput.value;
	const start = startInput.value;
	const end = endInput.value;
	const tags = tagsInput.value.split(',').map(s=>s.trim()).filter(Boolean);
	const subtasks = [...subtasksContainer.querySelectorAll('.subtask')].map(s=>({ text: s.querySelector('.label').textContent, done: s.querySelector('input') && s.querySelector('input').checked }));
	const recurrence = recurrenceInput.value;
	const completed = completedSelect.value === 'true';
	const mType = (typeof measurementType !== 'undefined' && measurementType && measurementType.value) ? measurementType.value : 'binary';
	const targetValue = (typeof targetValueInput !== 'undefined' && targetValueInput && targetValueInput.value) ? targetValueInput.value : '';
	const period = (typeof periodScope !== 'undefined' && periodScope && periodScope.value) ? periodScope.value : 'week';

	// validation: for daily, start/end required; for other types, start/end optional but if provided must be valid
	if(!title){ alert('Completa el título'); return; }
	if(mType === 'daily'){
		if(!start || !end){ alert('Completa inicio y fin para tareas diarias'); return; }
		const dur = calcDuration(start,end); if(dur===null){ alert('La hora de fin debe ser posterior a la de inicio'); return; }
	} else {
		if(start && end){ const dur = calcDuration(start,end); if(dur===null){ alert('La hora de fin debe ser posterior a la de inicio'); return; } }
	}
	// if measurement requires a target, validate it
	if((mType === 'hours' || mType === 'periodGoal' || mType === 'repeatX') && !(targetValue && !isNaN(Number(targetValue)) && Number(targetValue) > 0)){
		alert('Define un valor objetivo válido para el tipo de medición seleccionado'); return;
	}

	if(id){
		// editar
		const idx = tareas.findIndex(x=> x.id===id);
		if(idx>-1){
					tareas[idx] = {...tareas[idx], title, description:desc, category, priority, start, end, tags, subtasks, recurrence, completed, measurementType:mType, targetValue, periodScope:period };
		}
	}else{
		const item = { id: cryptoRandomId(), title, description:desc, category, priority, start, end, created: Date.now(), tags, subtasks, recurrence, completed, measurementType:mType, targetValue, periodScope:period, logs:[], totalSeconds:0, count:0 };
		tareas.push(item);
	}
	save(); render(); closeModalFn(); taskForm.reset();
	}catch(err){
		console.error('Error saving task', err);
		alert('Ocurrió un error al guardar la tarea. Revisa la consola.');
	}
});

tasksEl.addEventListener('click',(e)=>{
	const btn = e.target.closest('button');
	const actionEl = e.target.closest('[data-action]');
	// checkbox subtarea
	if(e.target && e.target.matches('input[type="checkbox"]') && e.target.dataset.task){
		const tid = e.target.dataset.task; const sidx = Number(e.target.dataset.sub);
		const tt = tareas.find(x=> x.id===tid); if(!tt) return;
		tt.subtasks = tt.subtasks || [];
		tt.subtasks[sidx].done = e.target.checked;
		save(); render();
		return;
	}
	if(actionEl && actionEl.dataset.action){
		const act = actionEl.dataset.action; const aid = actionEl.dataset.id;
		if(act === 'expand-desc'){
			const card = actionEl.closest('.task-card'); if(!card) return;
			const desc = card.querySelector('.task-desc'); const more = actionEl;
			if(desc.classList.contains('truncated')){ desc.classList.remove('truncated'); more.textContent = 'Ver menos'; } else { desc.classList.add('truncated'); more.textContent = 'Ver más'; }
			return;
		}
		if(act === 'expand-tags'){
			const tid = aid; const t = tareas.find(x=> x.id===tid); if(!t) return;
			const card = actionEl.closest('.task-card'); const tagContainer = card.querySelector('.tags'); tagContainer.innerHTML = (t.tags||[]).map(tag=>`<span class="tag">${escapeHtml(tag)}</span>`).join(' ');
			return;
		}
	}
	if(!btn) return;
	const id = btn.dataset.id; const action = btn.dataset.action;
	if(action==='logTime'){
		const t = tareas.find(x=> x.id===id); if(!t) return;
		// don't allow adding time to daily-measured tasks
		if(t.measurementType === 'daily'){
			// silently ignore or inform user
			console.warn('No se puede sumar tiempo a tareas de tipo diaria');
			return;
		}
		// sumamos 15 minutos como ejemplo
		ensureMetricsFields(t);
		// record time both in total and as a period log
		t.totalSeconds = (t.totalSeconds||0) + 15*60;
		t.logs.push({ ts: Date.now(), type:'time', seconds:15*60, text: '+15 min' });
		save(); render(); return;
	}


	if(action==='delete'){
		if(confirm('Eliminar tarea?')){ tareas = tareas.filter(t=> t.id!==id); save(); render(); }
	}else if(action==='edit'){
		const t = tareas.find(x=> x.id===id); if(!t) return;
		openModal(t);
	}else if(action==='toggle'){
		const t = tareas.find(x=> x.id===id); if(!t) return;
		t.completed = !t.completed; t.completedAt = t.completed? Date.now(): null; save(); render();
	}
});

searchInput.addEventListener('input', ()=> render());
filterCategory.addEventListener('change', ()=> render());
sortBy.addEventListener('change', ()=> render());
clearAllBtn.addEventListener('click', ()=>{ if(confirm('Eliminar todas las tareas?')){ tareas=[]; save(); render(); } });
viewFilter.addEventListener('change', ()=> render());

// drag & drop para reordenar
tasksEl.addEventListener('dragstart',(e)=>{
	const art = e.target.closest('.task-card'); if(!art) return;
	e.dataTransfer.setData('text/plain', Array.from(tasksEl.children).indexOf(art));
	art.classList.add('dragging');
});
tasksEl.addEventListener('dragend',(e)=>{ const a = e.target.closest('.task-card'); if(a) a.classList.remove('dragging'); });
tasksEl.addEventListener('dragover',(e)=>{ e.preventDefault(); const after = getDragAfterElement(tasksEl,e.clientY); const dragging = document.querySelector('.dragging'); if(!dragging) return; if(after==null) tasksEl.appendChild(dragging); else tasksEl.insertBefore(dragging, after); });
function getDragAfterElement(container,y){ const draggableElements = [...container.querySelectorAll('.task-card:not(.dragging)')]; return draggableElements.reduce((closest,child)=>{ const box = child.getBoundingClientRect(); const offset = y - box.top - box.height/2; if(offset<0 && offset>closest.offset) return {offset,element:child}; else return closest; },{offset:-Infinity}).element; }

// categorías dinámicas
function populateCategories(){
	filterCategory.innerHTML = '<option value="all">Todas</option>' + categorias.map(c=>`<option value="${c}">${c}</option>`).join('');
	categoryInput.innerHTML = categorias.map(c=>`<option value="${c}">${c}</option>`).join('');
}
newCategoryInput.addEventListener('keydown',(e)=>{ if(e.key==='Enter'){ e.preventDefault(); const v=newCategoryInput.value.trim(); if(v && !categorias.includes(v)){ categorias.push(v); populateCategories(); newCategoryInput.value=''; } } });

// subtareas
addSubtaskBtn.addEventListener('click', ()=>{ const t = newSubtaskInput.value.trim(); if(!t) return; const div = document.createElement('div'); div.className='subtask'; div.innerHTML = `<input type="checkbox"><div class="label">${escapeHtml(t)}</div>`; subtasksContainer.appendChild(div); newSubtaskInput.value=''; });

// export ICS (simplificado)
function toICS(items){
	const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//GestorTareas//EN'];
	for(const t of items){
		const uid = t.id + '@gestor';
		const dtstart = new Date(t.start).toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
		const dtend = new Date(t.end).toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
		lines.push('BEGIN:VEVENT');
		lines.push(`UID:${uid}`);
		lines.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').split('.')[0]}Z`);
		lines.push(`DTSTART:${dtstart}`);
		lines.push(`DTEND:${dtend}`);
		lines.push(`SUMMARY:${t.title}`);
		lines.push(`DESCRIPTION:${t.description||''}`);
		lines.push('END:VEVENT');
	}
	lines.push('END:VCALENDAR');
	return lines.join('\r\n');
}
exportVisibleBtn.addEventListener('click', ()=>{ const blob = new Blob([toICS(tareas)],{type:'text/calendar'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='tareas.ics'; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000); });
exportAllBtn.addEventListener('click', ()=>{ const blob = new Blob([toICS(tareas)],{type:'text/calendar'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='todas_tareas.ics'; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000); });

// temas
themeSelect.addEventListener('change', ()=>{ document.documentElement.setAttribute('data-theme', themeSelect.value==='dark'?'dark':''); });

function openModal(task){
	taskModal.setAttribute('aria-hidden','false');
	document.body.style.overflow = 'hidden';
	setTimeout(()=>{ titleInput.focus(); }, 80);
	if(task){
		modalTitle.textContent = 'Editar tarea';
		taskIdInput.value = task.id;
		titleInput.value = task.title;
		descInput.value = task.description || '';
		categoryInput.value = task.category;
		priorityInput.value = task.priority || 'medium';
			startInput.value = task.start;
			endInput.value = task.end;
			tagsInput.value = (task.tags||[]).join(', ');
			subtasksContainer.innerHTML = '';
			(task.subtasks||[]).forEach(s=>{ const div = document.createElement('div'); div.className='subtask'; div.innerHTML = `<input type="checkbox" ${s.done? 'checked':''}><div class="label">${escapeHtml(s.text)}</div>`; subtasksContainer.appendChild(div); });
			recurrenceInput.value = task.recurrence || 'none';
			completedSelect.value = task.completed? 'true':'false';
			// measurement fields
			if(measurementType) measurementType.value = task.measurementType || 'binary';
			if(targetValueInput) targetValueInput.value = task.targetValue || '';
			if(periodScope) periodScope.value = task.periodScope || 'week';
	}else{
		modalTitle.textContent = 'Nueva tarea'; taskIdInput.value = '';
		taskForm.reset();
		// prefill start con ahora
		const now = new Date(); now.setMinutes(Math.ceil(now.getMinutes()/5)*5);
		startInput.value = now.toISOString().slice(0,16);
		const later = new Date(now.getTime() + 60*60*1000);
		endInput.value = later.toISOString().slice(0,16);
		if(measurementType) measurementType.value = 'binary';
		if(targetValueInput) targetValueInput.value = '';
		if(periodScope) periodScope.value = 'week';
	}
}

function updateModalFieldsVisibility(){
	const mt = measurementType && measurementType.value ? measurementType.value : 'binary';
	// if daily, ensure start/end visible and target hidden
	if(mt === 'daily'){
		if(startInput) startInput.parentElement.style.display = '';
		if(endInput) endInput.parentElement.style.display = '';
		if(targetValueInput) targetValueInput.parentElement.style.display = 'none';
		if(periodScope) periodScope.parentElement.style.display = 'none';
	} else if(mt === 'hours'){
		if(startInput) startInput.parentElement.style.display = '';
		if(endInput) endInput.parentElement.style.display = '';
		if(targetValueInput) targetValueInput.parentElement.style.display = '';
		if(periodScope) periodScope.parentElement.style.display = '';
	} else if(mt === 'periodGoal' || mt === 'repeatX'){
		if(startInput) startInput.parentElement.style.display = '';
		if(endInput) endInput.parentElement.style.display = '';
		if(targetValueInput) targetValueInput.parentElement.style.display = '';
		if(periodScope) periodScope.parentElement.style.display = '';
	} else {
		// binary or other
		if(startInput) startInput.parentElement.style.display = '';
		if(endInput) endInput.parentElement.style.display = '';
		if(targetValueInput) targetValueInput.parentElement.style.display = '';
		if(periodScope) periodScope.parentElement.style.display = '';
	}
}

if(measurementType){ measurementType.addEventListener('change', updateModalFieldsVisibility); }

function closeModalFn(){ taskModal.setAttribute('aria-hidden','true'); }

// ensure body scroll restored and escape key closes modal
document.addEventListener('keydown',(e)=>{
	if(e.key==='Escape'){
		if(taskModal.getAttribute('aria-hidden')==='false'){
			closeModalFn();
		}
	}
});

// restore scroll when modal closes
const observer = new MutationObserver(()=>{
	if(taskModal.getAttribute('aria-hidden')==='true') document.body.style.overflow = '';
});
observer.observe(taskModal,{attributes:true});

function cryptoRandomId(){ return Math.random().toString(36).slice(2,9); }

// init
load(); populateCategories(); render();

