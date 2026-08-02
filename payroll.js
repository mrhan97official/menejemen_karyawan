document.addEventListener("DOMContentLoaded", () => {
  const now = new Date();
  document.getElementById("payrollMonth").value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  renderPayroll();
  document.getElementById("payrollSearch").addEventListener("input", renderPayroll);
  document.getElementById("payrollStatus").addEventListener("input", renderPayroll);
  document.getElementById("payrollMonth").addEventListener("change", renderPayroll);
  document.getElementById("generatePayroll").addEventListener("click", generatePayroll);
  document.getElementById("printPayroll").addEventListener("click", () => window.print());
  document.getElementById("payrollForm").addEventListener("submit", savePayrollEdit);
  document.addEventListener("hrapp:branchchange", () => {
    document.getElementById("payrollSearch").value = "";
    document.getElementById("payrollStatus").value = "";
    HRApp.refreshCustomSelects();
    renderPayroll();
  });
});

function rowsForMonth(data, month) {
  return data.payroll.filter(item => item.month === month);
}

function generatePayroll() {
  const fullData = HRApp.load();
  const data = HRApp.scope(fullData);
  const month = document.getElementById("payrollMonth").value;
  const existing = new Set(rowsForMonth(data, month).map(item => item.employeeId));
  data.employees.filter(employee => employee.status !== "Nonaktif").forEach(employee => {
    if (!existing.has(employee.id)) {
      fullData.payroll.push({
        id:HRApp.uid("PAY"),
        branchId:data.branchId,
        employeeId:employee.id,
        month,
        base:Number(employee.salary || 0),
        allowance:750000,
        deduction:150000,
        status:"Belum Dibayar",
        paidAt:""
      });
    }
  });
  HRApp.save(fullData);
  renderPayroll();
  HRApp.toast(`Payroll ${data.branch?.name || "cabang aktif"} berhasil dibuat.`);
}

function renderPayroll() {
  const data = HRApp.scope(HRApp.load());
  const month = document.getElementById("payrollMonth").value;
  const query = document.getElementById("payrollSearch").value.toLowerCase();
  const status = document.getElementById("payrollStatus").value;
  const rows = rowsForMonth(data, month).filter(item => {
    const employee = data.employees.find(candidate => candidate.id === item.employeeId) || { name:"Karyawan dihapus", department:"-" };
    return `${employee.name} ${employee.department}`.toLowerCase().includes(query) && (!status || item.status === status);
  });
  document.getElementById("payrollBody").innerHTML = rows.map(item => {
    const employee = data.employees.find(candidate => candidate.id === item.employeeId) || { name:"Karyawan dihapus", department:"-" };
    const total = item.base + item.allowance - item.deduction;
    return `<tr>
      <td><div class="person-cell"><span class="avatar avatar-md">${HRApp.initials(employee.name)}</span><div><strong>${HRApp.escapeHTML(employee.name)}</strong><small>${HRApp.escapeHTML(employee.department)}</small></div></div></td>
      <td>${HRApp.money(item.base)}</td><td>${HRApp.money(item.allowance)}</td><td>${HRApp.money(item.deduction)}</td><td><strong>${HRApp.money(total)}</strong></td>
      <td><span class="badge ${item.status === "Dibayar" ? "badge-success" : "badge-warning"}">${item.status}</span></td>
      <td><div class="action-group"><button class="action-btn" title="Edit" onclick="editPayroll('${item.id}')">${HRApp.icon("edit")}</button><button class="action-btn" title="${item.status === "Dibayar" ? "Batalkan" : "Tandai dibayar"}" onclick="togglePaid('${item.id}')">${HRApp.icon(item.status === "Dibayar" ? "undo" : "check")}</button></div></td></tr>`;
  }).join("");
  document.getElementById("payrollEmpty").classList.toggle("hidden", rows.length > 0);
  renderSummary(rows);
  const subtitle = document.querySelector(".page-head p");
  if (subtitle) subtitle.textContent = `Kelola komponen gaji ${data.branch?.name || "cabang aktif"} secara terpisah.`;
}

function renderSummary(rows) {
  const gross = rows.reduce((sum, item) => sum + item.base + item.allowance, 0);
  const deduction = rows.reduce((sum, item) => sum + item.deduction, 0);
  const net = gross - deduction;
  document.getElementById("payrollSummary").innerHTML = [
    ["Total Bruto", HRApp.money(gross), "Gaji pokok + tunjangan"],
    ["Total Potongan", HRApp.money(deduction), "Pajak dan potongan lain"],
    ["Take Home Pay", HRApp.money(net), `${rows.filter(item => item.status === "Dibayar").length}/${rows.length} telah dibayar`]
  ].map(summary => `<article class="card payroll-card"><span>${summary[0]}</span><strong>${summary[1]}</strong><small>${summary[2]}</small></article>`).join("");
}

function editPayroll(id) {
  const data = HRApp.load();
  const item = data.payroll.find(candidate => candidate.id === id);
  if (!item) return;
  const employee = data.employees.find(candidate => candidate.id === item.employeeId);
  document.getElementById("payrollId").value = id;
  document.getElementById("payrollEmployeeName").value = employee?.name || "Karyawan dihapus";
  document.getElementById("payrollAllowance").value = item.allowance;
  document.getElementById("payrollDeduction").value = item.deduction;
  HRApp.openModal("payrollModal");
}

function savePayrollEdit(event) {
  event.preventDefault();
  const data = HRApp.load();
  const id = document.getElementById("payrollId").value;
  data.payroll = data.payroll.map(item => item.id === id ? {
    ...item,
    allowance:Number(document.getElementById("payrollAllowance").value),
    deduction:Number(document.getElementById("payrollDeduction").value)
  } : item);
  HRApp.save(data);
  HRApp.closeModal("payrollModal");
  renderPayroll();
  HRApp.toast("Komponen gaji diperbarui.");
}

function togglePaid(id) {
  const data = HRApp.load();
  data.payroll = data.payroll.map(item => item.id === id ? {
    ...item,
    status:item.status === "Dibayar" ? "Belum Dibayar" : "Dibayar",
    paidAt:item.status === "Dibayar" ? "" : new Date().toISOString()
  } : item);
  HRApp.save(data);
  renderPayroll();
  HRApp.toast("Status pembayaran diperbarui.");
}
