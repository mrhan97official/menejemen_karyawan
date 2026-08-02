document.addEventListener("DOMContentLoaded", () => {
  renderDepartments();
  document.getElementById("addDepartment").addEventListener("click", () => openDepartment());
  document.getElementById("departmentForm").addEventListener("submit", saveDepartment);
  document.addEventListener("hrapp:branchchange", renderDepartments);
});

function renderDepartments() {
  const data = HRApp.scope(HRApp.load());
  document.getElementById("departmentGrid").innerHTML = data.departments.map(department => {
    const count = data.employees.filter(employee => employee.department === department.name).length;
    const percent = Math.min(100, Math.round(count / Math.max(1, department.target) * 100));
    return `<article class="card dept-card"><div class="dept-head"><span class="dept-icon">${HRApp.icon(HRApp.departmentIconKey(department))}</span><div class="action-group"><button class="action-btn" onclick="openDepartment('${department.id}')">${HRApp.icon("edit")}</button><button class="action-btn" onclick="deleteDepartment('${department.id}')">${HRApp.icon("trash")}</button></div></div>
      <h3>${HRApp.escapeHTML(department.name)}</h3><p>${HRApp.escapeHTML(department.description)}</p><div class="progress"><span style="width:${percent}%"></span></div>
      <div class="dept-meta"><span>${count} dari ${department.target} anggota</span><span>${percent}%</span></div>
      <div class="card-footer" style="padding:16px 0 0;margin-top:16px"><div class="person-cell"><span class="avatar avatar-sm">${HRApp.initials(department.head)}</span><div><small>Kepala departemen</small><strong>${HRApp.escapeHTML(department.head)}</strong></div></div></div></article>`;
  }).join("");
  const subtitle = document.querySelector(".page-head p");
  if (subtitle) subtitle.textContent = `Struktur organisasi ${data.branch?.name || "cabang aktif"} · ${data.departments.length} departemen.`;
}

function openDepartment(id = "") {
  document.getElementById("departmentForm").reset();
  document.getElementById("departmentId").value = "";
  document.getElementById("departmentIcon").value = "building";
  document.getElementById("departmentModalTitle").textContent = id ? "Edit Departemen" : "Tambah Departemen";
  if (id) {
    const department = HRApp.load().departments.find(item => item.id === id);
    if (!department) return;
    document.getElementById("departmentId").value = department.id;
    document.getElementById("departmentName").value = department.name;
    document.getElementById("departmentIcon").value = HRApp.departmentIconKey(department);
    document.getElementById("departmentHead").value = department.head;
    document.getElementById("departmentTarget").value = department.target;
    document.getElementById("departmentDescription").value = department.description;
  }
  HRApp.refreshCustomSelects();
  HRApp.openModal("departmentModal");
}

function saveDepartment(event) {
  event.preventDefault();
  const data = HRApp.load();
  const branchId = HRApp.getActiveBranchId(data);
  const id = document.getElementById("departmentId").value;
  const old = data.departments.find(department => department.id === id);
  const payload = {
    id:id || HRApp.uid("DEP"),
    branchId:old?.branchId || branchId,
    name:document.getElementById("departmentName").value.trim(),
    icon:document.getElementById("departmentIcon").value || "building",
    head:document.getElementById("departmentHead").value.trim(),
    target:Number(document.getElementById("departmentTarget").value),
    description:document.getElementById("departmentDescription").value.trim()
  };
  if (id) {
    data.departments = data.departments.map(department => department.id === id ? payload : department);
    if (old && old.name !== payload.name) {
      data.employees = data.employees.map(employee => employee.branchId === payload.branchId && employee.department === old.name ? { ...employee, department:payload.name } : employee);
    }
  } else data.departments.push(payload);
  HRApp.save(data);
  HRApp.closeModal("departmentModal");
  renderDepartments();
  HRApp.toast(id ? "Departemen diperbarui." : "Departemen ditambahkan ke cabang aktif.");
}

function deleteDepartment(id) {
  const data = HRApp.load();
  const department = data.departments.find(item => item.id === id);
  if (!department) return;
  const count = data.employees.filter(employee => employee.branchId === department.branchId && employee.department === department.name).length;
  if (count) {
    HRApp.toast(`Pindahkan ${count} karyawan dari departemen ini terlebih dahulu.`, "danger");
    return;
  }
  if (!confirm(`Hapus departemen ${department.name}?`)) return;
  data.departments = data.departments.filter(item => item.id !== id);
  HRApp.save(data);
  renderDepartments();
  HRApp.toast("Departemen dihapus.");
}
