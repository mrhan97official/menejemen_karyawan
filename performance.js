const REVIEW_DIMENSIONS = [
  ["performance", "Kinerja"],
  ["discipline", "Disiplin"],
  ["collaboration", "Kolaborasi"],
  ["initiative", "Inisiatif"],
  ["communication", "Komunikasi"]
];

document.addEventListener("DOMContentLoaded", () => {
  fillReviewEmployees();
  renderPerformance();

  document.getElementById("addReview").addEventListener("click", () => openReviewForm());
  document.getElementById("performanceForm").addEventListener("submit", saveReview);
  document.getElementById("reviewSearch").addEventListener("input", renderPerformance);
  document.getElementById("reviewPeriodFilter").addEventListener("change", renderPerformance);
  document.getElementById("reviewGradeFilter").addEventListener("change", renderPerformance);
  document.querySelectorAll(".review-score-input").forEach(select => select.addEventListener("change", updateReviewScorePreview));

  document.addEventListener("hrapp:branchchange", () => {
    document.getElementById("reviewSearch").value = "";
    document.getElementById("reviewGradeFilter").value = "";
    fillReviewEmployees();
    renderPerformance();
  });
});

function fillReviewEmployees() {
  const scoped = HRApp.scope(HRApp.load());
  const select = document.getElementById("reviewEmployee");
  const current = select.value;
  select.innerHTML = scoped.employees.length
    ? `<option value="">Pilih karyawan</option>${scoped.employees.map(employee => `<option value="${HRApp.escapeHTML(employee.id)}">${HRApp.escapeHTML(employee.name)} · ${HRApp.escapeHTML(employee.position)}</option>`).join("")}`
    : `<option value="">Belum ada karyawan</option>`;
  if (scoped.employees.some(employee => employee.id === current)) select.value = current;
  HRApp.refreshCustomSelects();
}

function renderPerformance() {
  const scoped = HRApp.scope(HRApp.load());
  const employeeMap = new Map(scoped.employees.map(employee => [employee.id, employee]));
  const reviews = [...(scoped.performanceReviews || [])].sort((a, b) => String(b.reviewDate).localeCompare(String(a.reviewDate)));
  fillReviewPeriods(reviews);

  const query = document.getElementById("reviewSearch").value.trim().toLowerCase();
  const period = document.getElementById("reviewPeriodFilter").value;
  const category = document.getElementById("reviewGradeFilter").value;
  const filtered = reviews.filter(review => {
    const employee = employeeMap.get(review.employeeId);
    const haystack = `${employee?.name || ""} ${employee?.position || ""} ${review.period} ${review.reviewer} ${review.notes || ""}`.toLowerCase();
    const categoryMatch = !category
      || (category === "excellent" && review.overall >= 4.5)
      || (category === "good" && review.overall >= 3.5 && review.overall < 4.5)
      || (category === "develop" && review.overall < 3.5);
    return haystack.includes(query) && (!period || review.period === period) && categoryMatch;
  });

  const tbody = document.getElementById("performanceTableBody");
  tbody.innerHTML = filtered.map(review => renderReviewRow(review, employeeMap.get(review.employeeId))).join("");
  document.getElementById("performanceEmpty").classList.toggle("hidden", filtered.length > 0);
  document.getElementById("reviewResultMeta").textContent = `${filtered.length} dari ${reviews.length} penilaian`;
  document.getElementById("reviewBranchLabel").textContent = scoped.branch?.name || "Cabang aktif";
  renderPerformanceSummary(scoped, reviews);
}

function fillReviewPeriods(reviews) {
  const select = document.getElementById("reviewPeriodFilter");
  const current = select.value;
  const periods = [...new Set(reviews.map(review => review.period).filter(Boolean))].sort().reverse();
  select.innerHTML = `<option value="">Semua Periode</option>${periods.map(period => `<option>${HRApp.escapeHTML(period)}</option>`).join("")}`;
  select.value = periods.includes(current) ? current : "";
  HRApp.refreshCustomSelects();
}

function renderPerformanceSummary(scoped, reviews) {
  const average = reviews.length ? reviews.reduce((sum, review) => sum + Number(review.overall || 0), 0) / reviews.length : 0;
  const reviewedIds = new Set(reviews.map(review => review.employeeId));
  const activeEmployees = scoped.employees.filter(employee => employee.status === "Aktif");
  document.getElementById("averageReviewScore").textContent = average.toFixed(1);
  document.getElementById("reviewedEmployeesCount").textContent = reviewedIds.size;
  document.getElementById("excellentReviewsCount").textContent = reviews.filter(review => review.overall >= 4.5).length;
  document.getElementById("pendingReviewsCount").textContent = Math.max(0, activeEmployees.filter(employee => !reviewedIds.has(employee.id)).length);
}

