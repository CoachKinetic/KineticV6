import { APP, SKILLS, BELT_COLORS, BELT_LEVELS, ini } from './firebase-config.js';

export function dirHome(){
  const pending=(APP.subRequests||[]).filter(r=>r.status==='pending').length;
  const tcP=(APP.allTimecards||[]).filter(t=>t.status==='pending').length;
  const injP=(APP.allInjuries||[]).filter(i=>i.status==='pending').length;
  const rev=APP.allAthletes.reduce((s,a)=>s+(a.tuitionAmount||185),0);
  return `
  <div class="stats4">
    <div class="stat" onclick="window.K.nav('dirAthletes')"><div class="si">👧</div><div class="sl">Athletes</div><div class="sv">${APP.allAthletes.length}</div></div>
    <div class="stat" onclick="window.K.nav('dirCoaches')"><div class="si">🧑‍🏫</div><div class="sl">Coaches</div><div class="sv">${APP.allCoaches.length}</div></div>
    <div class="stat"><div class="si">💰</div><div class="sl">Monthly Revenue</div><div class="sv gold">$${rev.toLocaleString()}</div></div>
    <div class="stat" onclick="window.K.nav('dirSched')"><div class="si">📅</div><div class="sl">Classes</div><div class="sv">${APP.allClasses.length}</div></div>
  </div>
  <div class="g2">
    <div>
      <div class="sec-hdr"><h3>Today's Classes</h3><button class="slink" onclick="window.K.nav('dirSched')">Full Schedule →</button></div>
      ${APP.allClasses.length===0?`<div class="card"><div style="padding:24px;text-align:center;color:var(--t3);">No classes yet. <button class="slink" onclick="window.K.openModal('addClassModal')">Add one →</button></div></div>`
      :APP.allClasses.slice(0,4).map(c=>`<div class="class-card" style="margin-bottom:8px;" onclick="window.K.openModal('classModal',{classId:'${c.id}'})">
        <div style="display:flex;justify-content:space-between;"><div class="cn">${c.name}</div><span class="pill gold-p">${c.time}</span></div>
        <div class="cm" style="margin-top:6px;"><span>🧑‍🏫 ${c.coachName||'TBD'}</span><span>👧 ${(c.athletes||[]).length}/${c.cap||8}</span><span>📅 ${c.day}</span></div>
      </div>`).join('')}
    </div>
    <div>
      ${(APP.coachConcerns||[]).length>0?`
  <div class="sec-hdr" style="margin-top:0;"><h3 style="color:var(--red);">⚠️ Coach Concerns</h3></div>
  ${(APP.coachConcerns||[]).slice(0,3).map(n=>{
    const cls=APP.allClasses.find(c=>c.id===n.classId);
    const coach=APP.allCoaches.find(c=>c.id===n.coachId)||{name:n.coachId||'Coach'};
    const ds=n.date?new Date(n.date).toLocaleDateString('en-US',{month:'short',day:'numeric'}):'';
    return `<div class="alert warn" style="display:block;">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
        <strong>${coach.name||'Coach'}</strong><span style="font-size:11px;color:var(--t3);">${ds} · ${cls?.name||'Class'}</span>
      </div>
      <div style="font-size:13px;">${n.issueNotes}</div>
    </div>`;
  }).join('')}`:''}
  ${pending>0||tcP>0||injP>0?`<div class="sec-hdr"><h3>Action Required</h3></div>
      ${pending>0?`<div class="alert warn" style="cursor:pointer;" onclick="window.K.nav('dirSubs')">🔄 <strong>${pending} sub request${pending>1?'s':''}</strong> need your approval</div>`:''}
      ${tcP>0?`<div class="alert warn" style="cursor:pointer;" onclick="window.K.nav('dirTimecards')">⏱️ <strong>${tcP} timecard${tcP>1?'s':''}</strong> pending approval</div>`:''}
      ${injP>0?`<div class="alert danger" style="cursor:pointer;" onclick="window.K.nav('dirInjuries')">🚑 <strong>${injP} injury report${injP>1?'s':''}</strong> need review</div>`:''}
      `:''}
      <div class="sec-hdr" style="margin-top:8px;"><h3>Quick Actions</h3></div>
      <div class="g2">
        <div class="tile" onclick="window.K.openModal('inviteModal',{type:'coach'})"><div class="ti">🧑‍🏫</div><div class="tl">Invite Coach</div></div>
        <div class="tile" onclick="window.K.openModal('addAthModal')"><div class="ti">👧</div><div class="tl">Add Athlete</div></div>
        <div class="tile" onclick="window.K.openModal('addClassModal')"><div class="ti">📅</div><div class="tl">Add Class</div></div>
        <div class="tile" onclick="window.K.openModal('inviteModal',{type:'parent'})"><div class="ti">👪</div><div class="tl">Invite Parent</div></div>
      </div>
    </div>
  </div>`;
}

