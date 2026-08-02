const EMPLOYEE_VIEW_KEY = "karyawanku_employee_view";
const EMPLOYEE_STATUSES = ["Aktif", "Cuti", "Probation", "Resign", "Mutasi", "Blacklist"];
let currentEmployeeView = localStorage.getItem(EMPLOYEE_VIEW_KEY) === "card" ? "card" : "table";
let pendingEmployeeSave = null;

 document.addEventListener("DOMContentLoaded", () => {
  const search = document.getElementById("employeeSearch");
  const department = document.getElementById("departmentFilter");
  const status = document.getElementById("statusFilter");
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get("q") || "";
  const initialStatus = params.get("status") || "";

  fillDepartments();
  search.value = initialQuery;
  status.value = EMPLOYEE_STATUSES.includes(initialStatus) ? initialStatus : "";
  HRApp.refreshCustomSelects();
  setEmployeeView(currentEmployeeView, false);
  renderEmployees();

  search.addEventListener("input", renderEmployees);
  department.addEventListener("change", renderEmployees);
  status.addEventListener("change", () => {
    syncEmployeeUrl();
    syncEmployeeSidebarState();
    renderEmployees();
  });

  document.querySelectorAll("[data-employee-view]").forEach(button => {
    button.addEventListener("click", () => setEmployeeView(button.dataset.employeeView));
  });

  document.getElementById("clearEmployeeFilter").addEventListener("click", () => {
    search.value = "";
    department.value = "";
    status.value = "";
    HRApp.refreshCustomSelects();
    syncEmployeeUrl();
    syncEmployeeSidebarState();
    renderEmployees();
  });

  document.getElementById("addEmployee").addEventListener("click", () => openEmployeeForm());
  document.getElementById("exportEmployees").addEventListener("click", exportCSV);
  document.getElementById("employeeForm").addEventListener("submit", saveEmployee);
  document.getElementById("statusConfirmContinue").addEventListener("click", continueToStatusReason);
  document.getElementById("statusConfirmBack").addEventListener("click", cancelStatusFlow);
  document.getElementById("statusReasonBack").addEventListener("click", cancelStatusFlow);
  document.getElementById("statusReasonForm").addEventListener("submit", finalizeStatusReason);

  document.addEventListener("hrapp:branchchange", () => {
    department.value = "";
    search.value = "";
    fillDepartments();
    renderEmployees();
  });
});

function fillDepartments() {
  const data = HRApp.scope(HRApp.load());
  const names = data.departments.map(item => item.name);
  const filter = document.getElementById("departmentFilter");
  const currentFilter = filter.value;
  filter.innerHTML = `<option value="">Semua Departemen</option>${names.map(name => `<option>${HRApp.escapeHTML(name)}</option>`).join("")}`;
  filter.value = names.includes(currentFilter) ? currentFilter : "";
  document.getElementById("employeeDepartment").innerHTML = names.length
    ? names.map(name => `<option>${HRApp.escapeHTML(name)}</option>`).join("")
    : `<option value="">Buat departemen terlebih dahulu</option>`;
  HRApp.refreshCustomSelects();
}

function getEmployeeFilters() {
  return {
    query: document.getElementById("employeeSearch").value.trim().toLowerCase(),
    department: document.getElementById("departmentFilter").value,
    status: document.getElementById("statusFilter").value
  };
}

function getFilteredEmployees(scoped = HRApp.scope(HRApp.load())) {
  const filters = getEmployeeFilters();
  return scoped.employees.filter(employee => {
    const haystack = `${employee.name} ${employee.email} ${employee.phone} ${employee.position} ${employee.department} ${employee.id} ${employee.bank || ""} ${employee.accountNumber || ""} ${employee.statusReason || ""}`.toLowerCase();
    return haystack.includes(filters.query)
      && (!filters.department || employee.department === filters.department)
      && (!filters.status || employee.status === filters.status);
  });
}

