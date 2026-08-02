document.addEventListener("DOMContentLoaded", () => {
  loadSettings();
  renderBranches();
  document.querySelectorAll("[data-settings-tab]").forEach(button => button.addEventListener("click", () => switchTab(button.dataset.settingsTab)));
  document.getElementById("companyForm").addEventListener("submit", saveCompany);
  document.getElementById("saveNotifications").addEventListener("click", saveNotifications);
  document.getElementById("darkModeSetting").addEventListener("change", toggleDarkMode);
  document.getElementById("backupData").addEventListener("click", backupData);
  document.getElementById("restoreData").addEventListener("change", restoreData);
  document.getElementById("resetData").addEventListener("click", resetData);
  document.getElementById("addBranch").addEventListener("click", () => openBranchForm());
  document.getElementById("branchForm").addEventListener("submit", saveBranch);
  document.addEventListener("hrapp:branchchange", renderBranches);

  const hashTab = window.location.hash.replace("#settings-", "");
  if (["company", "branches", "notifications", "appearance", "data"].includes(hashTab)) switchTab(hashTab);
});

function switchTab(tab) {
  document.querySelectorAll("[data-settings-tab]").forEach(button => button.classList.toggle("active", button.dataset.settingsTab === tab));
  document.querySelectorAll(".settings-section").forEach(section => section.classList.toggle("active", section.id === `settings-${tab}`));
  history.replaceState(null, "", `#settings-${tab}`);
}

function loadSettings() {
  const data = HRApp.load();
  document.getElementById("ownerName").value = data.company.ownerName || "";
  document.getElementById("ownerEmail").value = data.company.ownerEmail || "";
  document.getElementById("companyName").value = data.company.name;
  document.getElementById("companyEmail").value = data.company.email;
  document.getElementById("companyPhone").value = data.company.phone;
  document.getElementById("companyAddress").value = data.company.address;
  ["emailNotifications", "attendanceReminder", "payrollReminder"].forEach(key => {
    document.getElementById(key).checked = Boolean(data.settings[key]);
  });
  document.getElementById("darkModeSetting").checked = document.documentElement.dataset.theme === "dark";
}

function saveCompany(event) {
  event.preventDefault();
  const data = HRApp.load();
  data.company = {
    ...data.company,
    ownerName:document.getElementById("ownerName").value.trim(),
    ownerEmail:document.getElementById("ownerEmail").value.trim(),
    name:document.getElementById("companyName").value.trim(),
    email:document.getElementById("companyEmail").value.trim(),
    phone:document.getElementById("companyPhone").value.trim(),
    address:document.getElementById("companyAddress").value.trim()
  };
  HRApp.save(data);
  HRApp.renderBranchContext();
  HRApp.toast("Profil owner dan perusahaan disimpan.");
}