export function dirSched(){
  const days=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  return `
  <div class="sec-hdr"><h3>Schedule</h3><button class="btn primary" onclick="window.K.openModal('addClassModal')">+ Add Class</button></div>
  <div class="stats3">
    <div class="stat"><div class="sl">Total Classes</div><div class="sv">${APP.allClasses.length}</div></div>
    <div class="stat" onclick="window.K.nav('dirSubs')"><div class="sl">Sub Requests</div><div class="sv gold">${(APP.subRequests||[]).filter(r=>r.status==='pending').length}</div></div>
    <div class="stat"><div class="sl">Open on Board</div><div class="sv">${(APP.subRequests||[]).filter(r=>r.status==='open').length}</div></div>
  </div>
  ${days.map(day=>{
    const dc=APP.allClasses.filter(c=>c.day===day);
    return `<div style="margin-bottom:16px;">
      <div style="font-family:'Barlow Condensed',sans-serif;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--gold);opacity:0.7;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid var(--bdr);">${day}</div>
      ${dc.length===0?`<div style="font-size:13px;color:var(--t3);">No classes — <button class="slink" onclick="window.K.openModal('addClassModal',{day:'${day}'})">+ Add one</button></div>`
      :`<div class="g3">${dc.map(c=>`<div class="class-card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div onclick="window.K.openModal('classModal',{classId:'${c.id}'})" style="flex:1;cursor:pointer;">
            <div class="cn">${c.name}</div>
            <div class="cm" style="margin-top:6px;"><span>🧑‍🏫 ${c.coachName||'TBD'}</span><span>👧 ${(c.athletes||[]).length}/${c.cap||8}</span></div>
          </div>
          <button class="btn" style="font-size:10px;padding:4px 8px;margin-left:8px;flex-shrink:0;" onclick="window.K.openModal('editClassModal',{classId:'${c.id}'})">Edit</button>
        </div>
        <div style="display:flex;align-items:center;gap:8px;margin-top:8px;"><div class="prog-bar"><div class="prog-fill" style="width:${Math.min(100,Math.round((c.athletes||[]).length/(c.cap||8)*100))}%"></div></div><span style="font-size:11px;color:var(--t3);">${Math.min(100,Math.round((c.athletes||[]).length/(c.cap||8)*100))}%</span></div>
      </div>`).join('')}</div>`}
    </div>`;
  }).join('')}`;
}

