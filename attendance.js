let attendanceDraft = {};

document.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.getElementById("attendanceDate");
  dateInput.value = HRApp.today();
  loadAttendance();
  renderCalendar();
  document.getElementById("attendanceSearch").addEventListener("input", renderAttendance);
  document.getElementById("attendanceStatusFilter").addEventListener("input", renderAttendance);
  dateInput.addEventListener("change", () => { loadAttendance(); renderCalendar(); });
  document.getElementById("markAllPresent").addEventListener("click", () => {
    HRApp.scope(HRApp.load()).employees.forEach(employee => {
      attendanceDraft[employee.id] = { status:"Hadir", in:"08:30", out:"17:30", note:"" };
    });
    renderAttendance();
    HRApp.toast("Semua karyawan pada cabang aktif ditandai hadir.");
  });
  document.getElementById("saveAttendance").addEventListener("click", saveAttendance);
  document.addEventListener("hrapp:branchchange", () => {
    document.getElementById("attendanceSearch").value = "";
    document.getElementById("attendanceStatusFilter").value = "";
    HRApp.refreshCustomSelects();
    loadAttendance();
    renderCalendar();
  });
});

function defaultAttendance(index) {
  return { status:index % 7 === 4 ? "Terlambat" : "Hadir", in:index % 7 === 4 ? "09:12" : "08:30", out:"17:30", note:"" };
}

function loadAttendance() {
  const data = HRApp.scope(HRApp.load());
  const selectedDate = document.getElementById("attendanceDate").value;
  attendanceDraft = {};
  data.employees.forEach((employee, index) => {
    attendanceDraft[employee.id] = data.attendance[selectedDate]?.[employee.id] || defaultAttendance(index);
  });
  const subtitle = document.querySelector(".page-head p");
  if (subtitle) subtitle.textContent = `Catat kehadiran tim ${data.branch?.name || "cabang aktif"} tanpa mencampur data cabang lain.`;
  renderAttendance();
}

function renderAttendance() {
  const data = HRApp.scope(HRApp.load());
  const query = document.getElementById("attendanceSearch").value.toLowerCase();
  const filter = document.getElementById("attendanceStatusFilter").value;
  const employees = data.employees.filter(employee => `${employee.name} ${employee.department}`.toLowerCase().includes(query) && (!filter || attendanceDraft[employee.id]?.status === filter));
  document.getElementById("attendanceBody").innerHTML = employees.map(employee => {
    const record = attendanceDraft[employee.id] || defaultAttendance(0);
    return `<tr>
      <td><div class="person-cell"><span class="avatar avatar-md">${HRApp.initials(employee.name)}</span><div><strong>${HRApp.escapeHTML(employee.name)}</strong><small>${employee.id}</small></div></div></td>
      <td>${HRApp.escapeHTML(employee.department)}</td>
      <td><input class="input" style="min-width:110px" type="time" value="${record.in || ""}" onchange="updateAttendance('${employee.id}','in',this.value)"></td>
      <td><input class="input" style="min-width:110px" type="time" value="${record.out || ""}" onchange="updateAttendance('${employee.id}','out',this.value)"></td>
      <td><select class="select" style="min-width:130px" onchange="updateAttendance('${employee.id}','status',this.value)">${["Hadir", "Terlambat", "Izin", "Sakit", "Alpa"].map(value => `<option ${record.status === value ? "selected" : ""}>${value}</option>`).join("")}</select></td>
      <td><input class="input" style="min-width:180px" value="${HRApp.escapeHTML(record.note || "")}" placeholder="Opsional" onchange="updateAttendance('${employee.id}','note',this.value)"></td>
    </tr>`;
  }).join("");
  renderKpis();
}

function updateAttendance(id, key, value) {
  attendanceDraft[id] = attendanceDraft[id] || {};
  attendanceDraft[id][key] = value;
  renderKpis();
}

function renderKpis() {
  const records = Object.values(attendanceDraft);
  const count = status => records.filter(record => record.status === status).length;
  document.getElementById("attendanceKpis").innerHTML = [
    ["Hadir", count("Hadir")], ["Terlambat", count("Terlambat")], ["Tidak hadir", count("Izin") + count("Sakit") + count("Alpa")]
  ].map(item => `<div class="mini-kpi"><span>${item[0]}</span><strong>${item[1]} orang</strong></div>`).join("");
}

function saveAttendance() {
  const data = HRApp.load();
  const selectedDate = document.getElementById("attendanceDate").value;
  data.attendance[selectedDate] = { ...(data.attendance[selectedDate] || {}), ...attendanceDraft };
  HRApp.save(data);
  HRApp.toast(`Absensi ${HRApp.date(selectedDate)} untuk cabang aktif berhasil disimpan.`);
}

function renderCalendar() {
  const selected = new Date(`${document.getElementById("attendanceDate").value}T00:00:00`);
  const day = selected.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const formatter = new Intl.DateTimeFormat("id-ID", { weekday:"short" });
  document.getElementById("calendarStrip").innerHTML = Array.from({ length:7 }, (_, index) => {
    const date = new Date(selected);
    date.setDate(selected.getDate() + mondayOffset + index);
    const iso = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    return `<button class="day-card ${iso === document.getElementById("attendanceDate").value ? "active" : ""} ${[0, 6].includes(date.getDay()) ? "weekend" : ""}" onclick="selectAttendanceDate('${iso}')"><small>${formatter.format(date)}</small><strong>${date.getDate()}</strong></button>`;
  }).join("");
}

function selectAttendanceDate(date) {
  document.getElementById("attendanceDate").value = date;
  loadAttendance();
  renderCalendar();
}