function renderEmployees() {
  const scoped = HRApp.scope(HRApp.load());
  const filtered = getFilteredEmployees(scoped);
  const tableBody = document.getElementById("employeesTableBody");
  const cardGrid = document.getElementById("employeeCardView");
  const tableEmpty = document.getElementById("employeesEmpty");
  const status = document.getElementById("statusFilter").value;

  tableBody.innerHTML = filtered.map(employee => `
    <tr>
      <td><div class="person-cell"><span class="avatar avatar-md">${HRApp.initials(employee.name)}</span><div><strong>${HRApp.escapeHTML(employee.name)}</strong><small>${HRApp.escapeHTML(employee.email)}</small></div></div></td>
      <td><span class="badge badge-neutral">${HRApp.escapeHTML(employee.id)}</span></td>
      <td>${HRApp.escapeHTML(employee.position)}</td>
      <td>${HRApp.escapeHTML(employee.department)}</td>
      <td><div class="bank-account-cell"><strong>${HRApp.escapeHTML(employee.bank || "-")}</strong><small>${HRApp.escapeHTML(employee.accountNumber || "Belum diisi")}</small></div></td>
      <td>${HRApp.date(employee.joinDate)}</td>
      <td>${renderEmployeeStatus(employee)}</td>
      <td><div class="action-group"><button class="action-btn" title="Edit ${HRApp.escapeHTML(employee.name)}" onclick="openEmployeeForm('${employee.id}')">${HRApp.icon("edit")}</button><button class="action-btn" title="Hapus ${HRApp.escapeHTML(employee.name)}" onclick="deleteEmployee('${employee.id}')">${HRApp.icon("trash")}</button></div></td>
    </tr>`).join("");

  cardGrid.innerHTML = filtered.length ? filtered.map(renderEmployeeCard).join("") : `
    <div class="employee-card-empty">
      <span>${HRApp.icon("users")}</span>
      <h3>Data tidak ditemukan</h3>
      <p>Coba ubah kata kunci, departemen, atau status karyawan.</p>
    </div>`;

  tableEmpty.classList.toggle("hidden", filtered.length > 0);
  updateEmployeeResultMeta(filtered.length, scoped.employees.length, status, scoped.branch?.name);
}

function renderEmployeeCard(employee) {
  return `
    <article class="employee-profile-card" data-status="${HRApp.escapeHTML(employee.status.toLowerCase())}">
      <div class="employee-card-glow"></div>
      <header class="employee-card-header">
        <span class="avatar employee-card-avatar">${HRApp.initials(employee.name)}</span>
        <div class="employee-card-actions">
          <button class="action-btn" title="Edit ${HRApp.escapeHTML(employee.name)}" onclick="openEmployeeForm('${employee.id}')">${HRApp.icon("edit")}</button>
          <button class="action-btn danger" title="Hapus ${HRApp.escapeHTML(employee.name)}" onclick="deleteEmployee('${employee.id}')">${HRApp.icon("trash")}</button>
        </div>
      </header>
      <div class="employee-card-identity">
        <span class="badge ${employeeStatusBadge(employee.status)}">${HRApp.escapeHTML(employee.status)}</span>
        <h3>${HRApp.escapeHTML(employee.name)}</h3>
        <p>${HRApp.escapeHTML(employee.position)}</p>
      </div>
      <div class="employee-card-details">
        <div><span>${HRApp.icon("building")}</span><small>Departemen</small><strong>${HRApp.escapeHTML(employee.department)}</strong></div>
        <div><span>${HRApp.icon("idCard")}</span><small>ID Karyawan</small><strong>${HRApp.escapeHTML(employee.id)}</strong></div>
        <div><span>${HRApp.icon("mail")}</span><small>Email</small><strong title="${HRApp.escapeHTML(employee.email)}">${HRApp.escapeHTML(employee.email)}</strong></div>
        <div><span>${HRApp.icon("phone")}</span><small>Telepon</small><strong>${HRApp.escapeHTML(employee.phone)}</strong></div>
        <div><span>${HRApp.icon("wallet")}</span><small>Bank</small><strong>${HRApp.escapeHTML(employee.bank || "-")}</strong></div>
        <div><span>${HRApp.icon("idCard")}</span><small>Nomor Rekening</small><strong title="${HRApp.escapeHTML(employee.accountNumber || "Belum diisi")}">${HRApp.escapeHTML(employee.accountNumber || "Belum diisi")}</strong></div>
        ${employee.status !== "Aktif" ? `<div class="employee-status-reason-card"><span>${HRApp.icon("edit")}</span><small>Alasan ${HRApp.escapeHTML(employee.status)}</small><strong title="${HRApp.escapeHTML(employee.statusReason || "Belum ada alasan")}">${HRApp.escapeHTML(employee.statusReason || "Belum ada alasan")}</strong></div>` : ""}
      </div>
      <footer class="employee-card-footer">
        <div><small>Bergabung</small><strong>${HRApp.date(employee.joinDate)}</strong></div>
        <div><small>Gaji Bulanan</small><strong>${HRApp.money(employee.salary)}</strong></div>
      </footer>
    </article>`;
}