export function dirAthletes(tab='active'){
  const active=APP.allAthletes||[];
  const archived=APP.archivedAthletes||[];
  const showArch=tab==='archived';
  return `
  <div class="sec-hdr">
    <div style="display:flex;">
      <button onclick="window.K.nav('dirAthletes')" style="padding:8px 18px;font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;border:1px solid var(--bdr);border-right:none;border-radius:4px 0 0 4px;background:${!showArch?'var(--gold)':'var(--panel)'};color:${!showArch?'#1C1C1C':'var(--t2)'};">Active (${active.length})</button>
      <button onclick="window.K.nav('dirAthletes_arch')" style="padding:8px 18px;font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;border:1px solid var(--bdr);border-radius:0 4px 4px 0;background:${showArch?'var(--gold)':'var(--panel)'};color:${showArch?'#1C1C1C':'var(--t2)'};">Archived (${archived.length})</button>
    </div>
    ${!showArch?`<button class="btn primary" onclick="window.K.openModal('addAthModal')">+ Add Athlete</button>`:''}
  </div>
  ${showArch
    ? archived.length===0
      ? `<div class="card"><div style="padding:40px;text-align:center;color:var(--t3);"><div style="font-size:44px;margin-bottom:12px;">📦</div><h3 style="font-weight:800;font-size:18px;margin-bottom:8px;">No archived athletes</h3><p>Archived athletes appear here. Their data is fully preserved.</p></div></div>`
      : `<div class="card"><div class="card-body"><table class="table">
          <thead><tr><th>Athlete</th><th>Level</th><th>Parent</th><th>Archived</th><th>Action</th></tr></thead>
          <tbody>${archived.map(a=>`<tr>
            <td><div class="name-cell"><div class="mini-av">${ini(a.name)}</div>${a.name}</div></td>
            <td><div class="belt-b"><div class="belt-d" style="background:${BELT_COLORS[a.level]||'#E8C84A'};"></div>${a.level||'Level 1'}</div></td>
            <td style="font-size:12px;color:var(--t3);">${a.parentEmail||'—'}</td>
            <td style="font-size:12px;color:var(--t3);">${a.archivedAt?new Date(a.archivedAt).toLocaleDateString():'—'}</td>
            <td><button class="btn primary" style="font-size:10px;padding:4px 10px;" onclick="window.K.unarchiveAthlete('${a.id}')">Restore</button></td>
          </tr>`).join('')}</tbody>
        </table></div></div>`
    : active.length===0
      ? `<div class="card"><div style="padding:40px;text-align:center;"><div style="font-size:44px;margin-bottom:12px;">👧</div><h3 style="font-weight:800;font-size:18px;margin-bottom:8px;">No athletes yet</h3><p style="font-size:14px;color:var(--t2);margin-bottom:16px;">Add athletes to start tracking skills and tuition.</p><button class="btn primary" onclick="window.K.openModal('addAthModal')">+ Add First Athlete</button></div></div>`
      : `<div class="card"><div class="card-body"><table class="table">
          <thead><tr><th>Athlete</th><th>Level</th><th>Classes</th><th>Parent</th><th>Tuition</th><th>Actions</th></tr></thead>
          <tbody>${active.map(a=>{
            const cls=APP.allClasses.filter(c=>(c.athletes||[]).includes(a.id));
            return `<tr>
              <td><div class="name-cell"><div class="mini-av">${ini(a.name)}</div>${a.name}</div></td>
              <td><div class="belt-b"><div class="belt-d" style="background:${BELT_COLORS[a.level]||'#E8C84A'};"></div>${a.level||'Level 1'}</div></td>
              <td style="font-size:12px;color:var(--t2);">${cls.length?cls.map(c=>c.name).join(', '):'None'}</td>
              <td style="font-size:12px;color:var(--t3);">${a.parentEmail||'—'}</td>
              <td><span class="pill ${a.tuitionStatus==='paid'?'present':a.tuitionStatus==='overdue'?'absent':'gold-p'}">$${a.tuitionAmount||185}/mo</span></td>
              <td style="white-space:nowrap;">
                <button class="btn" style="font-size:10px;padding:4px 8px;margin-right:4px;" onclick="window.K.openModal('editAthModal',{id:'${a.id}'})">Edit</button>
                <button class="btn" style="font-size:10px;padding:4px 8px;margin-right:4px;" onclick="window.K.openModal('viewAthModal',{id:'${a.id}'})">View</button>
                <button class="btn" style="font-size:10px;padding:4px 8px;color:var(--red);border-color:rgba(155,58,47,0.3);" onclick="window.K.archiveAthlete('${a.id}','${a.name}')">Archive</button>
              </td>
            </tr>`;
          }).join('')}</tbody>
        </table></div></div>`}`;
}

