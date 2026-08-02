document.addEventListener("DOMContentLoaded", () => {
  fillEmployees();
  renderLeave();
  document.getElementById("leaveSearch").addEventListener("input", renderLeave);
  document.getElementById("leaveStatus").addEventListener("input", renderLeave);
  document.getElementById("leaveType").addEventListener("input", renderLeave);
  document.getElementById("addLeave").addEventListener("click", () => {
    document.getElementById("leaveForm").reset();
    document.getElementById("leaveStart").value = HRApp.today();
    document.getElementById("leaveEnd").value = HRApp.today();
    HRApp.openModal("leaveModal");
  });
  document.getElementById("leaveForm").addEventListener("submit", saveLeave);
  document.addEventListener("hrapp:branchchange", () => {
    document.getElementById("leaveSearch").value = "";
    document.getElementById("leaveStatus").value = "";
    document.getElementById("leaveType").value = "";
    fillEmployees();
    renderLeave();
  });
});

function fillEmployees() {
  const data = HRApp.scope(HRApp.load());
  document.getElementById("leaveEmployee").innerHTML = data.employees.length
    ? data.employees.map(employee => `<option value="${employee.id}">${HRApp.escapeHTML(employee.name)} · ${HRApp.escapeHTML(employee.department)}</option>`).join("")
    : `<option value="">Belum ada karyawan di cabang ini</option>`;
  HRApp.refreshCustomSelects();
}

function employeeById(data, id) {
  return data.employees.find(employee => employee.id === id) || { name:"Karyawan dihapus", department:"-" };
}

function daysBetween(start, end) {
  return Math.max(1, Math.round((new Date(end) - new Date(start)) / 86400000) + 1);
}

function renderLeave() {
  const data = HRApp.scope(HRApp.load());
  const query = document.getElementById("leaveSearch").value.toLowerCase();
  const status = document.getElementById("leaveStatus").value;
  const type = document.getElementById("leaveType").value;
  const rows = data.leave.filter(item => {
    const employee = employeeById(data, item.employeeId);
    return `${employee.name} ${item.reason}`.toLowerCase().includes(query) && (!status || item.status === status) && (!type || item.type === type);
  });
  document.getElementById("leaveBody").innerHTML = rows.map(item => {
    const employee = employeeById(data, item.employeeId);
    const badge = item.status === "Disetujui" ? "badge-success" : item.status === "Ditolak" ? "badge-danger" : "badge-warning";
    return `<tr><td><div class="person-cell"><span class="avatar avatar-md">${HRApp.initials(employee.name)}</span><div><strong>${HRApp.escapeHTML(employee.name)}</strong><small>${HRApp.escapeHTML(employee.department)}</small></div></div></td>
      <td><span class="badge badge-info">${item.type}</span></td><td>${HRApp.date(item.start)} – ${HRApp.date(item.end)}</td><td>${daysBetween(item.start, item.end)} hari</td><td>${HRApp.escapeHTML(item.reason)}</td><td><span class="badge ${badge}">${item.status}</span></td>
      <td><div class="action-group">${item.status === "Menunggu" ? `<button class="action-btn" title="Setujui" onclick="updateLeave('${item.id}','Disetujui')">${HRApp.icon("check")}</button><button class="action-btn" title="Tolak" onclick="updateLeave('${item.id}','Ditolak')">${HRApp.icon("close")}</button>` : ""}<button class="action-btn" title="Hapus" onclick="deleteLeave('${item.id}')">${HRApp.icon("trash")}</button></div></td></tr>`;
  }).join("");
  document.getElementById("leaveEmpty").classList.toggle("hidden", rows.length > 0);
  renderStats(data);
  const subtitle = document.querySelector(".page-head p");
  if (subtitle) subtitle.textContent = `Permohonan cuti dan izin khusus ${data.branch?.name || "cabang aktif"}.`;
}

function renderStats(data) {
  const stats = [
    ["Total Permohonan", data.leave.length, "leave", "#f3a712", "rgba(243,167,18,.12)"],
    ["Menunggu", data.leave.filter(item => item.status === "Menunggu").length, "clock", "#f4a261", "rgba(244,162,97,.13)"],
    ["Disetujui", data.leave.filter(item => item.status === "Disetujui").length, "shieldCheck", "#8dbb43", "rgba(141,187,67,.12)"],
    ["Ditolak", data.leave.filter(item => item.status === "Ditolak").length, "close", "#ef476f", "rgba(239,71,111,.12)"]
  ];
  document.getElementById("leaveStats").innerHTML = stats.map(stat => `<article class="stat-card" style="--accent:${stat[3]};--accent-soft:${stat[4]}"><div class="stat-top"><span class="stat-icon">${HRApp.icon(stat[2])}</span></div><h3>${stat[1]}</h3><p>${stat[0]}</p></article>`).join("");
}

function saveLeave(event) {
  event.preventDefault();
  const start = document.getElementById("leaveStart").value;
  const end = document.getElementById("leaveEnd").value;
  if (end < start) {
    HRApp.toast("Tanggal selesai tidak boleh sebelum tanggal mulai.", "danger");
    return;
  }
  const data = HRApp.load();
  const employeeId = document.getElementById("leaveEmployee").value;
  if (!employeeId) {
    HRApp.toast("Tambahkan karyawan pada cabang ini terlebih dahulu.", "danger");
    return;
  }
  data.leave.unshift({
    id:HRApp.uid("LV"),
    branchId:HRApp.getActiveBranchId(data),
    employeeId,
    type:document.getElementById("leaveTypeInput").value,
    start,
    end,
    reason:document.getElementById("leaveReason").value.trim(),
    status:document.getElementById("leaveStatusInput").value,
    requestedAt:HRApp.today()
  });
  HRApp.save(data);
  HRApp.closeModal("leaveModal");
  renderLeave();
  HRApp.toast("Permohonan cabang aktif berhasil dibuat.");
}

function updateLeave(id, status) {
  const data = HRApp.load();
  data.leave = data.leave.map(item => item.id === id ? { ...item, status } : item);
  HRApp.save(data);
  renderLeave();
  HRApp.toast(`Permohonan ${status.toLowerCase()}.`);
}

function deleteLeave(id) {
  if (!confirm("Hapus permohonan ini?")) return;
  const data = HRApp.load();
  data.leave = data.leave.filter(item => item.id !== id);
  HRApp.save(data);
  renderLeave();
  HRApp.toast("Permohonan dihapus.");
}
