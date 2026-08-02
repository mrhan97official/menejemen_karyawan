document.addEventListener("DOMContentLoaded", () => {
  renderDashboard();
  drawChart();
  window.addEventListener("resize", drawChart);
  document.getElementById("themeToggle")?.addEventListener("click", () => setTimeout(drawChart, 30));
  document.addEventListener("hrapp:branchchange", () => {
    renderDashboard();
    setTimeout(drawChart, 30);
  });
});

function renderDashboard() {
  const data = HRApp.scope(HRApp.load());
  const today = HRApp.today();
  const activeEmployees = data.employees.filter(item => item.status === "Aktif");
  const pendingLeave = data.leave.filter(item => item.status === "Menunggu").length;
  const totalSalary = activeEmployees.reduce((sum, item) => sum + Number(item.salary || 0), 0);
  const todayAttendance = data.attendance[today] || {};
  const attendanceRecords = Object.values(todayAttendance);
  const presentCount = attendanceRecords.length
    ? attendanceRecords.filter(item => ["Hadir", "Terlambat"].includes(item.status)).length
    : Math.max(0, activeEmployees.length - (activeEmployees.length > 1 ? 1 : 0));
  const attendanceRate = activeEmployees.length ? Math.round((presentCount / activeEmployees.length) * 1000) / 10 : 0;

  const welcome = document.querySelector(".dashboard-welcome h2");
  if (welcome) welcome.innerHTML = `Ringkasan ${HRApp.escapeHTML(data.branch?.name || "Cabang")} <span class="welcome-spark">${HRApp.icon("sparkles")}</span>`;
  const welcomeCopy = document.querySelector(".dashboard-welcome p");
  if (welcomeCopy) welcomeCopy.textContent = `${data.branch?.city || "-"} · ${data.employees.length} karyawan dalam cabang aktif.`;

  renderStats(data, activeEmployees, pendingLeave, totalSalary, presentCount);
  renderDepartments(data);
  renderWorkforce(data);
  renderMonthlyBars();
  renderNewEmployees(data);
  renderLeaveOverview(data);
  renderPayrollOverview(activeEmployees, totalSalary);
  renderActivities(data, pendingLeave, totalSalary);
  renderMapStats(activeEmployees.length, presentCount, pendingLeave);
  renderBottomMetrics(data);

  const rateNode = document.getElementById("attendanceRate");
  if (rateNode) rateNode.textContent = `${attendanceRate || 0}%`;
}

function renderStats(data, activeEmployees, pendingLeave, totalSalary, presentCount) {
  const stats = [
    { icon:"users", label:"Total Karyawan", value:data.employees.length, trend:"↑ 8.6%", accent:"#f3a712", soft:"rgba(243,167,18,.12)" },
    { icon:"userCheck", label:"Karyawan Aktif", value:activeEmployees.length, trend:"↑ 2.4%", accent:"#d9a52e", soft:"rgba(217,165,46,.12)" },
    { icon:"attendance", label:"Hadir Hari Ini", value:presentCount, trend:"↑ 6.1%", accent:"#e6b845", soft:"rgba(230,184,69,.12)" },
    { icon:"leave", label:"Cuti Menunggu", value:pendingLeave, trend:pendingLeave ? "Perlu ditinjau" : "Selesai", accent:"#d48a13", soft:"rgba(212,138,19,.12)" },
    { icon:"wallet", label:"Estimasi Payroll", value:compactMoney(totalSalary), trend:"Per bulan", accent:"#ffbd35", soft:"rgba(255,189,53,.12)" }
  ];
  document.getElementById("statsGrid").innerHTML = stats.map(item => `
    <article class="stat-card" style="--accent:${item.accent};--accent-soft:${item.soft}">
      <div class="stat-top"><span class="stat-icon">${HRApp.icon(item.icon)}</span><span class="stat-trend">${item.trend}</span></div>
      <h3>${item.value}</h3><p>${item.label}</p>
    </article>`).join("");
}

function renderDepartments(data) {
  const departments = data.departments.map(department => {
    const count = data.employees.filter(employee => employee.department === department.name).length;
    const percent = Math.min(100, Math.round((count / Math.max(1, department.target)) * 100));
    return { ...department, count, percent };
  }).sort((a,b) => b.percent - a.percent).slice(0, 5);

  document.getElementById("departmentPerformance").innerHTML = departments.map(item => `
    <div class="performance-item">
      <span class="performance-icon">${HRApp.icon(HRApp.departmentIconKey(item))}</span>
      <div class="performance-copy">
        <strong>${HRApp.escapeHTML(item.name)}</strong>
        <small>${item.count} dari ${item.target} posisi terisi</small>
        <div class="performance-track"><span style="width:${item.percent}%"></span></div>
      </div>
      <span class="performance-value">${item.percent}%</span>
    </div>`).join("");
}