export function dirCoaches(){
  return `
  <div class="sec-hdr"><h3>Coaching Staff — ${APP.allCoaches.length} coaches</h3>
    <button class="btn primary" onclick="window.K.openModal('inviteModal',{type:'coach'})">+ Invite Coach</button>
  </div>
  ${APP.allCoaches.length===0
    ?`<div class="card"><div style="padding:40px;text-align:center;"><div style="font-size:44px;margin-bottom:12px;">🧑‍🏫</div><h3 style="font-weight:800;font-size:18px;margin-bottom:8px;">No coaches yet</h3><button class="btn primary" onclick="window.K.openModal('inviteModal',{type:'coach'})">+ Invite First Coach</button></div></div>`
    :`<div class="card"><div class="card-body"><table class="table">
      <thead><tr><th>Coach</th><th>Belt</th><th>Classes</th><th>Status</th></tr></thead>
      <tbody>${APP.allCoaches.map(c=>{
        const cc=APP.allClasses.filter(cl=>(cl.coaches||[]).includes(c.id)||cl.coachId===c.id);
        return `<tr>
          <td><div class="name-cell"><div class="mini-av">${ini(c.name)}</div><div><div>${c.name}</div><div style="font-size:11px;color:var(--t3);">${c.email||''}</div></div></div></td>
          <td><div class="belt-b"><div class="belt-d" style="background:${BELT_COLORS[c.belt||'Foundation']};"></div>${c.belt||'Foundation'}</div></td>
          <td>${cc.length}</td>
          <td><span class="pill present">Active</span></td>
        </tr>`;
      }).join('')}</tbody>
    </table></div></div>`}`;
}

export function dirTimecards(){
  const all=APP.allTimecards||[];
  return `
  <div class="sec-hdr"><h3>Timecards</h3></div>
  <div class="stats3">
    <div class="stat"><div class="sl">Pending Approval</div><div class="sv gold">${all.filter(t=>t.status==='pending').length}</div></div>
    <div class="stat"><div class="sl">Approved</div><div class="sv">${all.filter(t=>t.status==='approved').length}</div></div>
    <div class="stat"><div class="sl">Active Now</div><div class="sv">${all.filter(t=>t.status==='active').length}</div></div>
  </div>
  <div class="card"><div class="card-body">
    ${all.length===0?`<div style="padding:32px;text-align:center;color:var(--t3);">No timecards yet. Coaches appear here when they clock in.</div>`
    :`<table class="table">
      <thead><tr><th>Coach</th><th>Date</th><th>In</th><th>Out</th><th>Duration</th><th>Class</th><th>Note</th><th></th></tr></thead>
      <tbody>${all.map(t=>{
        const ci=t.clockIn?new Date(t.clockIn).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'}):'--';
        const co=t.clockOut?new Date(t.clockOut).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'}):'Active';
        const ds=t.clockIn?new Date(t.clockIn).toLocaleDateString('en-US',{month:'short',day:'numeric'}):'--';
        return `<tr id="tc_${t.id}">
          <td><div class="name-cell"><div class="mini-av">${ini(t.coachName||'?')}</div>${t.coachName||'Coach'}</div></td>
          <td style="font-size:12px;">${ds}</td>
          <td style="font-size:12px;">${ci}</td>
          <td style="font-size:12px;">${co}</td>
          <td style="font-family:'Montserrat',sans-serif;font-weight:700;color:var(--gold);">${t.duration||'Active'}</td>
          <td style="font-size:12px;color:var(--t2);">${t.className||'—'}</td>
          <td style="font-size:11px;color:var(--t3);font-style:italic;max-width:120px;">${t.directorNote||'—'}</td>
          <td id="tca_${t.id}">
            ${t.status==='pending'
              ?`<button class="btn primary" style="font-size:10px;padding:5px 10px;" onclick="window.K.approveTC('${t.id}')">✓ Approve</button>`
              :`<span class="pill ${t.status==='approved'?'present':t.status==='active'?'ip':'not-r'}">${t.status==='approved'?'Approved':t.status==='active'?'Active':'Pending'}</span>`}
          </td>
        </tr>`;
      }).join('')}</tbody>
    </table>`}
  </div></div>`;
}

export function dirMsgs(){
  return msgInbox(APP.messages||[],'director');
}