function renderBranches() {
  const data = HRApp.load();
  const activeBranchId = HRApp.getActiveBranchId(data);
  const activeCount = data.branches.filter(branch => branch.status === "Aktif").length;
  document.getElementById("ownerBranchSummary").innerHTML = `
    <article><span>${HRApp.icon("shieldCheck")}</span><div><small>Owner workspace</small><strong>${HRApp.escapeHTML(data.company.ownerName || "Owner")}</strong></div></article>
    <article><span>${HRApp.icon("building")}</span><div><small>Total cabang</small><strong>${data.branches.length} cabang</strong></div></article>
    <article><span>${HRApp.icon("activity")}</span><div><small>Cabang aktif</small><strong>${activeCount} operasional</strong></div></article>
    <article><span>${HRApp.icon("users")}</span><div><small>Total karyawan</small><strong>${data.employees.length} orang</strong></div></article>`;

  document.getElementById("branchManagementGrid").innerHTML = data.branches.map(branch => {
    const employeeCount = data.employees.filter(employee => employee.branchId === branch.id).length;
    const departmentCount = data.departments.filter(department => department.branchId === branch.id).length;
    const isActive = branch.id === activeBranchId;
    return `<article class="branch-management-card ${isActive ? "is-active" : ""}">
      <div class="branch-card-top"><span class="branch-code">${HRApp.escapeHTML(branch.code)}</span><span class="badge ${branch.status === "Aktif" ? "badge-success" : "badge-neutral"}">${branch.status}</span></div>
      <h4>${HRApp.escapeHTML(branch.name)}</h4>
      <p><span>${HRApp.icon("mapPin")}</span>${HRApp.escapeHTML(branch.city)} · ${HRApp.escapeHTML(branch.address)}</p>
      <div class="branch-card-metrics"><span><strong>${employeeCount}</strong><small>Karyawan</small></span><span><strong>${departmentCount}</strong><small>Departemen</small></span></div>
      <div class="branch-manager"><span class="avatar avatar-sm">${HRApp.initials(branch.manager)}</span><div><small>Penanggung jawab</small><strong>${HRApp.escapeHTML(branch.manager || "Belum ditentukan")}</strong></div></div>
      <div class="branch-card-actions">
        <button class="btn ${isActive ? "btn-secondary" : "btn-outline"} btn-sm" ${isActive ? "disabled" : ""} onclick="activateBranch('${branch.id}')">${isActive ? HRApp.icon("check") + " Cabang Aktif" : "Pilih Cabang"}</button>
        <button class="action-btn" title="Edit cabang" onclick="openBranchForm('${branch.id}')">${HRApp.icon("edit")}</button>
        <button class="action-btn" title="Hapus cabang" onclick="deleteBranch('${branch.id}')">${HRApp.icon("trash")}</button>
      </div>
    </article>`;
  }).join("");
}

function openBranchForm(id = "") {
  const form = document.getElementById("branchForm");
  form.reset();
  document.getElementById("branchId").value = "";
  document.getElementById("branchStatus").value = "Aktif";
  document.getElementById("branchModalTitle").textContent = id ? "Edit Cabang" : "Tambah Cabang";
  if (id) {
    const branch = HRApp.load().branches.find(item => item.id === id);
    if (!branch) return;
    document.getElementById("branchId").value = branch.id;
    document.getElementById("branchName").value = branch.name;
    document.getElementById("branchCode").value = branch.code;
    document.getElementById("branchCity").value = branch.city;
    document.getElementById("branchPhone").value = branch.phone;
    document.getElementById("branchManager").value = branch.manager;
    document.getElementById("branchStatus").value = branch.status;
    document.getElementById("branchAddress").value = branch.address;
  }
  HRApp.refreshCustomSelects();
  HRApp.openModal("branchModal");
}

function saveBranch(event) {
  event.preventDefault();
  const data = HRApp.load();
  const id = document.getElementById("branchId").value;
  const code = document.getElementById("branchCode").value.trim().toUpperCase();
  const duplicate = data.branches.find(branch => branch.code.toUpperCase() === code && branch.id !== id);
  if (duplicate) {
    HRApp.toast("Kode cabang sudah digunakan.", "danger");
    return;
  }
  const previous = data.branches.find(branch => branch.id === id);
  const payload = {
    id:id || nextBranchId(data.branches),
    code,
    name:document.getElementById("branchName").value.trim(),
    city:document.getElementById("branchCity").value.trim(),
    phone:document.getElementById("branchPhone").value.trim() || "-",
    manager:document.getElementById("branchManager").value.trim() || "Belum ditentukan",
    status:document.getElementById("branchStatus").value,
    address:document.getElementById("branchAddress").value.trim()
  };
  if (id) data.branches = data.branches.map(branch => branch.id === id ? payload : branch);
  else data.branches.push(payload);
  HRApp.save(data);
  if (!previous) HRApp.setActiveBranchId(payload.id, data);
  HRApp.closeModal("branchModal");
  HRApp.renderBranchContext();
  renderBranches();
  document.dispatchEvent(new CustomEvent("hrapp:branchchange", { detail:{ branchId:HRApp.getActiveBranchId(data) } }));
  HRApp.toast(id ? "Data cabang diperbarui." : "Cabang baru berhasil ditambahkan.");
}