function renderWorkforce(data) {
  const total = Math.max(1, data.employees.length);
  const active = data.employees.filter(item => item.status === "Aktif").length;
  const leave = data.employees.filter(item => item.status === "Cuti").length;
  const inactive = data.employees.filter(item => item.status === "Nonaktif").length;
  const activeEnd = (active / total) * 100;
  const leaveEnd = ((active + leave) / total) * 100;
  const donut = document.getElementById("workforceDonut");
  donut.style.setProperty("--donut-a", `${activeEnd}%`);
  donut.style.setProperty("--donut-b", `${leaveEnd}%`);
  document.getElementById("donutTotal").textContent = data.employees.length;

  const items = [
    ["Aktif", active, "#f3a712"],
    ["Sedang Cuti", leave, "#ad7619"],
    ["Nonaktif", inactive, "#443719"]
  ];
  document.getElementById("workforceLegend").innerHTML = items.map(item => `
    <div class="donut-legend-item" style="--dot:${item[2]}"><i></i><div><strong>${item[0]}</strong><small>${item[1]} orang · ${Math.round(item[1]/total*100)}%</small></div></div>`).join("");
}

function renderMonthlyBars() {
  const values = [68,72,71,76,81,86,91,88,84,89,93,96];
  const labels = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  document.getElementById("monthlyBars").innerHTML = values.map((value,index) => `
    <div class="bar-column"><strong>${value}</strong><span style="height:${value}%"></span><small>${labels[index]}</small></div>`).join("");
}

function renderNewEmployees(data) {
  document.getElementById("newEmployeesBody").innerHTML = [...data.employees]
    .sort((a,b) => b.joinDate.localeCompare(a.joinDate))
    .slice(0, 5)
    .map(employee => `
      <tr>
        <td><div class="person-cell"><span class="avatar avatar-md">${HRApp.initials(employee.name)}</span><div><strong>${HRApp.escapeHTML(employee.name)}</strong><small>${HRApp.escapeHTML(employee.email)}</small></div></div></td>
        <td>${HRApp.escapeHTML(employee.position)}</td>
        <td>${HRApp.escapeHTML(employee.department)}</td>
        <td>${HRApp.date(employee.joinDate)}</td>
        <td><span class="badge ${employee.status === "Aktif" ? "badge-success" : employee.status === "Cuti" ? "badge-warning" : "badge-danger"}">${employee.status}</span></td>
      </tr>`).join("");
}

function renderLeaveOverview(data) {
  const employeeMap = new Map(data.employees.map(item => [item.id, item]));
  document.getElementById("leaveOverviewBody").innerHTML = [...data.leave]
    .sort((a,b) => b.requestedAt.localeCompare(a.requestedAt))
    .slice(0,5)
    .map(item => {
      const employee = employeeMap.get(item.employeeId) || { name:"Karyawan dihapus", department:"-" };
      const badge = item.status === "Disetujui" ? "badge-success" : item.status === "Ditolak" ? "badge-danger" : "badge-warning";
      return `<tr>
        <td><div class="person-cell"><span class="avatar avatar-sm">${HRApp.initials(employee.name)}</span><div><strong>${HRApp.escapeHTML(employee.name)}</strong><small>${HRApp.escapeHTML(employee.department)}</small></div></div></td>
        <td>${HRApp.escapeHTML(item.type)}</td>
        <td>${HRApp.date(item.start, {day:"2-digit", month:"short"})}</td>
        <td><span class="badge ${badge}">${item.status}</span></td>
      </tr>`;
    }).join("");
}

function renderPayrollOverview(activeEmployees, totalSalary) {
  const allowance = activeEmployees.length * 750000;
  const deduction = activeEmployees.length * 150000;
  const takeHome = totalSalary + allowance - deduction;
  const rows = [
    ["Gaji Pokok", totalSalary, 82, "wallet"],
    ["Tunjangan", allowance, 54, "plus"],
    ["Potongan", deduction, 27, "minus"],
    ["Take Home Pay", takeHome, 94, "shieldCheck"]
  ];
  document.getElementById("payrollOverview").innerHTML = `<div class="performance-list">${rows.map(item => `
    <div class="performance-item">
      <span class="performance-icon">${HRApp.icon(item[3])}</span>
      <div class="performance-copy"><strong>${item[0]}</strong><small>${HRApp.money(item[1])}</small><div class="performance-track"><span style="width:${item[2]}%"></span></div></div>
      <span class="performance-value">${item[2]}%</span>
    </div>`).join("")}</div>`;
}

function renderActivities(data, pendingLeave, totalSalary) {
  const activities = [
    ["leave", "Permohonan cuti baru", `${pendingLeave} permohonan masih menunggu persetujuan.`, "5 menit"],
    ["users", "Profil karyawan diperbarui", `${data.employees[0]?.name || "Karyawan"} tercatat aktif di sistem.`, "1 jam"],
    ["attendance", "Absensi hari ini", "Rekap kehadiran tim siap dipantau.", "Hari ini"],
    ["wallet", "Estimasi payroll", `${compactMoney(totalSalary)} total gaji pokok aktif.`, "Bulan ini"]
  ];
  document.getElementById("activityList").innerHTML = activities.map(item => `
    <div class="activity-item"><span class="activity-icon">${HRApp.icon(item[0])}</span><div><strong>${item[1]}</strong><p>${item[2]}</p></div><span class="activity-time">${item[3]}</span></div>`).join("");
}