export function dirBilling(){
  const total=APP.allAthletes.reduce((s,a)=>s+(a.tuitionAmount||185),0);
  return `
  <div class="sec-hdr"><h3>Tuition & Billing</h3><button class="btn primary" onclick="window.K.openModal('addChargeModal')">+ Add Charge</button></div>
  <div class="alert info">💳 Stripe integration coming soon. All data is ready.</div>
  <div class="stats3">
    <div class="stat"><div class="si">💰</div><div class="sl">Monthly Revenue</div><div class="sv gold">$${total.toLocaleString()}</div></div>
    <div class="stat"><div class="si">⚠️</div><div class="sl">Overdue</div><div class="sv" style="color:var(--red);">${APP.allAthletes.filter(a=>a.tuitionStatus==='overdue').length}</div></div>
    <div class="stat"><div class="si">📋</div><div class="sl">Pending</div><div class="sv">${APP.allAthletes.filter(a=>a.tuitionStatus==='pending').length}</div></div>
  </div>
  <div class="card"><div class="card-body">
    ${APP.allAthletes.length===0?`<div style="padding:24px;text-align:center;color:var(--t3);">No athletes yet.</div>`
    :`<table class="table">
      <thead><tr><th>Athlete</th><th>Level</th><th>Monthly</th><th>Cycle</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>${APP.allAthletes.map(a=>`<tr id="bil_${a.id}">
        <td><div class="name-cell"><div class="mini-av">${ini(a.name)}</div>${a.name}</div></td>
        <td><div class="belt-b"><div class="belt-d" style="background:${BELT_COLORS[a.level]||'#E8C84A'};"></div>${a.level||'Level 1'}</div></td>
        <td style="font-weight:600;">$${a.tuitionAmount||185}.00</td>
        <td style="color:var(--t2);">${a.billingCycle||'Monthly'}</td>
        <td><span class="pill ${a.tuitionStatus==='paid'?'present':a.tuitionStatus==='overdue'?'absent':'gold-p'}">${a.tuitionStatus||'Pending'}</span></td>
        <td style="white-space:nowrap;">
          <button class="btn" style="font-size:10px;padding:4px 8px;margin-right:4px;" onclick="window.K.openModal('editTuitionModal',{id:'${a.id}'})">Edit</button>
          <button class="btn" style="font-size:10px;padding:4px 8px;color:var(--blue);border-color:rgba(30,74,124,0.3);" onclick="window.K.sendTuitionReminder('${a.id}')">📨 Remind</button>
        </td>
      </tr>`).join('')}</tbody>
    </table>`}
  </div></div>`;
}