function nextBranchId(branches) {
  const max = branches.reduce((value, branch) => Math.max(value, Number(String(branch.id).split("-")[1]) || 0), 0);
  return `BR-${String(max + 1).padStart(3, "0")}`;
}

function activateBranch(id) {
  const data = HRApp.load();
  const branch = data.branches.find(item => item.id === id);
  if (!branch) return;
  if (branch.status !== "Aktif") {
    HRApp.toast("Aktifkan status cabang terlebih dahulu.", "danger");
    return;
  }
  HRApp.setActiveBranchId(id, data);
  HRApp.renderBranchContext();
  renderBranches();
  document.dispatchEvent(new CustomEvent("hrapp:branchchange", { detail:{ branchId:id } }));
  HRApp.toast(`${branch.name} sekarang menjadi cabang aktif.`);
}

function deleteBranch(id) {
  const data = HRApp.load();
  const branch = data.branches.find(item => item.id === id);
  if (!branch) return;
  if (data.branches.length <= 1) {
    HRApp.toast("Workspace harus memiliki minimal satu cabang.", "danger");
    return;
  }
  const employeeCount = data.employees.filter(employee => employee.branchId === id).length;
  if (employeeCount) {
    HRApp.toast(`Pindahkan atau hapus ${employeeCount} karyawan dari cabang ini terlebih dahulu.`, "danger");
    return;
  }
  if (!confirm(`Hapus cabang ${branch.name}? Departemen dan data cabang kosong akan ikut dihapus.`)) return;
  data.branches = data.branches.filter(item => item.id !== id);
  data.departments = data.departments.filter(item => item.branchId !== id);
  data.leave = data.leave.filter(item => item.branchId !== id);
  data.payroll = data.payroll.filter(item => item.branchId !== id);
  if (HRApp.getActiveBranchId(data) === id) HRApp.setActiveBranchId(data.branches[0].id, data);
  HRApp.save(data);
  HRApp.renderBranchContext();
  renderBranches();
  HRApp.toast("Cabang berhasil dihapus.");
}

function saveNotifications() {
  const data = HRApp.load();
  ["emailNotifications", "attendanceReminder", "payrollReminder"].forEach(key => data.settings[key] = document.getElementById(key).checked);
  HRApp.save(data);
  HRApp.toast("Preferensi notifikasi disimpan.");
}

function toggleDarkMode(event) {
  const theme = event.target.checked ? "dark" : "light";
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("karyawanku_theme", theme);
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.innerHTML = HRApp.icon(theme === "dark" ? "sun" : "moon");
    themeToggle.setAttribute("aria-label", theme === "dark" ? "Gunakan mode terang" : "Gunakan mode gelap");
  }
  const data = HRApp.load();
  data.settings.darkMode = event.target.checked;
  HRApp.save(data);
  HRApp.toast("Tema tampilan diperbarui.");
}

function backupData() {
  HRApp.download(`karyawanku-multicabang-${HRApp.today()}.json`, JSON.stringify(HRApp.load(), null, 2));
  HRApp.toast("Backup seluruh cabang berhasil diunduh.");
}

function restoreData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data.employees || !data.departments) throw new Error("Format tidak valid");
      HRApp.save(data);
      loadSettings();
      HRApp.renderBranchContext();
      renderBranches();
      HRApp.toast("Data seluruh cabang berhasil dipulihkan.");
    } catch (error) {
      HRApp.toast("File backup tidak valid.", "danger");
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}

function resetData() {
  if (!confirm("Reset seluruh data owner dan semua cabang ke data demo awal?")) return;
  HRApp.reset();
  loadSettings();
  HRApp.renderBranchContext();
  renderBranches();
  HRApp.toast("Data demo multi-cabang berhasil direset.");
}
