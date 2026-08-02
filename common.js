(function () {
  const STORAGE_KEY = "karyawanku_data_v2_clean";
  const LEGACY_STORAGE_KEYS = ["karyawanku_data_v1"];
  const BRANCH_KEY = "karyawanku_active_branch";

  const ICONS = {
    brand: '<path class="icon-tone" d="M12 2.2 20 5.4v5.8c0 5.2-3.1 8.7-8 10.7-4.9-2-8-5.5-8-10.7V5.4L12 2.2Z"/><path d="M12 2.2 20 5.4v5.8c0 5.2-3.1 8.7-8 10.7-4.9-2-8-5.5-8-10.7V5.4L12 2.2Z"/><path d="m8.2 15.6 2.5-7.2M10.2 12.1l5.5-3.7M10.5 12.1l4.7 3.5"/>',
    dashboard: '<rect class="icon-tone" x="3" y="3" width="7" height="7" rx="2"/><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    users: '<path class="icon-tone" d="M4 20v-1.7c0-2.4 2.2-4.3 5-4.3s5 1.9 5 4.3V20H4Z"/><circle cx="9" cy="7" r="3.2"/><path d="M4 20v-1.7c0-2.4 2.2-4.3 5-4.3s5 1.9 5 4.3V20M15.2 4.4a3 3 0 0 1 0 5.3M16.8 13.4c2 .5 3.2 1.9 3.2 3.8V20"/>',
    gridView: '<rect class="icon-tone" x="3" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    listView: '<rect class="icon-tone" x="3" y="4" width="4" height="4" rx="1"/><rect x="3" y="4" width="4" height="4" rx="1"/><path d="M11 6h10M11 12h10M11 18h10"/><rect x="3" y="10" width="4" height="4" rx="1"/><rect x="3" y="16" width="4" height="4" rx="1"/>',
    shieldOff: '<path class="icon-tone" d="M12 2.5 20 6v5.5c0 4.9-3.2 8.1-8 10-4.8-1.9-8-5.1-8-10V6l8-3.5Z"/><path d="M12 2.5 20 6v5.5c0 4.9-3.2 8.1-8 10-4.8-1.9-8-5.1-8-10V6l8-3.5ZM4 4l16 16"/>',
    phone: '<path class="icon-tone" d="M6.7 3.5 10 7.2 7.9 9.7c1.3 2.8 3.6 5.1 6.4 6.4l2.5-2.1 3.7 3.3-1.1 3.1c-.4 1-1.4 1.6-2.5 1.4C9.4 20.3 3.7 14.6 2.2 7.1 2 6 2.6 5 3.6 4.6l3.1-1.1Z"/><path d="M6.7 3.5 10 7.2 7.9 9.7c1.3 2.8 3.6 5.1 6.4 6.4l2.5-2.1 3.7 3.3-1.1 3.1c-.4 1-1.4 1.6-2.5 1.4C9.4 20.3 3.7 14.6 2.2 7.1 2 6 2.6 5 3.6 4.6l3.1-1.1Z"/>',
    attendance: '<circle class="icon-tone" cx="12" cy="12" r="8.8"/><circle cx="12" cy="12" r="8.8"/><path d="M12 7.2v5.1l3.4 2M8.3 2.8l-1.5-1.2M15.7 2.8l1.5-1.2"/>',
    leave: '<path class="icon-tone" d="M5 4h14v17H5z"/><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M8 2v4M16 2v4M5 9h14M8.5 13h3M8.5 16.5h6"/>',
    wallet: '<path class="icon-tone" d="M3 6.5h17v12H3z"/><path d="M4.5 6.5V5a2 2 0 0 1 2-2H18M3 6.5h17v12H3a1.8 1.8 0 0 1-1.8-1.8V8.3A1.8 1.8 0 0 1 3 6.5Z"/><path d="M15 10h6v5h-6a2.5 2.5 0 0 1 0-5Z"/><circle cx="15.5" cy="12.5" r=".7" fill="currentColor" stroke="none"/>',
    building: '<path class="icon-tone" d="M4 21V4l8-2v19z"/><path d="M4 21V4l8-2v19M12 7h8v14M2 21h20M7 7h2M7 11h2M7 15h2M15 11h2M15 15h2"/>',
    settings: '<circle class="icon-tone" cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    sun: '<circle class="icon-tone" cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path class="icon-tone" d="M20 15.2A8.7 8.7 0 0 1 8.8 4 8.8 8.8 0 1 0 20 15.2Z"/><path d="M20 15.2A8.7 8.7 0 0 1 8.8 4 8.8 8.8 0 1 0 20 15.2Z"/>',
    bell: '<path class="icon-tone" d="M6 17h12l-1.5-2.2V10a4.5 4.5 0 0 0-9 0v4.8L6 17Z"/><path d="M6 17h12l-1.5-2.2V10a4.5 4.5 0 0 0-9 0v4.8L6 17ZM10 20h4"/>',
    chevronDown: '<path d="m6.5 9 5.5 5.5L17.5 9"/>',
    calendar: '<rect class="icon-tone" x="3" y="5" width="18" height="16" rx="2"/><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6M17 2v6M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>',
    search: '<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.2 4.2"/>',
    sparkles: '<path class="icon-tone" d="m12 2 1.4 4.1L17.5 7.5l-4.1 1.4L12 13l-1.4-4.1-4.1-1.4 4.1-1.4L12 2Z"/><path d="m12 2 1.4 4.1L17.5 7.5l-4.1 1.4L12 13l-1.4-4.1-4.1-1.4 4.1-1.4L12 2ZM18.5 14l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2ZM5 14l.6 1.7 1.7.6-1.7.6L5 18.6l-.6-1.7-1.7-.6 1.7-.6L5 14Z"/>',
    logout: '<path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M14 8l4 4-4 4M8 12h10"/>',
    check: '<path d="m5 12.5 4.2 4.2L19.5 6.5"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    download: '<path d="M12 3v12M7.5 10.5 12 15l4.5-4.5M4 20h16"/>',
    upload: '<path d="M12 16V4M7.5 8.5 12 4l4.5 4.5M4 20h16"/>',
    edit: '<path class="icon-tone" d="m4 16 1 4 4-1L19 9l-4-4L4 16Z"/><path d="m4 16 1 4 4-1L19 9l-4-4L4 16ZM13.5 6.5l4 4M4 20h7"/>',
    trash: '<path class="icon-tone" d="M6 7h12l-1 14H7L6 7Z"/><path d="M4 7h16M9 7V3h6v4M9 11v6M15 11v6M6 7l1 14h10l1-14"/>',
    print: '<path class="icon-tone" d="M6 14h12v7H6z"/><path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v7H6zM18 12h.01"/>',
    userCheck: '<circle cx="9" cy="7" r="3.2"/><path class="icon-tone" d="M3.5 20v-1.5c0-2.5 2.4-4.5 5.5-4.5s5.5 2 5.5 4.5V20h-11Z"/><path d="M3.5 20v-1.5c0-2.5 2.4-4.5 5.5-4.5s5.5 2 5.5 4.5V20M15.5 11.5l2 2 4-4"/>',
    shieldCheck: '<path class="icon-tone" d="M12 2.5 20 6v5.5c0 4.9-3.2 8.1-8 10-4.8-1.9-8-5.1-8-10V6l8-3.5Z"/><path d="M12 2.5 20 6v5.5c0 4.9-3.2 8.1-8 10-4.8-1.9-8-5.1-8-10V6l8-3.5Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/>',
    briefcase: '<rect class="icon-tone" x="3" y="7" width="18" height="13" rx="2"/><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V4h6v3M3 12h18M10 12v2h4v-2"/>',
    trendUp: '<path d="M4 17 10 11l4 4 6-8M15 7h5v5"/>',
    activity: '<path d="M3 12h4l2.2-6 4.1 12 2.1-6H21"/>',
    mapPin: '<path class="icon-tone" d="M12 22s7-5.5 7-12a7 7 0 1 0-14 0c0 6.5 7 12 7 12Z"/><path d="M12 22s7-5.5 7-12a7 7 0 1 0-14 0c0 6.5 7 12 7 12Z"/><circle cx="12" cy="10" r="2.3"/>',
    target: '<circle class="icon-tone" cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
    award: '<circle class="icon-tone" cx="12" cy="9" r="6"/><circle cx="12" cy="9" r="6"/><path d="m9.2 14.2-1 7.3 3.8-2.2 3.8 2.2-1-7.3"/><path d="m12 5.5 1 2 2.2.3-1.6 1.6.4 2.2-2-1-2 1 .4-2.2-1.6-1.6 2.2-.3 1-2Z"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20V7M2 20h21"/>',
    refresh: '<path d="M20 7V3l-2 2a8 8 0 1 0 1.2 10M20 3h-4"/>',
    minus: '<path d="M5 12h14"/>',
    clock: '<circle class="icon-tone" cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
    calendarRange: '<rect class="icon-tone" x="3" y="5" width="18" height="16" rx="2"/><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6M17 2v6M3 10h18M7 14h4M13 17h4"/>',
    idCard: '<rect class="icon-tone" x="3" y="5" width="18" height="14" rx="2"/><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8" cy="11" r="2"/><path d="M5.5 16c.5-1.8 1.3-2.8 2.5-2.8s2 .9 2.5 2.8M13 9h5M13 13h5M13 16h3"/>',
    database: '<ellipse class="icon-tone" cx="12" cy="5" rx="8" ry="3"/><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7"/>',
    mail: '<rect class="icon-tone" x="3" y="5" width="18" height="14" rx="2"/><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
    monitor: '<rect class="icon-tone" x="3" y="3" width="18" height="14" rx="2"/><rect x="3" y="3" width="18" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
    cpu: '<rect class="icon-tone" x="6" y="6" width="12" height="12" rx="2"/><rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
    palette: '<path class="icon-tone" d="M12 3a9 9 0 0 0 0 18h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h3a6 6 0 0 0 0-12h-3Z"/><path d="M12 3a9 9 0 0 0 0 18h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h3a6 6 0 0 0 0-12h-3Z"/><circle cx="7.5" cy="10" r=".8" fill="currentColor" stroke="none"/><circle cx="9.5" cy="6.5" r=".8" fill="currentColor" stroke="none"/><circle cx="14" cy="6" r=".8" fill="currentColor" stroke="none"/>',
    megaphone: '<path class="icon-tone" d="m4 10 13-5v14L4 14v-4Z"/><path d="m4 10 13-5v14L4 14v-4ZM17 9c2 0 3 1.3 3 3s-1 3-3 3M6 15l1.5 5h4L10 16"/>',
    workflow: '<rect x="3" y="3" width="6" height="6" rx="1.5"/><rect x="15" y="15" width="6" height="6" rx="1.5"/><rect class="icon-tone" x="15" y="3" width="6" height="6" rx="1.5"/><rect x="15" y="3" width="6" height="6" rx="1.5"/><path d="M9 6h6M18 9v6M6 9v6a3 3 0 0 0 3 3h6"/>',
    undo: '<path d="M9 7 4 12l5 5M4 12h9a7 7 0 0 1 7 7"/>',
    arrowRight: '<path d="M5 12h14M14 7l5 5-5 5"/>'
  };

  function icon(name, className = "", title = "") {
    const body = ICONS[name] || ICONS.sparkles;
    const titleMarkup = title ? `<title>${escapeHTML(title)}</title>` : "";
    return `<svg class="app-icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="${title ? "false" : "true"}" focusable="false">${titleMarkup}${body}</svg>`;
  }

  function hydrateIcons(root = document) {
    const nodes = [];
    if (root instanceof Element && root.matches("[data-icon]")) nodes.push(root);
    if (root.querySelectorAll) nodes.push(...root.querySelectorAll("[data-icon]"));
    nodes.forEach(node => {
      const name = node.dataset.icon;
      if (!name || node.dataset.iconReady === name) return;
      node.innerHTML = icon(name, node.dataset.iconClass || "", node.dataset.iconTitle || "");
      node.dataset.iconReady = name;
    });
  }

  const seedData = {
    company: {
      name: "",
      ownerName: "",
      ownerEmail: "",
      email: "",
      phone: "",
      address: ""
    },
    settings: {
      darkMode: true,
      emailNotifications: true,
      attendanceReminder: true,
      payrollReminder: true
    },
    branches: [],
    employees: [],
    departments: [],
    attendance: {},
    leave: [],
    performanceReviews: [],
    payroll: []
  };

  function clone(data) { return JSON.parse(JSON.stringify(data)); }
  function normalizeData(raw) {
    const source = raw && typeof raw === "object" ? raw : {};
    const data = {
      company: {
        ...clone(seedData.company),
        ...(source.company && typeof source.company === "object" ? source.company : {})
      },
      settings: {
        ...clone(seedData.settings),
        ...(source.settings && typeof source.settings === "object" ? source.settings : {})
      },
      branches: Array.isArray(source.branches) ? source.branches : [],
      employees: Array.isArray(source.employees) ? source.employees : [],
      departments: Array.isArray(source.departments) ? source.departments : [],
      attendance: source.attendance && typeof source.attendance === "object" ? source.attendance : {},
      leave: Array.isArray(source.leave) ? source.leave : [],
      performanceReviews: Array.isArray(source.performanceReviews) ? source.performanceReviews : [],
      payroll: Array.isArray(source.payroll) ? source.payroll : []
    };

    data.branches = data.branches.map((branch) => ({
      id: String(branch.id || uid("BR")),
      code: String(branch.code || "").trim().slice(0, 4).toUpperCase(),
      name: String(branch.name || "").trim(),
      city: String(branch.city || "").trim(),
      address: String(branch.address || "").trim(),
      phone: String(branch.phone || "").trim(),
      manager: String(branch.manager || "").trim(),
      status: branch.status === "Nonaktif" ? "Nonaktif" : "Aktif"
    }));

    const validBranchIds = new Set(data.branches.map(branch => branch.id));
    const branchFallback = data.branches[0]?.id || "";
    const employeeStatuses = new Set(["Aktif", "Cuti", "Probation", "Resign", "Mutasi", "Blacklist"]);

    data.employees = data.employees.map(employee => {
      const normalizedStatus = employeeStatuses.has(employee.status)
        ? employee.status
        : employee.status === "Nonaktif"
          ? "Resign"
          : "Aktif";

      return {
        ...employee,
        id: String(employee.id || uid("EMP")),
        name: String(employee.name || "").trim(),
        email: String(employee.email || "").trim(),
        phone: String(employee.phone || "").trim(),
        position: String(employee.position || "").trim(),
        department: String(employee.department || "").trim(),
        joinDate: String(employee.joinDate || ""),
        salary: Number(employee.salary || 0),
        bank: String(employee.bank || "").trim(),
        accountNumber: String(employee.accountNumber || employee.bankAccount || "").trim(),
        status: normalizedStatus,
        statusReason: normalizedStatus === "Aktif"
          ? ""
          : String(employee.statusReason || employee.reason || "").trim(),
        statusChangedAt: String(employee.statusChangedAt || ""),
        statusHistory: Array.isArray(employee.statusHistory)
          ? employee.statusHistory.map(entry => ({
              from: String(entry.from || ""),
              to: employeeStatuses.has(entry.to) ? entry.to : normalizedStatus,
              reason: String(entry.reason || "").trim(),
              changedAt: String(entry.changedAt || "")
            }))
          : [],
        branchId: validBranchIds.has(employee.branchId) ? employee.branchId : branchFallback
      };
    });

    const employeeBranch = new Map(data.employees.map(employee => [employee.id, employee.branchId]));

    data.departments = data.departments.map(department => ({
      ...department,
      id: String(department.id || uid("DEP")),
      name: String(department.name || "").trim(),
      head: String(department.head || "").trim(),
      target: Number(department.target || 0),
      icon: String(department.icon || "building"),
      description: String(department.description || "").trim(),
      branchId: validBranchIds.has(department.branchId) ? department.branchId : branchFallback
    }));

    data.leave = data.leave.map(item => ({
      ...item,
      id: String(item.id || uid("LV")),
      branchId: validBranchIds.has(item.branchId)
        ? item.branchId
        : employeeBranch.get(item.employeeId) || branchFallback
    }));

    data.payroll = data.payroll.map(item => ({
      ...item,
      id: String(item.id || uid("PAY")),
      branchId: validBranchIds.has(item.branchId)
        ? item.branchId
        : employeeBranch.get(item.employeeId) || branchFallback
    }));

    data.performanceReviews = data.performanceReviews.map(item => {
      const scores = item.scores && typeof item.scores === "object" ? item.scores : {};
      const normalizedScores = {
        performance: Math.min(5, Math.max(1, Number(scores.performance || 1))),
        discipline: Math.min(5, Math.max(1, Number(scores.discipline || 1))),
        collaboration: Math.min(5, Math.max(1, Number(scores.collaboration || 1))),
        initiative: Math.min(5, Math.max(1, Number(scores.initiative || 1))),
        communication: Math.min(5, Math.max(1, Number(scores.communication || 1)))
      };
      const calculatedOverall = Object.values(normalizedScores)
        .reduce((sum, value) => sum + value, 0) / 5;

      return {
        ...item,
        id: String(item.id || uid("RV")),
        branchId: validBranchIds.has(item.branchId)
          ? item.branchId
          : employeeBranch.get(item.employeeId) || branchFallback,
        scores: normalizedScores,
        overall: Number(item.overall || calculatedOverall.toFixed(1)),
        period: String(item.period || "").trim(),
        reviewer: String(item.reviewer || data.company.ownerName || "").trim(),
        reviewDate: String(item.reviewDate || ""),
        notes: String(item.notes || "").trim()
      };
    });

    return data;
  }

  function clearLegacyStorage() {
    LEGACY_STORAGE_KEYS.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        // Penyimpanan dapat dibatasi oleh browser.
      }
    });
  }

  function load() {
    try {
      clearLegacyStorage();
      const saved = localStorage.getItem(STORAGE_KEY);
      const data = normalizeData(saved ? JSON.parse(saved) : seedData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    } catch (error) {
      console.warn("Data lokal tidak dapat dibaca.", error);
      return normalizeData(seedData);
    }
  }

  function save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeData(data)));
  }

  function reset() {
    clearLegacyStorage();
    localStorage.removeItem(BRANCH_KEY);
    const data = normalizeData(seedData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return clone(data);
  }

  function getActiveBranchId(data = load()) {
    const saved = localStorage.getItem(BRANCH_KEY);
    const fallback = data.branches.find(branch => branch.status === "Aktif")?.id || data.branches[0]?.id || "";
    const active = data.branches.some(branch => branch.id === saved) ? saved : fallback;
    if (active) localStorage.setItem(BRANCH_KEY, active);
    return active;
  }
  function setActiveBranchId(branchId, data = load()) {
    if (!data.branches.some(branch => branch.id === branchId)) return false;
    localStorage.setItem(BRANCH_KEY, branchId);
    return true;
  }
  function getActiveBranch(data = load()) {
    const branchId = getActiveBranchId(data);
    return data.branches.find(branch => branch.id === branchId) || data.branches[0] || null;
  }
  function scope(data = load(), branchId = getActiveBranchId(data)) {
    const employees = data.employees.filter(employee => employee.branchId === branchId);
    const employeeIds = new Set(employees.map(employee => employee.id));
    const attendance = Object.fromEntries(Object.entries(data.attendance || {}).map(([dateKey, records]) => [
      dateKey,
      Object.fromEntries(Object.entries(records || {}).filter(([employeeId]) => employeeIds.has(employeeId)))
    ]));
    return {
      ...data,
      branchId,
      branch: data.branches.find(branch => branch.id === branchId) || null,
      employees,
      departments: data.departments.filter(department => department.branchId === branchId),
      leave: data.leave.filter(item => item.branchId === branchId || employeeIds.has(item.employeeId)),
      payroll: data.payroll.filter(item => item.branchId === branchId || employeeIds.has(item.employeeId)),
      performanceReviews: data.performanceReviews.filter(item => item.branchId === branchId || employeeIds.has(item.employeeId)),
      attendance
    };
  }
  function uid(prefix) { return `${prefix}-${Date.now().toString(36).toUpperCase().slice(-6)}`; }
  function initials(name="") {
    return name.split(/\s+/).filter(Boolean).slice(0,2).map(word => word[0]).join("").toUpperCase() || "NA";
  }
  function money(value) {
    return new Intl.NumberFormat("id-ID", { style:"currency", currency:"IDR", maximumFractionDigits:0 }).format(Number(value || 0));
  }
  function date(value, options={ day:"2-digit", month:"short", year:"numeric" }) {
    if (!value) return "-";
    return new Intl.DateTimeFormat("id-ID", options).format(new Date(value + (value.length === 10 ? "T00:00:00" : "")));
  }
  function escapeHTML(value="") {
    return String(value).replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[char]));
  }
  function departmentIconKey(department) {
    const valid = Object.prototype.hasOwnProperty.call(ICONS, department?.icon) ? department.icon : "";
    if (valid) return valid;
    const name = String(department?.name || "").toLowerCase();
    if (name.includes("tech")) return "cpu";
    if (name.includes("design")) return "palette";
    if (name.includes("people") || name.includes("human") || name.includes("hr")) return "users";
    if (name.includes("sales")) return "trendUp";
    if (name.includes("finance")) return "wallet";
    if (name.includes("market")) return "megaphone";
    if (name.includes("operation")) return "workflow";
    return "building";
  }
  function toast(message, type="success") {
    const root = document.getElementById("toastContainer");
    if (!root) return;
    const isDanger = type === "danger";
    const el = document.createElement("div");
    el.className = `toast ${isDanger ? "toast-danger" : ""}`;
    el.innerHTML = `<span class="toast-icon">${icon(isDanger ? "close" : "check")}</span><div><strong>${isDanger ? "Terjadi kesalahan" : "Berhasil"}</strong><small>${escapeHTML(message)}</small></div><button aria-label="Tutup">${icon("close")}</button>`;
    root.appendChild(el);
    el.querySelector("button").addEventListener("click", () => el.remove());
    setTimeout(() => el.remove(), 3500);
  }
  function openModal(id) {
    document.getElementById(id)?.classList.add("open");
    requestAnimationFrame(refreshCustomSelects);
  }
  function closeModal(id) { document.getElementById(id)?.classList.remove("open"); closeAllSelects(); }
  function download(filename, content, mime="application/json") {
    const blob = new Blob([content], { type:mime });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = filename; anchor.click();
    URL.revokeObjectURL(url);
  }
  function today() {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset()*60000);
    return local.toISOString().slice(0,10);
  }

  const luxurySelects = new Set();
  let openSelect = null;
  let selectCounter = 0;

  function selectedOption(select) {
    return select.options[select.selectedIndex] || select.options[0] || null;
  }

  function renderSelectMenu(instance) {
    const { select, menu } = instance;
    menu.innerHTML = Array.from(select.options).map((option, index) => {
      const selected = option.selected;
      const disabled = option.disabled;
      return `<button type="button" class="lux-select-option ${selected ? "selected" : ""}" data-option-index="${index}" role="option" aria-selected="${selected}" ${disabled ? "disabled" : ""}><span class="lux-option-copy"><strong>${escapeHTML(option.textContent.trim())}</strong>${option.dataset.description ? `<small>${escapeHTML(option.dataset.description)}</small>` : ""}</span><span class="lux-option-check">${selected ? icon("check") : ""}</span></button>`;
    }).join("") || `<div class="lux-select-empty">Belum ada pilihan</div>`;
  }

  function syncLuxurySelect(instance) {
    if (!instance || !instance.select.isConnected) return;
    const { select, trigger, label } = instance;
    const option = selectedOption(select);
    label.textContent = option ? option.textContent.trim() : "Pilih opsi";
    trigger.classList.toggle("is-placeholder", !option || option.value === "");
    trigger.disabled = select.disabled;
    trigger.setAttribute("aria-disabled", String(select.disabled));
    if (openSelect === instance) renderSelectMenu(instance);
  }

  function positionSelectMenu(instance) {
    const { trigger, menu } = instance;
    const rect = trigger.getBoundingClientRect();
    const viewportPadding = 10;
    const width = Math.max(rect.width, 190);
    menu.style.width = `${Math.min(width, window.innerWidth - viewportPadding * 2)}px`;
    menu.style.left = `${Math.min(Math.max(viewportPadding, rect.left), window.innerWidth - Math.min(width, window.innerWidth - viewportPadding * 2) - viewportPadding)}px`;
    menu.style.top = `${rect.bottom + 7}px`;
    menu.classList.add("open");
    const menuHeight = Math.min(menu.scrollHeight, 286);
    const below = window.innerHeight - rect.bottom - viewportPadding;
    const above = rect.top - viewportPadding;
    if (below < menuHeight && above > below) {
      menu.style.top = `${Math.max(viewportPadding, rect.top - menuHeight - 7)}px`;
      menu.classList.add("opens-up");
    } else {
      menu.classList.remove("opens-up");
    }
  }

  function closeLuxurySelect(instance, returnFocus = false) {
    if (!instance) return;
    instance.wrapper.classList.remove("open");
    instance.menu.classList.remove("open", "opens-up");
    instance.trigger.setAttribute("aria-expanded", "false");
    if (openSelect === instance) openSelect = null;
    if (returnFocus) instance.trigger.focus();
  }

  function closeAllSelects() {
    if (openSelect) closeLuxurySelect(openSelect);
  }

  function openLuxurySelect(instance) {
    if (instance.select.disabled) return;
    if (openSelect && openSelect !== instance) closeLuxurySelect(openSelect);
    syncLuxurySelect(instance);
    renderSelectMenu(instance);
    instance.wrapper.classList.add("open");
    instance.trigger.setAttribute("aria-expanded", "true");
    openSelect = instance;
    positionSelectMenu(instance);
  }

  function focusSelectOption(instance, direction = 1) {
    const options = [...instance.menu.querySelectorAll(".lux-select-option:not(:disabled)")];
    if (!options.length) return;
    const active = document.activeElement;
    const current = options.indexOf(active);
    const next = current < 0 ? (direction > 0 ? 0 : options.length - 1) : (current + direction + options.length) % options.length;
    options[next].focus();
  }

  function initLuxurySelect(select) {
    if (!(select instanceof HTMLSelectElement) || select.dataset.luxSelect === "true") return;
    select.dataset.luxSelect = "true";

    const wrapper = document.createElement("div");
    wrapper.className = `lux-select ${select.classList.contains("card-select") ? "lux-select-card" : ""}`;
    if (select.style.minWidth) wrapper.style.minWidth = select.style.minWidth;
    if (select.style.width) wrapper.style.width = select.style.width;

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "lux-select-trigger";
    const menuId = `lux-select-menu-${++selectCounter}`;
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-controls", menuId);
    trigger.innerHTML = `<span class="lux-select-value"></span><span class="lux-select-chevron">${icon("chevronDown")}</span>`;

    const menu = document.createElement("div");
    menu.className = "lux-select-menu";
    menu.id = menuId;
    menu.setAttribute("role", "listbox");
    menu.setAttribute("aria-label", select.getAttribute("aria-label") || select.closest(".form-group")?.querySelector("label")?.textContent?.trim() || "Pilihan");

    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(select);
    wrapper.appendChild(trigger);
    document.body.appendChild(menu);
    select.classList.add("lux-select-native");

    const instance = { select, wrapper, trigger, menu, label: trigger.querySelector(".lux-select-value"), observer: null };
    wrapper._luxSelectInstance = instance;
    luxurySelects.add(instance);

    trigger.addEventListener("click", event => {
      event.stopPropagation();
      openSelect === instance ? closeLuxurySelect(instance) : openLuxurySelect(instance);
    });
    trigger.addEventListener("keydown", event => {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        if (openSelect !== instance) openLuxurySelect(instance);
        requestAnimationFrame(() => focusSelectOption(instance, event.key === "ArrowUp" ? -1 : 1));
      }
    });
    menu.addEventListener("click", event => {
      const optionButton = event.target.closest(".lux-select-option");
      if (!optionButton || optionButton.disabled) return;
      const option = select.options[Number(optionButton.dataset.optionIndex)];
      if (!option) return;
      select.value = option.value;
      select.dispatchEvent(new Event("input", { bubbles:true }));
      select.dispatchEvent(new Event("change", { bubbles:true }));
      syncLuxurySelect(instance);
      closeLuxurySelect(instance, true);
    });
    menu.addEventListener("keydown", event => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        focusSelectOption(instance, event.key === "ArrowDown" ? 1 : -1);
      } else if (event.key === "Escape") {
        event.preventDefault();
        closeLuxurySelect(instance, true);
      }
    });
    select.addEventListener("input", () => syncLuxurySelect(instance));
    select.addEventListener("change", () => syncLuxurySelect(instance));
    select.addEventListener("focus", () => trigger.focus());

    instance.observer = new MutationObserver(() => syncLuxurySelect(instance));
    instance.observer.observe(select, { childList:true, subtree:true, attributes:true, attributeFilter:["selected", "disabled", "label"] });
    syncLuxurySelect(instance);
  }

  function initLuxurySelects(root = document) {
    if (root instanceof HTMLSelectElement && (root.matches("select.select") || root.matches("select.card-select"))) initLuxurySelect(root);
    if (root.querySelectorAll) root.querySelectorAll("select.select, select.card-select").forEach(initLuxurySelect);
  }

  function refreshCustomSelects() {
    luxurySelects.forEach(instance => syncLuxurySelect(instance));
  }

  function cleanupLuxurySelects(root) {
    if (!(root instanceof Element)) return;
    const wrappers = root.matches(".lux-select") ? [root] : [...root.querySelectorAll(".lux-select")];
    wrappers.forEach(wrapper => {
      const instance = wrapper._luxSelectInstance;
      if (!instance) return;
      instance.observer?.disconnect();
      instance.menu.remove();
      luxurySelects.delete(instance);
      if (openSelect === instance) openSelect = null;
    });
  }

  function createPortalDropdown(anchor, className, html) {
    const menu = document.createElement("div");
    menu.className = `portal-dropdown ${className}`;
    menu.innerHTML = html;
    document.body.appendChild(menu);
    let open = false;

    const position = () => {
      const rect = anchor.getBoundingClientRect();
      const width = Math.min(286, window.innerWidth - 20);
      const left = Math.min(Math.max(10, rect.right - width), window.innerWidth - width - 10);
      menu.style.width = `${width}px`;
      menu.style.left = `${left}px`;
      menu.style.top = `${rect.bottom + 8}px`;
    };
    const close = () => {
      open = false;
      menu.classList.remove("open");
      anchor.classList.remove("dropdown-open");
      anchor.setAttribute("aria-expanded", "false");
    };
    const toggle = event => {
      event?.stopPropagation();
      open = !open;
      document.querySelectorAll(".portal-dropdown.open").forEach(node => { if (node !== menu) node.classList.remove("open"); });
      if (open) {
        position();
        menu.classList.add("open");
        anchor.classList.add("dropdown-open");
        anchor.setAttribute("aria-expanded", "true");
      } else close();
    };
    anchor.setAttribute("role", anchor.tagName === "BUTTON" ? "button" : "button");
    anchor.setAttribute("aria-haspopup", "menu");
    anchor.setAttribute("aria-expanded", "false");
    if (anchor.tagName !== "BUTTON") anchor.tabIndex = 0;
    anchor.addEventListener("click", toggle);
    anchor.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); toggle(event); }
      if (event.key === "Escape") close();
    });
    menu.addEventListener("click", event => event.stopPropagation());
    document.addEventListener("click", close);
    window.addEventListener("resize", close);
    document.addEventListener("scroll", close, true);
    return { menu, close };
  }

  function initHeaderDropdowns() {
    const profile = document.querySelector(".profile");
    if (profile) {
      const profileData = load();
      const auth = window.KaryawanKuAuth?.getAuth?.();
      const accountName = auth?.name || auth?.username || profileData.company.ownerName || "";
      const accountIdentity = auth?.role || profileData.company.ownerEmail || profileData.company.email || "";

      createPortalDropdown(profile, "profile-popover", `
        <div class="portal-dropdown-head"><span class="avatar avatar-md">${accountName ? initials(accountName) : ""}</span><div><strong>${escapeHTML(accountName || "Akun pengguna")}</strong><small>${escapeHTML(accountIdentity)}</small></div></div>
        <div class="portal-dropdown-list">
          <a href="settings.html#settings-company">${icon("shieldCheck")}<span><strong>Profil owner</strong><small>Identitas pemilik dan perusahaan</small></span></a>
          <a href="settings.html#settings-branches">${icon("building")}<span><strong>Manajemen cabang</strong><small>Kelola seluruh lokasi bisnis</small></span></a>
          <a href="settings.html#settings-data">${icon("database")}<span><strong>Data & backup</strong><small>Cadangkan seluruh workspace</small></span></a>
          <a class="danger-link" href="login.html" data-logout>${icon("logout")}<span><strong>Keluar</strong><small>Akhiri sesi saat ini</small></span></a>
        </div>`);
    }

    const notification = document.querySelector(".notification-btn");
    if (notification) {
      notification.querySelector(".notification-dot")?.setAttribute("hidden", "");
      createPortalDropdown(notification, "notification-popover", `
        <div class="portal-dropdown-title"><div><strong>Notifikasi</strong><small>Pembaruan workspace</small></div></div>
        <div class="notification-list">
          <div class="notification-empty">${icon("bell")}<strong>Belum ada notifikasi</strong><small>Notifikasi baru akan muncul di sini.</small></div>
        </div>`);
    }
  }

  function renderBranchContext() {
    const data = load();
    const activeBranch = getActiveBranch(data);
    const sidebar = document.querySelector(".sidebar");
    if (sidebar && !document.getElementById("branchContext")) {
      const panel = document.createElement("section");
      panel.className = "branch-context";
      panel.id = "branchContext";
      panel.innerHTML = `
        <div class="branch-context-label"><span>${icon("building")}</span><div><small>OWNER WORKSPACE</small><strong>Cabang aktif</strong></div></div>
        <select class="select branch-switcher" id="branchSwitcher" aria-label="Pilih cabang"></select>
        <div class="branch-context-meta" id="branchContextMeta"></div>`;
      sidebar.querySelector(".brand")?.insertAdjacentElement("afterend", panel);
      initLuxurySelects(panel);
    }

    const select = document.getElementById("branchSwitcher");
    if (select) {
      select.innerHTML = data.branches.length
        ? data.branches.map(branch => `<option value="${escapeHTML(branch.id)}" data-description="${escapeHTML(`${branch.city || "Lokasi belum diisi"} · ${branch.status}`)}" ${branch.id === activeBranch?.id ? "selected" : ""}>${escapeHTML(branch.code || "—")} · ${escapeHTML(branch.name || "Cabang tanpa nama")}</option>`).join("")
        : '<option value="" selected disabled>Belum ada cabang</option>';
      select.value = activeBranch?.id || "";
      if (!select.dataset.branchBound) {
        select.dataset.branchBound = "true";
        select.addEventListener("change", () => {
          const latest = load();
          if (!setActiveBranchId(select.value, latest)) return;
          updateBranchLabels(latest);
          refreshCustomSelects();
          document.dispatchEvent(new CustomEvent("hrapp:branchchange", { detail:{ branchId:select.value } }));
          toast(`Cabang aktif diubah ke ${getActiveBranch(latest)?.name || "cabang terpilih"}.`);
        });
      }
      refreshCustomSelects();
    }
    updateBranchLabels(data);
  }

  function updateBranchLabels(data = load()) {
    const branch = getActiveBranch(data);
    const employeeCount = data.employees.filter(employee => employee.branchId === branch?.id).length;
    const meta = document.getElementById("branchContextMeta");
    if (meta) meta.innerHTML = branch
      ? `<span class="branch-status-dot"></span><span>${escapeHTML(branch.city || "Lokasi belum diisi")} · ${employeeCount} karyawan</span>`
      : `<span class="branch-status-dot is-empty"></span><span>Belum ada cabang</span>`;
    const profileName = document.getElementById("profileName");
    if (profileName) profileName.textContent = data.company.ownerName || "Owner";
    const profileAvatar = document.querySelector(".profile .avatar");
    if (profileAvatar) profileAvatar.textContent = initials(data.company.ownerName || "Owner");
    const profileRole = document.querySelector(".profile small");
    if (profileRole) profileRole.textContent = `Owner · ${data.branches.length} cabang`;
    document.documentElement.dataset.branch = branch?.id || "";
  }


  function getPageFileName(pathname = window.location.pathname) {
    const cleanPath = decodeURIComponent(pathname)
      .replace(/\\/g, "/")
      .replace(/\/+$/, "");
    return cleanPath.split("/").pop() || "index.html";
  }

  function setActiveSidebarLink() {
    const nav = document.querySelector(".nav-menu");
    if (!nav) return;

    const currentUrl = new URL(window.location.href);
    const currentFile = getPageFileName(currentUrl.pathname).toLowerCase();
    const links = [...nav.querySelectorAll("a[data-sidebar-link][href]")];

    links.forEach(link => {
      link.classList.remove("active");
      link.removeAttribute("aria-current");
    });
    nav.querySelectorAll(".nav-group.is-current").forEach(group => group.classList.remove("is-current"));

    const samePageLinks = links.filter(link => {
      let linkUrl;
      try {
        linkUrl = new URL(link.getAttribute("href"), window.location.href);
      } catch {
        return false;
      }

      if (linkUrl.origin !== currentUrl.origin) return false;
      return getPageFileName(linkUrl.pathname).toLowerCase() === currentFile;
    });

    const specificMatches = samePageLinks.filter(link => {
      const linkUrl = new URL(link.getAttribute("href"), window.location.href);
      const expectedParams = [...linkUrl.searchParams.entries()];
      return expectedParams.length > 0 && expectedParams.every(([key, value]) => currentUrl.searchParams.get(key) === value);
    });

    const baseMatches = samePageLinks.filter(link => {
      const linkUrl = new URL(link.getAttribute("href"), window.location.href);
      return [...linkUrl.searchParams.keys()].length === 0;
    });

    const activeLinks = specificMatches.length ? specificMatches : baseMatches.slice(0, 1);

    activeLinks.forEach(link => {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");

      const group = link.closest(".nav-group");
      if (!group) return;

      group.classList.add("is-current", "open");
      group.querySelector('[data-nav-toggle]')?.setAttribute("aria-expanded", "true");

      const parentLink = group.querySelector(".nav-parent-link");
      if (parentLink && parentLink !== link) parentLink.classList.add("active");
    });
  }

  function initEmployeeSidebarNav() {
    const group = document.querySelector('[data-nav-group="employees"]');
    if (!group) return;
    const toggle = group.querySelector('[data-nav-toggle="employees"]');
    const submenu = group.querySelector('.nav-submenu');
    const isEmployeePage = getPageFileName(window.location.pathname).toLowerCase() === "employees.html";
    const currentStatus = new URLSearchParams(window.location.search).get("status") || "";

    const setOpen = open => {
      group.classList.toggle("open", open);
      toggle?.setAttribute("aria-expanded", String(open));
      toggle?.setAttribute("aria-label", `${open ? "Tutup" : "Buka"} submenu Data Karyawan`);
    };

    if (isEmployeePage) {
      group.classList.add("is-current");
      setOpen(true);
    } else {
      setOpen(localStorage.getItem("karyawanku_employee_menu_open") === "true");
    }

    toggle?.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      const next = !group.classList.contains("open");
      setOpen(next);
      localStorage.setItem("karyawanku_employee_menu_open", String(next));
    });

    group.querySelectorAll("[data-employee-status]").forEach(link => {
      const active = isEmployeePage && link.dataset.employeeStatus === currentStatus;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });

    const updateCounts = () => {
      const scoped = scope(load());
      group.querySelectorAll("[data-status-count]").forEach(node => {
        node.textContent = scoped.employees.filter(employee => employee.status === node.dataset.statusCount).length;
      });
    };
    updateCounts();
    document.addEventListener("hrapp:branchchange", updateCounts);
    document.addEventListener("hrapp:employeeschanged", updateCounts);
  }

  function initPageTransitions() {
    requestAnimationFrame(() => document.body.classList.add("page-ready"));
    window.addEventListener("pageshow", () => document.body.classList.remove("page-leaving"));
    document.querySelectorAll('a[href]').forEach(anchor => {
      const href = anchor.getAttribute("href") || "";
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || anchor.target === "_blank") return;
      let url;
      try { url = new URL(anchor.href, window.location.href); } catch { return; }
      if (url.origin !== window.location.origin || !url.pathname.endsWith(".html")) return;
      anchor.addEventListener("mouseenter", () => {
        if (document.head.querySelector(`link[data-prefetch="${url.pathname}"]`)) return;
        const link = document.createElement("link");
        link.rel = "prefetch";
        link.href = url.href;
        link.dataset.prefetch = url.pathname;
        document.head.appendChild(link);
      }, { once:true });
      anchor.addEventListener("click", event => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || anchor.hasAttribute("download")) return;
        if (url.href === window.location.href) return;
        event.preventDefault();
        closeAllSelects();
        document.body.classList.add("page-leaving");
        setTimeout(() => { window.location.href = url.href; }, 135);
      });
    });
  }

  function initCommon() {
    hydrateIcons();
    initLuxurySelects();

    const bodyObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (!(node instanceof Element)) return;
          hydrateIcons(node);
          initLuxurySelects(node);
        });
        mutation.removedNodes.forEach(cleanupLuxurySelects);
      });
    });
    bodyObserver.observe(document.body, { childList:true, subtree:true });

    document.addEventListener("click", event => {
      if (openSelect && !openSelect.wrapper.contains(event.target) && !openSelect.menu.contains(event.target)) closeLuxurySelect(openSelect);
    });
    document.addEventListener("scroll", closeAllSelects, true);
    window.addEventListener("resize", closeAllSelects);

    const bodyPage = document.body.dataset.page;
    setActiveSidebarLink();
    window.addEventListener("pageshow", setActiveSidebarLink);
    window.addEventListener("popstate", setActiveSidebarLink);
    window.addEventListener("hashchange", setActiveSidebarLink);

    const titles = {
      dashboard:["Ringkasan", "Dashboard"],
      employees:["Tim Anda", "Data Karyawan"],
      performance:["Pengembangan Tim", "Penilaian Karyawan"],
      attendance:["Kehadiran", "Absensi Karyawan"],
      leave:["Permohonan", "Cuti & Izin"],
      payroll:["Keuangan", "Penggajian"],
      departments:["Organisasi", "Departemen"],
      settings:["Sistem", "Pengaturan"]
    };
    if (titles[bodyPage]) {
      document.getElementById("pageEyebrow").textContent = titles[bodyPage][0];
      document.getElementById("pageTitle").textContent = titles[bodyPage][1];
    }

    const theme = localStorage.getItem("karyawanku_theme") || "dark";
    document.documentElement.dataset.theme = theme;
    const themeBtn = document.getElementById("themeToggle");
    const renderThemeIcon = currentTheme => {
      if (!themeBtn) return;
      themeBtn.innerHTML = icon(currentTheme === "dark" ? "sun" : "moon");
      themeBtn.setAttribute("aria-label", currentTheme === "dark" ? "Gunakan mode terang" : "Gunakan mode gelap");
    };
    renderThemeIcon(theme);
    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
        document.documentElement.dataset.theme = next;
        renderThemeIcon(next);
        localStorage.setItem("karyawanku_theme", next);
        const darkModeSetting = document.getElementById("darkModeSetting");
        if (darkModeSetting) darkModeSetting.checked = next === "dark";
        const data = load();
        data.settings.darkMode = next === "dark";
        save(data);
      });
    }

    const dateLabel = document.getElementById("currentDateLabel");
    if (dateLabel) {
      dateLabel.textContent = new Intl.DateTimeFormat("id-ID", { day:"2-digit", month:"short", year:"numeric" }).format(new Date());
    }

    const globalSearch = document.getElementById("globalSearch");
    if (globalSearch) {
      const routes = {
        "dashboard":"dashboard.html", "karyawan":"employees.html", "pegawai":"employees.html",
        "penilaian":"performance.html", "performa":"performance.html", "evaluasi":"performance.html",
        "absensi":"attendance.html", "kehadiran":"attendance.html", "cuti":"leave.html",
        "izin":"leave.html", "payroll":"payroll.html", "gaji":"payroll.html",
        "departemen":"departments.html", "pengaturan":"settings.html"
      };
      globalSearch.addEventListener("keydown", event => {
        if (event.key !== "Enter") return;
        const query = globalSearch.value.trim();
        if (!query) return;
        const lowered = query.toLowerCase();
        const routeKey = Object.keys(routes).find(key => lowered.includes(key));
        window.location.href = routeKey ? routes[routeKey] : `employees.html?q=${encodeURIComponent(query)}`;
      });
      document.addEventListener("keydown", event => {
        const tag = document.activeElement?.tagName;
        if (event.key === "/" && !["INPUT","TEXTAREA","SELECT"].includes(tag)) {
          event.preventDefault();
          globalSearch.focus();
        }
      });
    }

    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");
    const toggle = () => { sidebar?.classList.toggle("open"); overlay?.classList.toggle("open"); };
    document.getElementById("menuToggle")?.addEventListener("click", toggle);
    overlay?.addEventListener("click", toggle);

    document.querySelectorAll(".modal").forEach(modal => {
      modal.addEventListener("click", event => { if (event.target === modal) { modal.classList.remove("open"); closeAllSelects(); } });
      modal.querySelectorAll("[data-close-modal]").forEach(btn => btn.addEventListener("click", () => { modal.classList.remove("open"); closeAllSelects(); }));
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        document.querySelectorAll(".modal.open").forEach(modal => modal.classList.remove("open"));
        closeAllSelects();
      }
    });

    renderBranchContext();
    initEmployeeSidebarNav();
    initHeaderDropdowns();
    initPageTransitions();
  }

  window.HRApp = {
    load, save, reset, uid, initials, money, date, escapeHTML, toast, openModal, closeModal,
    download, today, seedData, icon, hydrateIcons, refreshCustomSelects, departmentIconKey,
    normalizeData, getActiveBranchId, setActiveBranchId, getActiveBranch, scope, renderBranchContext
  };
  document.addEventListener("DOMContentLoaded", initCommon);
})();