function renderEmployeeStatus(employee) {
  const reason = employee.status !== "Aktif" ? String(employee.statusReason || "Belum ada alasan").trim() : "";
  return `<div class="employee-status-cell"><span class="badge ${employeeStatusBadge(employee.status)}">${HRApp.escapeHTML(employee.status)}</span>${reason ? `<small title="${HRApp.escapeHTML(reason)}">${HRApp.escapeHTML(reason)}</small>` : ""}</div>`;
}

function employeeStatusBadge(status) {
  return ({
    Aktif: "badge-success",
    Cuti: "badge-warning",
    Probation: "badge-info",
    Mutasi: "badge-neutral",
    Resign: "badge-danger",
    Blacklist: "badge-blacklist"
  })[status] || "badge-neutral";
}

function updateEmployeeResultMeta(filteredCount, totalCount, status, branchName) {
  const title = status ? `Karyawan ${status}` : "Semua Karyawan";
  document.getElementById("employeeResultTitle").textContent = title;
  document.getElementById("employeeResultCount").textContent = `${filteredCount} dari ${totalCount} data di ${branchName || "cabang aktif"}`;

  const pageHeading = document.querySelector(".page-head h2");
  const subtitle = document.querySelector(".page-head p");
  if (pageHeading) pageHeading.textContent = title;
  if (subtitle) subtitle.textContent = status
    ? `Menampilkan karyawan berstatus ${status.toLowerCase()} di ${branchName || "cabang aktif"}.`
    : `Kelola ${totalCount} karyawan di ${branchName || "cabang aktif"}.`;
  document.title = `${title} · KaryawanKu`;
}