export function dirSubs(){
  const pending=(APP.subRequests||[]).filter(r=>r.status==='pending');
  const claimed=(APP.subRequests||[]).filter(r=>r.status==='claimed');
  const awaiting=(APP.subRequests||[]).filter(r=>r.status==='awaiting_original');
  const open=(APP.subRequests||[]).filter(r=>r.status==='open');
  const confirmed=(APP.subRequests||[]).filter(r=>r.status==='confirmed');
  const needsAction=pending.length+claimed.length;
  return `
  <div class="sec-hdr"><h3>Sub Requests</h3></div>
  <div class="stats4">
    <div class="stat"><div class="sl">Needs Action</div><div class="sv ${needsAction>0?'gold':''}">${needsAction}</div></div>
    <div class="stat"><div class="sl">Open on Board</div><div class="sv">${open.length}</div></div>
    <div class="stat"><div class="sl">Awaiting Coach OK</div><div class="sv">${awaiting.length}</div></div>
    <div class="stat"><div class="sl">Confirmed</div><div class="sv">${confirmed.length}</div></div>
  </div>

  ${pending.length?`
  <div class="sec-hdr"><h3>Step 1 — Approve to Post</h3></div>
  ${pending.map(r=>`<div class="class-card" style="margin-bottom:10px;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
      <div><div class="cn">${r.className}</div>
      <div class="cm" style="margin-top:4px;"><span>📅 ${r.date}</span><span>🧑‍🏫 ${r.requestedByName||'Coach'}</span></div></div>
      <span class="pill ip">Pending</span>
    </div>
    ${r.reason?`<div style="font-size:12px;color:var(--t3);margin-top:6px;font-style:italic;border-left:2px solid var(--bdr);padding-left:8px;">"${r.reason}"</div>`:''}
    <div style="display:flex;gap:8px;margin-top:10px;">
      <button class="btn primary" style="flex:1;font-size:11px;" onclick="window.K.approveSubReq('${r.id}')">✓ Approve & Post to Board</button>
      <button class="btn danger" style="font-size:11px;padding:7px 14px;" onclick="window.K.denySubReq('${r.id}')">Deny</button>
    </div>
  </div>`).join('')}`:''}

  ${claimed.length?`
  <div class="sec-hdr"><h3>Step 3 — Sub Volunteered — Approve?</h3></div>
  ${claimed.map(r=>`<div class="class-card" style="margin-bottom:10px;border-left-color:var(--gold);">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
      <div><div class="cn">${r.className}</div>
      <div class="cm" style="margin-top:4px;"><span>📅 ${r.date}</span></div></div>
      <span class="pill gold-p">Sub Volunteered</span>
    </div>
    <div style="background:rgba(181,153,106,0.08);border-radius:6px;padding:10px 12px;margin-top:8px;">
      <div style="font-size:11px;color:var(--t3);margin-bottom:4px;">SUB COACH</div>
      <div style="font-size:14px;font-weight:700;">${r.subCoachName}</div>
    </div>
    <div style="font-size:12px;color:var(--t3);margin-top:8px;">Approve this sub → original coach will be asked to confirm.</div>
    <div style="display:flex;gap:8px;margin-top:10px;">
      <button class="btn primary" style="flex:1;font-size:11px;" onclick="window.K.approveSubClaim('${r.id}')">✓ Approve & Ask Original Coach</button>
      <button class="btn danger" style="font-size:11px;padding:7px 14px;" onclick="window.K.denySubReq('${r.id}')">Deny</button>
    </div>
  </div>`).join('')}`:''}

  ${awaiting.length?`
  <div class="sec-hdr"><h3>Waiting on Original Coach</h3></div>
  ${awaiting.map(r=>`<div class="class-card" style="margin-bottom:10px;border-left-color:var(--blue,#1E4A7C);">
    <div class="cn">${r.className}</div>
    <div class="cm" style="margin-top:6px;"><span>📅 ${r.date}</span><span>Sub: ${r.subCoachName}</span></div>
    <span class="pill ip" style="margin-top:8px;display:inline-flex;">Waiting for ${r.requestedByName||'Coach'} to confirm</span>
  </div>`).join('')}`:''}

  <div class="sec-hdr" style="margin-top:4px;"><h3>Open Sub Board</h3></div>
  ${open.length===0?`<div class="card"><div style="padding:20px;text-align:center;color:var(--t3);">No open sub requests right now.</div></div>`
  :open.map(r=>`<div class="class-card" style="margin-bottom:10px;">
    <div class="cn">${r.className}</div><div class="ct">${r.date}</div>
    <div class="cm" style="margin-top:6px;"><span>Original: ${r.requestedByName||'Coach'}</span><span>🎓 ${r.requiredBelt||'Level 1'}+</span></div>
    <span class="pill not-r" style="margin-top:8px;display:inline-flex;">Waiting for a coach to volunteer...</span>
  </div>`).join('')}

  ${confirmed.length?`
  <div class="sec-hdr" style="margin-top:16px;"><h3>✓ Confirmed</h3></div>
  ${confirmed.map(r=>`<div class="class-card" style="margin-bottom:10px;border-left-color:var(--green);">
    <div class="cn">${r.className}</div><div class="ct">${r.date}</div>
    <div class="cm" style="margin-top:6px;"><span>Sub: <strong>${r.subCoachName||'TBD'}</strong></span></div>
    <span class="pill present" style="margin-top:8px;display:inline-flex;">Confirmed</span>
  </div>`).join('')}`:''}`;
}

export function dirInjuries(){
  const inj=APP.allInjuries||[];
  return `
  <div class="sec-hdr"><h3>Injury Log</h3></div>
  ${inj.length===0?`<div class="card"><div style="padding:40px;text-align:center;color:var(--t3);"><div style="font-size:44px;margin-bottom:12px;">🚑</div><p>No injury reports. Coaches can flag injuries at clock-out.</p></div></div>`
  :`<div class="card"><div class="card-body"><table class="table">
    <thead><tr><th>Date</th><th>Coach</th><th>Class</th><th>Details</th><th>Status</th><th></th></tr></thead>
    <tbody>${inj.map(i=>{
      const ds=i.date?new Date(i.date).toLocaleDateString('en-US',{month:'short',day:'numeric'}):'--';
      return `<tr id="inj_${i.id}">
        <td style="font-size:12px;">${ds}</td>
        <td><div class="name-cell"><div class="mini-av">${ini(i.coachName||'?')}</div>${i.coachName||'Coach'}</div></td>
        <td style="font-size:12px;">${i.className||'—'}</td>
        <td style="font-size:12px;color:var(--t2);">${i.details||'Auto-logged at clock-out'}</td>
        <td><span class="pill ${i.status==='resolved'?'present':i.status==='reviewed'?'ip':'absent'}">${i.status||'Pending'}</span></td>
        <td>${i.status!=='resolved'?`<button class="btn primary" style="font-size:10px;padding:4px 10px;" onclick="window.K.resolveInjury('${i.id}')">Resolve</button>`:'—'}</td>
      </tr>`;
    }).join('')}</tbody>
  </table></div></div>`}`;
}