function renderMapStats(activeCount, presentCount, pendingLeave) {
  const absent = Math.max(0, activeCount - presentCount);
  const stats = [["Hadir",presentCount],["Terlambat",Math.min(1,presentCount)],["Cuti",pendingLeave],["Tidak Hadir",absent]];
  document.getElementById("mapStats").innerHTML = stats.map(item => `<div class="map-stat"><strong>${item[1]}</strong><small>${item[0]}</small></div>`).join("");
}

function renderBottomMetrics(data) {
  const today = new Date();
  const averageTenure = data.employees.length ? data.employees.reduce((sum,item) => {
    const joined = new Date(`${item.joinDate}T00:00:00`);
    return sum + Math.max(0, (today - joined) / 31557600000);
  }, 0) / data.employees.length : 0;
  const activeRate = data.employees.length ? Math.round(data.employees.filter(item => item.status !== "Nonaktif").length / data.employees.length * 100) : 0;
  const metrics = [
    ["building", "Total Departemen", data.departments.length, "↑ terstruktur"],
    ["shieldCheck", "Retensi Karyawan", `${activeRate}%`, "↑ stabil"],
    ["clock", "Rata-rata Masa Kerja", `${averageTenure.toFixed(1)} th`, "↑ bertumbuh"]
  ];
  document.getElementById("bottomMetrics").innerHTML = metrics.map(item => `
    <article class="card bottom-metric"><span class="bottom-metric-icon">${HRApp.icon(item[0])}</span><div><span>${item[1]}</span><strong>${item[2]}</strong><small>${item[3]}</small></div></article>`).join("");
}

function compactMoney(value) {
  const number = Number(value || 0);
  if (number >= 1_000_000_000) return `Rp${(number/1_000_000_000).toFixed(1).replace(".",",")} M`;
  if (number >= 1_000_000) return `Rp${(number/1_000_000).toFixed(1).replace(".",",")} jt`;
  return HRApp.money(number);
}

function drawChart() {
  const canvas = document.getElementById("attendanceChart");
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const w = rect.width;
  const h = rect.height;
  const pad = 28;
  const styles = getComputedStyle(document.documentElement);
  const line = styles.getPropertyValue("--line").trim();
  const muted = styles.getPropertyValue("--muted").trim();
  const primary = styles.getPropertyValue("--primary").trim();
  const surface = styles.getPropertyValue("--surface-solid").trim();
  const present = [72,78,75,84,81,88,94,91,96,93,98,95];
  const late = [19,17,21,15,18,12,9,11,7,9,5,6];
  const labels = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];

  ctx.clearRect(0,0,w,h);
  ctx.font = "7px system-ui";
  ctx.fillStyle = muted;
  ctx.strokeStyle = line;
  ctx.lineWidth = 1;
  [0,25,50,75,100].forEach(value => {
    const y = h - pad - (value/100) * (h-pad*2);
    ctx.beginPath(); ctx.moveTo(pad,y); ctx.lineTo(w-pad,y); ctx.stroke();
    ctx.fillText(`${value}%`, 1, y+3);
  });
  labels.forEach((label,index) => {
    const x = pad + index * (w-pad*2)/(labels.length-1);
    ctx.fillText(label, x-7, h-8);
  });

  const drawLine = (values, color, fill=false) => {
    const points = values.map((value,index) => ({
      x: pad + index * (w-pad*2)/(values.length-1),
      y: h-pad-(value/100)*(h-pad*2)
    }));
    if (fill) {
      const gradient = ctx.createLinearGradient(0,pad,0,h-pad);
      gradient.addColorStop(0,"rgba(243,167,18,.25)");
      gradient.addColorStop(1,"rgba(243,167,18,0)");
      ctx.beginPath(); ctx.moveTo(points[0].x,h-pad); points.forEach(point => ctx.lineTo(point.x,point.y)); ctx.lineTo(points[points.length-1].x,h-pad); ctx.closePath(); ctx.fillStyle=gradient; ctx.fill();
    }
    ctx.beginPath();
    points.forEach((point,index) => index ? ctx.lineTo(point.x,point.y) : ctx.moveTo(point.x,point.y));
    ctx.strokeStyle = color;
    ctx.lineWidth = fill ? 2 : 1.5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();
    points.forEach(point => {
      ctx.beginPath(); ctx.arc(point.x,point.y,2.5,0,Math.PI*2); ctx.fillStyle=surface; ctx.fill(); ctx.strokeStyle=color; ctx.lineWidth=1.2; ctx.stroke();
    });
  };
  drawLine(present, primary, true);
  drawLine(late, "#80672f", false);
}