function setEmployeeView(view, persist = true) {
  currentEmployeeView = view === "card" ? "card" : "table";
  const tableView = document.getElementById("employeeTableView");
  const cardView = document.getElementById("employeeCardView");
  tableView.classList.toggle("hidden", currentEmployeeView !== "table");
  cardView.classList.toggle("hidden", currentEmployeeView !== "card");

  document.querySelectorAll("[data-employee-view]").forEach(button => {
    const active = button.dataset.employeeView === currentEmployeeView;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  if (persist) localStorage.setItem(EMPLOYEE_VIEW_KEY, currentEmployeeView);
}

function syncEmployeeUrl() {
  const params = new URLSearchParams(window.location.search);
  const status = document.getElementById("statusFilter").value;
  const query = document.getElementById("employeeSearch").value.trim();
  if (status) params.set("status", status); else params.delete("status");
  if (query) params.set("q", query); else params.delete("q");
  const queryString = params.toString();
  const pathname = window.location.pathname || "employees.html";
  try {
    history.replaceState({}, "", `${pathname}${queryString ? `?${queryString}` : ""}`);
  } catch (error) {
    console.debug("URL filter tidak dapat diperbarui pada konteks ini.", error);
  }
}

function syncEmployeeSidebarState() {
  const status = document.getElementById("statusFilter").value;
  document.querySelectorAll("[data-employee-status]").forEach(link => {
    const active = Boolean(status) && link.dataset.employeeStatus === status;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "page"); else link.removeAttribute("aria-current");
  });
}

function openEmployeeForm(id = "") {
  pendingEmployeeSave = null;
  const form = document.getElementById("employeeForm");
  form.reset();
  document.getElementById("employeeId").value = "";
  document.getElementById("employeeJoinDate").value = HRApp.today();
  document.getElementById("employeeStatus").value = document.getElementById("statusFilter").value || "Aktif";
  document.getElementById("employeeModalTitle").textContent = id ? "Edit Karyawan" : "Tambah Karyawan";
  if (id) {
    const employee = HRApp.load().employees.find(item => item.id === id);
    if (!employee) return;
    ["Name", "Email", "Phone", "Position", "Department", "JoinDate", "Status", "Salary", "Bank", "AccountNumber"].forEach(key => {
      const source = key.charAt(0).toLowerCase() + key.slice(1);
      const node = document.getElementById(`employee${key}`);
      if (node) node.value = employee[source] ?? "";
    });
    document.getElementById("employeeId").value = employee.id;
  }
  HRApp.refreshCustomSelects();
  HRApp.openModal("employeeModal");
}

function saveEmployee(event) {
  event.preventDefault();
  const data = HRApp.load();
  const branchId = HRApp.getActiveBranchId(data);
  const existingId = document.getElementById("employeeId").value;
  const previous = data.employees.find(item => item.id === existingId) || null;
  const nextStatus = document.getElementById("employeeStatus").value;
  const payload = {
    id: existingId || nextEmployeeId(data.employees),
    branchId: previous?.branchId || branchId,
    name: document.getElementById("employeeName").value.trim(),
    email: document.getElementById("employeeEmail").value.trim(),
    phone: document.getElementById("employeePhone").value.trim(),
    position: document.getElementById("employeePosition").value.trim(),
    department: document.getElementById("employeeDepartment").value,
    joinDate: document.getElementById("employeeJoinDate").value,
    status: nextStatus,
    statusReason: previous?.statusReason || "",
    statusChangedAt: previous?.statusChangedAt || "",
    statusHistory: Array.isArray(previous?.statusHistory) ? [...previous.statusHistory] : [],
    salary: Number(document.getElementById("employeeSalary").value),
    bank: document.getElementById("employeeBank").value,
    accountNumber: document.getElementById("employeeAccountNumber").value.trim()
  };

  const statusChanged = !previous || previous.status !== nextStatus;
  if (statusChanged && nextStatus !== "Aktif") {
    pendingEmployeeSave = { data, payload, previous, existingId };
    prepareStatusConfirmation();
    HRApp.closeModal("employeeModal");
    HRApp.openModal("statusConfirmModal");
    return;
  }

  if (statusChanged && nextStatus === "Aktif") {
    payload.statusReason = "";
    payload.statusChangedAt = new Date().toISOString();
    payload.statusHistory.push({
      from: previous?.status || "Belum ada",
      to: "Aktif",
      reason: "",
      changedAt: payload.statusChangedAt
    });
  }

  commitEmployeeSave({ data, payload, previous, existingId });
}

function prepareStatusConfirmation() {
  if (!pendingEmployeeSave) return;
  const { payload, previous } = pendingEmployeeSave;
  document.getElementById("statusConfirmMessage").textContent = `Ubah status ${payload.name} menjadi ${payload.status}?`;
  document.getElementById("statusFromPreview").textContent = previous?.status || "Karyawan baru";
  document.getElementById("statusToPreview").textContent = payload.status;
}

function continueToStatusReason() {
  if (!pendingEmployeeSave) return;
  const { payload } = pendingEmployeeSave;
  HRApp.closeModal("statusConfirmModal");
  document.getElementById("statusReasonTitle").textContent = `Alasan ${payload.status}`;
  document.getElementById("statusReasonDescription").textContent = `Jelaskan alasan status ${payload.status.toLowerCase()} untuk ${payload.name}.`;
  document.getElementById("employeeStatusReason").value = "";
  HRApp.openModal("statusReasonModal");
  setTimeout(() => document.getElementById("employeeStatusReason").focus(), 80);
}

function cancelStatusFlow() {
  HRApp.closeModal("statusConfirmModal");
  HRApp.closeModal("statusReasonModal");
  pendingEmployeeSave = null;
  HRApp.openModal("employeeModal");
}

function finalizeStatusReason(event) {
  event.preventDefault();
  if (!pendingEmployeeSave) return;
  const reasonInput = document.getElementById("employeeStatusReason");
  const reason = reasonInput.value.trim();
  if (reason.length < 8) {
    reasonInput.setCustomValidity("Alasan minimal 8 karakter.");
    reasonInput.reportValidity();
    reasonInput.setCustomValidity("");
    return;
  }
  const context = pendingEmployeeSave;
  const changedAt = new Date().toISOString();
  context.payload.statusReason = reason;
  context.payload.statusChangedAt = changedAt;
  context.payload.statusHistory.push({
    from: context.previous?.status || "Belum ada",
    to: context.payload.status,
    reason,
    changedAt
  });
  pendingEmployeeSave = null;
  HRApp.closeModal("statusReasonModal");
  commitEmployeeSave(context);
}

function commitEmployeeSave({ data, payload, existingId }) {
  if (existingId) data.employees = data.employees.map(item => item.id === existingId ? payload : item);
  else data.employees.unshift(payload);
  HRApp.save(data);
  HRApp.closeModal("employeeModal");
  renderEmployees();
  document.dispatchEvent(new CustomEvent("hrapp:employeeschanged"));
  HRApp.toast(existingId ? "Data karyawan diperbarui." : "Karyawan baru berhasil ditambahkan ke cabang aktif.");
}

function nextEmployeeId(employees) {
  const max = employees.reduce((value, item) => Math.max(value, Number(item.id.split("-")[1]) || 0), 0);
  return `EMP-${String(max + 1).padStart(3, "0")}`;
}

function deleteEmployee(id) {
  const data = HRApp.load();
  const employee = data.employees.find(item => item.id === id);
  if (!employee || !confirm(`Hapus data ${employee.name}?`)) return;
  data.employees = data.employees.filter(item => item.id !== id);
  data.leave = data.leave.filter(item => item.employeeId !== id);
  data.payroll = data.payroll.filter(item => item.employeeId !== id);
  data.performanceReviews = (data.performanceReviews || []).filter(item => item.employeeId !== id);
  Object.values(data.attendance || {}).forEach(records => delete records[id]);
  HRApp.save(data);
  renderEmployees();
  document.dispatchEvent(new CustomEvent("hrapp:employeeschanged"));
  HRApp.toast("Data karyawan telah dihapus.");
}

function exportCSV() {
  const scoped = HRApp.scope(HRApp.load());
  const employees = getFilteredEmployees(scoped);
  const rows = [["ID", "Nama", "Email", "Telepon", "Jabatan", "Departemen", "Bank", "Nomor Rekening", "Cabang", "Tanggal Bergabung", "Status", "Alasan Status", "Tanggal Perubahan Status", "Gaji"], ...employees.map(employee => [employee.id, employee.name, employee.email, employee.phone, employee.position, employee.department, employee.bank || "", employee.accountNumber || "", scoped.branch?.name || "", employee.joinDate, employee.status, employee.statusReason || "", employee.statusChangedAt || "", employee.salary])];
  const csv = rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
  HRApp.download(`data-karyawan-${scoped.branch?.code || "cabang"}.csv`, `\uFEFF${csv}`, "text/csv;charset=utf-8");
  HRApp.toast(`${employees.length} data karyawan berhasil diekspor.`);
}