function msgInbox(allMsgs, role){
  // Deduplicate by threadId — keep latest message per thread
  const threads={};
  allMsgs.forEach((m,i)=>{
    const tid=m.threadId||m.id||i;
    if(!threads[tid]||new Date(m.createdAt)>new Date(threads[tid].msg.createdAt)){
      threads[tid]={msg:m,idx:i,tid};
    }
  });
  const threadList=Object.values(threads).sort((a,b)=>new Date(b.msg.createdAt)-new Date(a.msg.createdAt));
  const unread=threadList.filter(t=>!t.msg.read&&t.msg.fromId!==APP.user?.uid);
  const read=threadList.filter(t=>t.msg.read||t.msg.fromId===APP.user?.uid);
  const renderRow=(t)=>{
    const m=t.msg,i=t.idx;
    const isMine=m.fromId===APP.user?.uid;
    const isUnread=!m.read&&!isMine;
    const preview=isMine?`You: ${m.preview||m.body||''}`:m.preview||m.body||'';
    return `<div style="display:flex;align-items:flex-start;gap:12px;padding:14px 16px;border-bottom:1px solid var(--bdr2);cursor:pointer;${isMine?'':''}${isUnread?'background:rgba(181,153,106,0.04);':''}" onclick="window.K.openModal('msgViewModal',{idx:${i},role:'${role}'})">
      <div class="mini-av" style="${isUnread?'background:linear-gradient(135deg,var(--gold),#7A5A2A);color:var(--sb);':''}">${ini(m.from||'?')}</div>
      <div style="flex:1;min-width:0;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div style="font-size:13px;font-weight:${isUnread?700:500};">${isMine?`To: ${m.toRole||'them'}`:m.from||'Unknown'} <span style="font-family:'Barlow Condensed',sans-serif;font-size:9px;text-transform:uppercase;color:var(--gold);opacity:0.7;">${m.fromRole||''}</span></div>
          <div style="font-size:11px;color:var(--t3);white-space:nowrap;margin-left:8px;">${m.time||''}</div>
        </div>
        <div style="font-size:13px;font-weight:${isUnread?600:400};margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${m.subject||''}</div>
        <div style="font-size:12px;color:var(--t3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:2px;">${preview}</div>
      </div>
      ${isUnread?`<div style="width:8px;height:8px;border-radius:50%;background:var(--gold);flex-shrink:0;margin-top:5px;"></div>`:''}
    </div>`;
  };
  return `
  <div class="sec-hdr"><h3>Messages</h3>
    <button class="btn primary" onclick="window.K.openModal('newMsgModal',{role:'${role}'})">+ New Message</button>
  </div>
  ${unread.length>0?`
  <div style="font-family:'Barlow Condensed',sans-serif;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:var(--gold);margin-bottom:8px;">New — ${unread.length}</div>
  <div class="card" style="margin-bottom:16px;border-color:rgba(181,153,106,0.3);">
    <div class="card-body">${unread.map(renderRow).join('')}</div>
  </div>`:''}
  ${read.length>0?`
  <div style="font-family:'Barlow Condensed',sans-serif;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:var(--t3);margin-bottom:8px;">Read</div>
  <div class="card"><div class="card-body">${read.map(renderRow).join('')}</div></div>`:''}
  ${allMsgs.length===0?`<div class="card"><div style="padding:24px;text-align:center;color:var(--t3);">No messages yet.</div></div>`:''}`;
}
export { msgInbox };
