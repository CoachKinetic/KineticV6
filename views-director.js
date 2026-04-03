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
      :`<div class="g3">${dc.map(c=>`<div class="class-card" onclick="window.K.openModal('classModal',{classId:'${c.id}'})">
        <div style="display:flex;justify-content:space-between;"><div class="cn">${c.name}</div><span class="pill gold-p">${c.time}</span></div>
        <div class="cm" style="margin-top:6px;"><span>🧑‍🏫 ${c.coachName||'TBD'}</span><span>👧 ${(c.athletes||[]).length}/${c.cap||8}</span></div>
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
  const msgs=APP.messages||[];
  return `
  <div class="sec-hdr"><h3>Messages</h3>
    <button class="btn primary" onclick="window.K.openModal('newMsgModal',{role:'director'})">+ New Message</button>
  </div>
  <div class="card"><div class="card-body">
    ${msgs.length===0?`<div style="padding:24px;text-align:center;color:var(--t3);">No messages yet.</div>`
    :msgs.map((m,i)=>`<div style="display:flex;align-items:flex-start;gap:12px;padding:14px 16px;border-bottom:1px solid var(--bdr2);cursor:pointer;" onclick="window.K.openModal('msgViewModal',{idx:${i},role:'director'})">
      <div class="mini-av">${ini(m.from||'?')}</div>
      <div style="flex:1;min-width:0;">
        <div style="display:flex;justify-content:space-between;">
          <div style="font-size:13px;font-weight:${!m.read&&m.fromId!==APP.user?.uid?700:500};">${m.from||'Unknown'} <span style="font-family:'Barlow Condensed',sans-serif;font-size:9px;text-transform:uppercase;color:var(--gold);opacity:0.7;">${m.fromRole||''}</span></div>
          <div style="font-size:11px;color:var(--t3);">${m.time||''}</div>
        </div>
        <div style="font-size:13px;margin-top:2px;">${m.subject||''}</div>
        <div style="font-size:12px;color:var(--t3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:2px;">${m.preview||m.body||''}</div>
      </div>
      ${!m.read&&m.fromId!==APP.user?.uid?`<div style="width:8px;height:8px;border-radius:50%;background:var(--gold);flex-shrink:0;margin-top:4px;"></div>`:''}
    </div>`).join('')}
  </div></div>`;
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
        <td><button class="btn" style="font-size:10px;padding:4px 10px;" onclick="window.K.openModal('editTuitionModal',{id:'${a.id}'})">Edit</button></td>
      </tr>`).join('')}</tbody>
    </table>`}
  </div></div>`;
}

export function dirSubs(){
  const pending=(APP.subRequests||[]).filter(r=>r.status==='pending');
  const open=(APP.subRequests||[]).filter(r=>r.status==='open');
  const confirmed=(APP.subRequests||[]).filter(r=>r.status==='confirmed');
  return `
  <div class="sec-hdr"><h3>Sub Requests</h3></div>
  <div class="stats3">
    <div class="stat"><div class="sl">Needs Approval</div><div class="sv gold">${pending.length}</div></div>
    <div class="stat"><div class="sl">Open on Board</div><div class="sv">${open.length}</div></div>
    <div class="stat"><div class="sl">Confirmed</div><div class="sv">${confirmed.length}</div></div>
  </div>
  ${pending.length?`<div class="sec-hdr"><h3>Pending Approval</h3></div>${pending.map(r=>`<div class="class-card" style="margin-bottom:10px;">
    <div style="display:flex;justify-content:space-between;"><div class="cn">${r.className}</div><span class="pill ip">Pending</span></div>
    <div class="cm" style="margin-top:6px;"><span>📅 ${r.date}</span><span>🧑‍🏫 ${r.requestedByName||'Coach'}</span></div>
    ${r.reason?`<div style="font-size:12px;color:var(--t3);margin-top:6px;font-style:italic;">"${r.reason}"</div>`:''}
    <div style="display:flex;gap:8px;margin-top:10px;">
      <button class="btn primary" style="flex:1;font-size:11px;" onclick="window.K.approveSubReq('${r.id}')">✓ Approve & Post</button>
      <button class="btn danger" style="flex:1;font-size:11px;" onclick="window.K.denySubReq('${r.id}')">Deny</button>
    </div>
  </div>`).join('')}`:''}
  <div class="sec-hdr" style="margin-top:8px;"><h3>Open Sub Board</h3></div>
  ${open.length===0?`<div class="card"><div style="padding:20px;text-align:center;color:var(--t3);">No open sub requests.</div></div>`
  :open.map(r=>`<div class="class-card" style="margin-bottom:10px;">
    <div class="cn">${r.className}</div><div class="ct">${r.date}</div>
    <div class="cm" style="margin-top:6px;"><span>Original: ${r.requestedByName||'Coach'}</span></div>
    ${r.subCoachName?`<div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px;">
      <span class="pill gold-p">Claimed: ${r.subCoachName}</span>
      <button class="btn primary" style="font-size:11px;" onclick="window.K.confirmSub('${r.id}')">✓ Confirm</button>
    </div>`:`<span class="pill not-r" style="margin-top:8px;display:inline-flex;">Waiting for sub...</span>`}
  </div>`).join('')}
  ${confirmed.length?`<div class="sec-hdr" style="margin-top:16px;"><h3>Confirmed</h3></div>${confirmed.map(r=>`<div class="class-card" style="margin-bottom:10px;border-left-color:var(--green);">
    <div class="cn">${r.className}</div><div class="ct">${r.date}</div>
    <div class="cm" style="margin-top:6px;"><span>Sub: ${r.subCoachName||'TBD'}</span></div>
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