function renderReviewRow(review, employee) {
  const grade = reviewGrade(review.overall);
  return `<tr>
    <td><div class="person-cell"><span class="avatar avatar-md">${HRApp.initials(employee?.name || "NA")}</span><div><strong>${HRApp.escapeHTML(employee?.name || "Karyawan tidak ditemukan")}</strong><small>${HRApp.escapeHTML(employee?.position || review.employeeId)}</small></div></div></td>
    <td><div class="review-period-cell"><strong>${HRApp.escapeHTML(review.period)}</strong><small>${HRApp.escapeHTML(employee?.department || "-")}</small></div></td>
    <td><div class="reviewer-cell"><strong>${HRApp.escapeHTML(review.reviewer)}</strong><small>${HRApp.escapeHTML(review.notes || "Tanpa catatan")}</small></div></td>
    <td><div class="review-dimensions">${REVIEW_DIMENSIONS.map(([key, label]) => `<span title="${label}: ${review.scores[key]}"><i style="--score:${review.scores[key]}"></i><small>${label.slice(0, 3)}</small></span>`).join("")}</div></td>
    <td><div class="review-final-score"><strong>${Number(review.overall).toFixed(1)}</strong><span class="badge ${grade.badge}">${grade.label}</span></div></td>
    <td>${HRApp.date(review.reviewDate)}</td>
    <td><div class="action-group"><button class="action-btn" title="Edit penilaian" onclick="openReviewForm('${review.id}')">${HRApp.icon("edit")}</button><button class="action-btn" title="Hapus penilaian" onclick="deleteReview('${review.id}')">${HRApp.icon("trash")}</button></div></td>
  </tr>`;
}

function reviewGrade(score) {
  const value = Number(score || 0);
  if (value >= 4.5) return { label:"A+ · Unggul", badge:"badge-success" };
  if (value >= 4) return { label:"A · Sangat Baik", badge:"badge-info" };
  if (value >= 3.5) return { label:"B+ · Baik", badge:"badge-warning" };
  if (value >= 3) return { label:"B · Cukup", badge:"badge-neutral" };
  return { label:"C · Kembangkan", badge:"badge-danger" };
}

function openReviewForm(id = "") {
  const form = document.getElementById("performanceForm");
  form.reset();
  document.getElementById("reviewId").value = "";
  document.getElementById("reviewDate").value = HRApp.today();
  document.getElementById("reviewReviewer").value = HRApp.load().company.ownerName || "Owner";
  document.querySelectorAll(".review-score-input").forEach(select => { select.value = "3"; });
  document.getElementById("performanceModalTitle").textContent = id ? "Edit Penilaian" : "Buat Penilaian";

  if (id) {
    const review = (HRApp.load().performanceReviews || []).find(item => item.id === id);
    if (!review) return;
    document.getElementById("reviewId").value = review.id;
    document.getElementById("reviewEmployee").value = review.employeeId;
    document.getElementById("reviewPeriod").value = review.period;
    document.getElementById("reviewReviewer").value = review.reviewer;
    document.getElementById("reviewDate").value = review.reviewDate;
    document.getElementById("reviewNotes").value = review.notes || "";
    REVIEW_DIMENSIONS.forEach(([key]) => {
      const input = document.getElementById(`score${key.charAt(0).toUpperCase()}${key.slice(1)}`);
      if (input) input.value = String(review.scores[key]);
    });
  }
  updateReviewScorePreview();
  HRApp.refreshCustomSelects();
  HRApp.openModal("performanceModal");
}

function readReviewScores() {
  return {
    performance: Number(document.getElementById("scorePerformance").value),
    discipline: Number(document.getElementById("scoreDiscipline").value),
    collaboration: Number(document.getElementById("scoreCollaboration").value),
    initiative: Number(document.getElementById("scoreInitiative").value),
    communication: Number(document.getElementById("scoreCommunication").value)
  };
}

function calculateReviewOverall(scores) {
  return Number((Object.values(scores).reduce((sum, score) => sum + Number(score), 0) / 5).toFixed(1));
}

function updateReviewScorePreview() {
  const score = calculateReviewOverall(readReviewScores());
  const node = document.getElementById("reviewScorePreview");
  node.textContent = score.toFixed(1);
  node.dataset.grade = reviewGrade(score).label.charAt(0);
}

function saveReview(event) {
  event.preventDefault();
  const data = HRApp.load();
  const id = document.getElementById("reviewId").value;
  const employeeId = document.getElementById("reviewEmployee").value;
  const employee = data.employees.find(item => item.id === employeeId);
  if (!employee) {
    HRApp.toast("Pilih karyawan yang valid.", "danger");
    return;
  }
  const scores = readReviewScores();
  const payload = {
    id: id || HRApp.uid("RV"),
    branchId: employee.branchId,
    employeeId,
    period: document.getElementById("reviewPeriod").value.trim(),
    reviewer: document.getElementById("reviewReviewer").value.trim(),
    reviewDate: document.getElementById("reviewDate").value,
    scores,
    overall: calculateReviewOverall(scores),
    notes: document.getElementById("reviewNotes").value.trim()
  };
  data.performanceReviews = Array.isArray(data.performanceReviews) ? data.performanceReviews : [];
  if (id) data.performanceReviews = data.performanceReviews.map(item => item.id === id ? payload : item);
  else data.performanceReviews.unshift(payload);
  HRApp.save(data);
  HRApp.closeModal("performanceModal");
  renderPerformance();
  HRApp.toast(id ? "Penilaian karyawan diperbarui." : "Penilaian karyawan berhasil disimpan.");
}

function deleteReview(id) {
  const data = HRApp.load();
  const review = (data.performanceReviews || []).find(item => item.id === id);
  if (!review || !confirm("Hapus penilaian ini?")) return;
  data.performanceReviews = data.performanceReviews.filter(item => item.id !== id);
  HRApp.save(data);
  renderPerformance();
  HRApp.toast("Penilaian telah dihapus.");
}
