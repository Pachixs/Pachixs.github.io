/**
 * Calculadora de Plazos Procesales - GESTORIA MOCGU
 * Cómputo de días hábiles mejorado con soporte de inicio y cómputo al 3er día hábil
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- Datos de Jurisdicciones ---
  const JURISDICTIONS = [
    { value: "PJF", label: "PJF — Poder Judicial de la Federación (Juzgados de Distrito, Tribunales Colegiados)", short: "PJF" },
    { value: "TFJA", label: "TFJA — Tribunal Federal de Justicia Administrativa", short: "TFJA" },
    { value: "LABORALES", label: "Laborales — Tribunales Laborales del PJF", short: "Laborales" },
   /* { value: "JUZGADOS", label: "Notificaciones — Por Juzgados / Autoridad al 3er día hábil", short: "Notijuzgados" },
    { value: "LOCALES", label: "Locales — Tribunales del fuero común", short: "Locales" },
    { value: "SAT", label: "SAT — Servicio de Administración Tributaria", short: "SAT" },
    { value: "IMSS", label: "IMSS — Instituto Mexicano del Seguro Social", short: "IMSS" }*/
  ];

  // --- Catálogo de Plazos (Presets) con adición destacada de 30 días y cómputo al 3er día ---
  const PRESETS = [
    {
      id: "amparo-autoaplicativo-30",
      label: "Amparo contra normas autoaplicativas (Art. 17, frac. I LA)",
      days: 30,
      basis: "Artículo 17, fracción I de la Ley de Amparo. El plazo para presentar la demanda de amparo es de 30 días cuando se reclame una norma general autoaplicativa, o el procedimiento de extradición.",
      jurisdictions: ["PJF", "JUZGADOS"],
      highlight: true
    },
    {
      id: "termino-general-30",
      label: "Término procesal general / Cómputo ampliado",
      days: 30,
      basis: "Cómputo legal ordinario de 30 días hábiles para el desahogo de requerimientos de fondo, excepciones procesales, contestaciones ampliadas o impugnaciones según la legislación aplicable.",
      jurisdictions: ["PJF", "TFJA", "LABORALES"], /*"JUZGADOS", "LOCALES", "SAT", "IMSS"*/
      highlight: true
    },
	//Nuevo
    {
      id: "notificacion-juzgados-15",
      label: "Notificación por Juzgados / Autoridad al 3er día hábil (Art. 31 LA)",
      days: 15,
      basis: "Cómputo con inicio y cómputo al 3er día hábil: Las notificaciones realizadas por lista de juzgado, actuario o boletín surten plenos efectos para iniciar su cómputo formal al tercer día hábil siguiente.",
      jurisdictions: ["JUZGADOS", "PJF", "TFJA"],
      startRule: 3,
      highlight: true
    },
    {
      id: "amparo-indirecto-15",
      label: "Amparo indirecto (Art. 17 LA)",
      days: 15,
      basis: "Artículo 17 de la Ley de Amparo. El plazo genérico para presentar la demanda de amparo es de 15 días contados desde el día siguiente al en que surta efectos la notificación al quejoso del acto reclamado.",
      jurisdictions: ["PJF"]
    },
    {
      id: "amparo-directo-15",
      label: "Amparo directo (Art. 176 LA)",
      days: 15,
      basis: "Artículo 176 de la Ley de Amparo. La demanda de amparo directo deberá presentarse ante la autoridad responsable dentro del plazo de 15 días contados a partir del día siguiente al en que surta efectos la notificación de la resolución recurrida.",
      jurisdictions: ["PJF"]
    },
    {
      id: "recurso-revision-10",
      label: "Recurso de revisión (Art. 86 LA)",
      days: 10,
      basis: "Artículo 86 de la Ley de Amparo. El recurso de revisión se interpondrá en el plazo de 10 días ante el órgano jurisdiccional que haya dictado la resolución recurrida.",
      jurisdictions: ["PJF"]
    },
    {
      id: "juicio-contencioso-30",
      label: "Juicio contencioso administrativo (Art. 13 LFPCA)",
      days: 30,
      basis: "Artículo 13 de la Ley Federal de Procedimiento Contencioso Administrativo. La demanda se presentará por escrito ante la Sala Regional competente dentro de los 30 días siguientes a aquél en que haya surtido efectos la notificación de la resolución impugnada.",
      jurisdictions: ["TFJA"]
    },
    {
      id: "recurso-queja",
      label: "Recurso de queja (15 días)",
      days: 15,
      basis: "Artículo 58 de la Ley Federal de Procedimiento Contencioso Administrativo / CFF. El recurso de queja por incumplimiento o repetición del acto se interpondrá dentro de los 15 días siguientes a que surta efectos la notificación.",
      jurisdictions: ["TFJA", "SAT"]
    },
    {
      id: "termino-4 meses-cumplimiento",
      label: "Término de 4 meses para cumplimiento (notificación por Boletín Jurisdiccional)",
      days: 120,
      basis: "Término legal de cumplimiento procesal: cómputo de 120 días hábiles (4 meses) a partir de que surte plenos efectos la notificación por Boletín Jurisdiccional al tercer día hábil.",
      jurisdictions: ["TFJA", "SAT", "JUZGADOS"],
      startRule: 3
    },
    {
      id: "contestacion-laboral-15",
      label: "Contestación de demanda laboral (Art. 873 LFT)",
      days: 15,
      basis: "Artículo 873 de la Ley Federal del Trabajo. El demandado deberá contestar la demanda dentro de un plazo de 15 días contados a partir de la notificación.",
      jurisdictions: ["LABORALES"]
    },
    {
      id: "inconformidad-imss-15",
      label: "Recurso de inconformidad IMSS (Art. 294 LSS)",
      days: 15,
      basis: "Artículo 294 de la Ley del Seguro Social. Las controversias entre los asegurados, beneficiarios y el Instituto se resolverán interponiendo el recurso de inconformidad dentro de los 15 días hábiles siguientes.",
      jurisdictions: ["IMSS"]
    }
  ];

  // Nombres de meses y días
  const MONTH_NAMES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const DAY_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  // --- Elementos del DOM ---
  const tribunalSelect = document.getElementById('tribunalSelect');
  const notificationInput = document.getElementById('notificationDate');
  const presetsContainer = document.getElementById('presetsContainer');
  const customNumberInput = document.getElementById('customNumberInput');

  // Regla de inicio del cómputo
  const startRuleRadio1 = document.querySelector('input[name="startRuleRadio"][value="1"]');
  const startRuleRadio3 = document.querySelector('input[name="startRuleRadio"][value="2"]');
  const startRuleLabel1 = document.getElementById('startRuleLabel1');
  const startRuleLabel3 = document.getElementById('startRuleLabel3');

  // Píldoras rápidas
  const quickPill30 = document.getElementById('quickPill30');
  const quickPill15 = document.getElementById('quickPill15');
  const quickPill10 = document.getElementById('quickPill10');
  const quickPill45 = document.getElementById('quickPill45');
  const quickPill120 = document.getElementById('quickPill120');

  // Aviso legal y jurisdicción
  const noticeJurisdictionName = document.getElementById('noticeJurisdictionName');
  const noticeRecessItem = document.getElementById('noticeRecessItem');
  const noticeRuleItem = document.getElementById('noticeRuleItem');
  const btnLegalToggle = document.getElementById('btnLegalToggle');
  const legalContent = document.getElementById('legalContent');
  const legalBasisText = document.getElementById('legalBasisText');
  const legalToggleIcon = document.getElementById('legalToggleIcon');
  const legalToggleWord = document.getElementById('legalToggleWord');
  const legalBox = document.getElementById('legalBox');
  const btnCalculate = document.getElementById('btnCalculate');
  const btnSample = document.getElementById('btnSample');
  const btnClear = document.getElementById('btnClear');
  const resultsSection = document.getElementById('resultsSection');

  // Stats
  const statStartDate = document.getElementById('statStartDate');
  const statStartSubtitle = document.getElementById('statStartSubtitle');//nuevo
  const statEndDate = document.getElementById('statEndDate');
  const statEndDayName = document.getElementById('statEndDayName');
  const statCalendarDays = document.getElementById('statCalendarDays');
  const statBusinessDays = document.getElementById('statBusinessDays');
  const statDaysRemaining = document.getElementById('statDaysRemaining');
  const statStatusBadge = document.getElementById('statStatusBadge');
  const statCardRemaining = document.getElementById('statCardRemaining');

  // Progress
  const progressPercentText = document.getElementById('progressPercentText');
  const progressBarFill = document.getElementById('progressBarFill');
  const progressStartDateLabel = document.getElementById('progressStartDateLabel');
  const progressEndDateLabel = document.getElementById('progressEndDateLabel');

  // Calendar
  const calendarSubtitle = document.getElementById('calendarSubtitle');
  const monthsContainer = document.getElementById('monthsContainer');
  const holidaysSummaryBox = document.getElementById('holidaysSummaryBox');
  const holidaysCountSpan = document.getElementById('holidaysCountSpan');
  const holidaysListUl = document.getElementById('holidaysListUl');

  // --- Estado de la Calculadora ---
  let selectedJurisdiction = "PJF";
  let selectedPresetIndex = 0; // Por defecto el primero de la lista (Amparo 30 días)
  let customDaysValue = "";
  let isCustomSelected = false;
  let isLegalBasisOpen = false;
  let currentStartRule = 1; // 1 = Día hábil siguiente; 3 = Al tercer día hábil

  // --- Cálculo dinámico de Días Inhábiles y Feriados ---
  function getEasterSunday(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31); // 3=Marzo, 4=Abril
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
  }

  function getNthWeekdayOfMonth(year, monthIndex, targetWeekday, n) {
    let count = 0;
    for (let day = 1; day <= 31; day++) {
      const dt = new Date(year, monthIndex, day);
      if (dt.getMonth() !== monthIndex) break;
      if (dt.getDay() === targetWeekday) {
        count++;
        if (count === n) return dt;
      }
    }
    return null;
  }

  function formatDateIso(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function formatDateHuman(date) {
    return `${date.getDate()} de ${MONTH_NAMES[date.getMonth()]} de ${date.getFullYear()}`;
  }

  function getHolidaysMap(jurisdiction, startYear, endYear) {
    const holidayMap = new Map();

    for (let y = startYear; y <= endYear; y++) {
      // 1 de Enero
      holidayMap.set(`${y}-01-01`, "Año Nuevo");

      // Primer lunes de febrero (Día de la Constitución)
      const constitucion = getNthWeekdayOfMonth(y, 1, 1, 1);
      if (constitucion) {
        holidayMap.set(formatDateIso(constitucion), "Día de la Constitución");
      }

      // Tercer lunes de marzo (Natalicio de Benito Juárez)
      const juarez = getNthWeekdayOfMonth(y, 2, 1, 3);
      if (juarez) {
        holidayMap.set(formatDateIso(juarez), "Natalicio de Benito Juárez");
      }

      // Semana Santa (Jueves y Viernes Santo)
      const easter = getEasterSunday(y);
      const juevesSanto = new Date(easter);
      juevesSanto.setDate(easter.getDate() - 3);
      const viernesSanto = new Date(easter);
      viernesSanto.setDate(easter.getDate() - 2);
      holidayMap.set(formatDateIso(juevesSanto), "Jueves Santo (Semana Santa)");
      holidayMap.set(formatDateIso(viernesSanto), "Viernes Santo (Semana Santa)");

      // 1 de Mayo
      holidayMap.set(`${y}-05-01`, "Día del Trabajo");

      // 5 de Mayo (Batalla de Puebla - inhábil en tribunales federales)
      if (["PJF", "TFJA", "LABORALES", "JUZGADOS"].includes(jurisdiction)) {
        holidayMap.set(`${y}-05-05`, "Batalla de Puebla");
      }

      // 28 de Agosto para el TFJA
      if (["TFJA"].includes(jurisdiction)) {
        holidayMap.set(`${y}-08-28`, "Día del empleado TFJA");
      }

      // 14 y 15 de Septiembre
      if (["PJF", "TFJA", "LABORALES", "JUZGADOS"].includes(jurisdiction)) {
        holidayMap.set(`${y}-09-14`, "Día inhábil judicial (14 de Septiembre)");
        holidayMap.set(`${y}-09-15`, "Día inhábil judicial (15 de Septiembre)");
      }

      // 16 de Septiembre para todos
      if (["PJF", "TFJA", "LABORALES", "JUZGADOS"].includes(jurisdiction)) {
      holidayMap.set(`${y}-09-16`, "Día de la Independencia");
      }

      // 12 de Octubre para el TFJA
      if (["TFJA", "PJF"].includes(jurisdiction)) {
        holidayMap.set(`${y}-10-12`, "Día de la Raza");
      }

      // 2 de Noviembre (Día de Muertos - tribunales)
      if (["PJF", "TFJA", "LABORALES", "JUZGADOS"].includes(jurisdiction)) {
        holidayMap.set(`${y}-11-02`, "Día de Muertos");
      }

      // Tercer lunes de noviembre (Día de la Revolución)
      const revolucion = getNthWeekdayOfMonth(y, 10, 1, 3);
      if (revolucion) {
        holidayMap.set(formatDateIso(revolucion), "Día de la Revolución Mexicana");
      }

      // 25 de Diciembre
      holidayMap.set(`${y}-12-25`, "Navidad");

      // Periodos de receso judicial para TFJA
      if (["TFJA"].includes(jurisdiction)) {
        // Receso de Verano: 13 al 31 de Julio
        for (let d = 13; d <= 31; d++) {
          const dt = new Date(y, 6, d);
          const iso = formatDateIso(dt);
          if (!holidayMap.has(iso)) {
            holidayMap.set(iso, "Receso TFJA (Verano)");
          }
        }

        // Receso de Invierno: 14 al 31 de Diciembre
        for (let d = 14; d <= 31; d++) {
          const dt = new Date(y, 11, d);
          const iso = formatDateIso(dt);
          if (!holidayMap.has(iso)) {
            holidayMap.set(iso, "Receso TFJA (Invierno)");
          }
        }
      }

      // Periodos de receso judicial para PJF, Laborales y Juzgados
      if (["PJF", "LABORALES", "JUZGADOS"].includes(jurisdiction)) {
        // Receso de Verano: 15 al 31 de Julio
        for (let d = 15; d <= 31; d++) {
          const dt = new Date(y, 6, d);
          const iso = formatDateIso(dt);
          if (!holidayMap.has(iso)) {
            holidayMap.set(iso, "Receso Judicial PJF / Juzgados (Verano)");
          }
        }

        // Receso de Invierno: 16 al 31 de Diciembre
        for (let d = 16; d <= 31; d++) {
          const dt = new Date(y, 11, d);
          const iso = formatDateIso(dt);
          if (!holidayMap.has(iso)) {
            holidayMap.set(iso, "Receso Judicial PJF / Juzgados (Invierno)");
          }
        }
      }
    }

    return holidayMap;
  }

  function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  function isHabilDay(date, holidaysMap) {
    if (isWeekend(date)) return false;
    const iso = formatDateIso(date);
    return !holidaysMap.has(iso);
  }

  // --- Manejo de la Regla de Inicio del Cómputo (1er día vs 3er día) ---
  function setStartRule(rule, triggerRecompute = true) {
    currentStartRule = parseInt(rule, 10) === 2 ? 2 : 1;

    if (startRuleRadio1 && startRuleRadio3) {
      startRuleRadio1.checked = (currentStartRule === 1);
      startRuleRadio3.checked = (currentStartRule === 2);
    }
    if (startRuleLabel1 && startRuleLabel3) {
      if (currentStartRule === 1) {
        startRuleLabel1.classList.add('selected');
        startRuleLabel3.classList.remove('selected');
      } else {
        startRuleLabel3.classList.add('selected');
        startRuleLabel1.classList.remove('selected');
      }
    }

    updateNoticeBox();

    // Si ya hay un cálculo realizado y visible, recalcular al cambiar la regla
    if (triggerRecompute && !resultsSection.classList.contains('hidden') && notificationInput.value && getDaysToCompute() > 0) {
      const data = computeDeadline(notificationInput.value, getDaysToCompute(), selectedJurisdiction, currentStartRule);
      displayResults(data);
    }
  }

  if (startRuleRadio1) {
    startRuleRadio1.addEventListener('change', () => setStartRule(1));
  }
  if (startRuleRadio3) {
    startRuleRadio3.addEventListener('change', () => setStartRule(2));
  }
  if (startRuleLabel1) {
    startRuleLabel1.addEventListener('click', () => setStartRule(1));
  }
  if (startRuleLabel3) {
    startRuleLabel3.addEventListener('click', () => setStartRule(2));
  }

  // --- Renderizado y Lógica de Presets según Jurisdicción ------------------------------------------
  function getFilteredPresets() {
    return PRESETS.filter(p => p.jurisdictions.includes(selectedJurisdiction));
  }

  function renderPresets() {
    const available = getFilteredPresets();
    presetsContainer.innerHTML = '';

    available.forEach((preset, index) => {
      const isSelected = !isCustomSelected && selectedPresetIndex === index;
      const card = document.createElement('label');
      card.className = `preset-card ${isSelected ? 'selected' : ''} ${preset.highlight ? 'featured' : ''}`;
      //nuevo
      const ruleBadge = preset.startRule === 3 
        ? `<span style="font-size:0.68rem; font-weight:700; color:var(--primary-700); background:var(--primary-50); border:1px solid var(--primary-200); padding:0.1rem 0.4rem; border-radius:4px; margin-left:0.35rem;">Al 3er día</span>` 
        : '';

      card.innerHTML = `
        <input type="radio" name="presetRadio" class="preset-radio" ${isSelected ? 'checked' : ''}>
        <div class="preset-info">
          <span class="preset-title">${preset.label} ${ruleBadge}</span>
          <span class="preset-badge ${preset.highlight ? 'badge-highlight' : ''}">${preset.days} días</span>
        </div>
      `;

      card.addEventListener('click', () => {
        isCustomSelected = false;
        selectedPresetIndex = index;
        customNumberInput.value = "";
        customDaysValue = "";
        clearPillSelection();

        // Si el preset define regla de inicio (ej. al 3er día), activarla
        if (preset.startRule) {
          setStartRule(preset.startRule, false);
        } else if (selectedJurisdiction === "JUZGADOS") {
          setStartRule(2, false);
        }

        renderPresets();
        updateLegalBasis();
        checkCalculateButtonState();
      });

      presetsContainer.appendChild(card);
    });

    // Opción Personalizada
    const customCard = document.createElement('label');
    const isCustomActive = isCustomSelected || customDaysValue !== "";
    customCard.className = `preset-card ${isCustomActive ? 'selected' : ''}`;
    customCard.innerHTML = `
      <input type="radio" name="presetRadio" class="preset-radio" ${isCustomActive ? 'checked' : ''}>
      <div class="preset-info">
        <div class="custom-input-row">
          <span class="preset-title">Personalizado:</span>
          <span style="font-size:0.75rem; color:var(--secondary-500);">(o usa las píldoras rápidas abajo)</span>
        </div>
      </div>
    `;

    customCard.addEventListener('click', () => {
      isCustomSelected = true;
      selectedPresetIndex = -1;
      renderPresets();
      updateLegalBasis();
      customNumberInput.focus();
      checkCalculateButtonState();
    });

    presetsContainer.appendChild(customCard);
  }

  function updateNoticeBox() {
    const jObj = JURISDICTIONS.find(j => j.value === selectedJurisdiction);
    noticeJurisdictionName.textContent = jObj ? jObj.short : selectedJurisdiction;

    if (["PJF", "LABORALES", "JUZGADOS"].includes(selectedJurisdiction)) {
      noticeRecessItem.textContent = "Recesos PJF / Juzgados: 15-31 de julio y 16-31 de diciembre";
      noticeRecessItem.style.display = "list-item";
    } else if (selectedJurisdiction === "TFJA") {
      noticeRecessItem.textContent = "Recesos TFJA: 13-31 de julio y 14-31 de diciembre";
      noticeRecessItem.style.display = "list-item";
    } else {
      noticeRecessItem.style.display = "none";
    }

    if (noticeRuleItem) {
      if (currentStartRule === 3) {
        noticeRuleItem.textContent = "Regla activa: El plazo y cómputo inician al 3er día hábil posterior a la notificación";
        noticeRuleItem.style.color = "var(--primary-700)";
      } else {
        noticeRuleItem.textContent = "Regla activa: El plazo inicia al día hábil siguiente (1er día hábil)";
        noticeRuleItem.style.color = "var(--secondary-600)";
      }
    }
  }
//********************************************************
  function updateLegalBasis() {
    if (isCustomSelected) {
      legalBox.style.display = 'none';
      legalContent.classList.add('hidden');
      isLegalBasisOpen = false;
      return;
    }

    const available = getFilteredPresets();
    const current = available[selectedPresetIndex];
    if (current && current.basis) {
      legalBox.style.display = 'block';
      legalBasisText.textContent = current.basis;
    } else {
      legalBox.style.display = 'none';
    }
  }

  function clearPillSelection() {
    document.querySelectorAll('.quick-pill').forEach(pill => pill.classList.remove('active'));
  }

  function selectDaysAmount(days) {
    isCustomSelected = true;
    selectedPresetIndex = -1;
    customDaysValue = String(days);
    customNumberInput.value = days;
    renderPresets();
    updateLegalBasis();
    checkCalculateButtonState();
  }

  // --- Handlers de Píldoras Rápidas (30, 15, 10, 45 y 120 días) ---Nuevo
  if (quickPill30) {
    quickPill30.addEventListener('click', () => {
      clearPillSelection();
      quickPill30.classList.add('active');
      selectDaysAmount(30);
    });
  }

  if (quickPill15) {
    quickPill15.addEventListener('click', () => {
      clearPillSelection();
      quickPill15.classList.add('active');
      selectDaysAmount(15);
    });
  }

  if (quickPill10) {
    quickPill10.addEventListener('click', () => {
      clearPillSelection();
      quickPill10.classList.add('active');
      selectDaysAmount(10);
    });
  }

  if (quickPill45) {
    quickPill45.addEventListener('click', () => {
      clearPillSelection();
      quickPill45.classList.add('active');
      selectDaysAmount(45);
    });
  }

  if (quickPill120) {
    quickPill120.addEventListener('click', () => {
      clearPillSelection();
      quickPill120.classList.add('active');
      selectDaysAmount(120);
    });
  }

  customNumberInput.addEventListener('input', (e) => {
    customDaysValue = e.target.value;
    isCustomSelected = true;
    selectedPresetIndex = -1;
    clearPillSelection();

    if (customDaysValue === "30" && quickPill30) quickPill30.classList.add('active');
    else if (customDaysValue === "15" && quickPill15) quickPill15.classList.add('active');
    else if (customDaysValue === "10" && quickPill10) quickPill10.classList.add('active');
    else if (customDaysValue === "45" && quickPill45) quickPill45.classList.add('active');
    else if (customDaysValue === "120" && quickPill120) quickPill120.classList.add('active');

    renderPresets();
    updateLegalBasis();
    checkCalculateButtonState();
  });
  //******************************************

  tribunalSelect.addEventListener('change', (e) => {
    selectedJurisdiction = e.target.value;
    selectedPresetIndex = 0;
    isCustomSelected = false;
    customDaysValue = "";
    customNumberInput.value = "";
    clearPillSelection();

    // Si se selecciona Juzgados al 3er día, activar automáticamente regla al 3er día
    if (selectedJurisdiction === "JUZGADOS") {
      setStartRule(2, false);
    } else {
      setStartRule(1, false);
    }

    updateNoticeBox();
    renderPresets();
    updateLegalBasis();
    checkCalculateButtonState();
  });

  notificationInput.addEventListener('change', () => {
    checkCalculateButtonState();
  });

  btnLegalToggle.addEventListener('click', () => {
    isLegalBasisOpen = !isLegalBasisOpen;
    if (isLegalBasisOpen) {
      legalContent.classList.remove('hidden');
      legalToggleWord.textContent = 'Ocultar';
      legalToggleIcon.style.transform = 'rotate(180deg)';
    } else {
      legalContent.classList.add('hidden');
      legalToggleWord.textContent = 'Ver';
      legalToggleIcon.style.transform = 'rotate(0deg)';
    }
  });

  function getDaysToCompute() {
    if (isCustomSelected) {
      return parseInt(customDaysValue, 10) || 0;
    }
    const available = getFilteredPresets();
    return available[selectedPresetIndex] ? available[selectedPresetIndex].days : 0;
  }

  function checkCalculateButtonState() {
    const dateVal = notificationInput.value;
    const days = getDaysToCompute();
    btnCalculate.disabled = (!dateVal || days <= 0);
  }

  // --- Algoritmo Principal de Cómputo del Plazo Procesal ---
  function computeDeadline(notificationDateStr, totalBusinessDays, jurisdiction, startDayOffset = 1) {
    const parts = notificationDateStr.split('-');
    const notifDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));

    const startYear = notifDate.getFullYear();
    const endYear = startYear + 2;
    const holidaysMap = getHolidaysMap(jurisdiction, startYear, endYear);

    // Calcular la fecha de inicio del plazo según la regla (1er día hábil o 3er día hábil)
    const targetOffset = parseInt(startDayOffset, 10) === 2 ? 2 : 1;
    let current = new Date(notifDate);
    let businessDaysFound = 0;
    const intermediateBusinessDays = []; // Días hábiles previos al cómputo (1° y 2°)

    while (businessDaysFound < targetOffset) {
      current.setDate(current.getDate() + 1);
      if (isHabilDay(current, holidaysMap)) {
        businessDaysFound++;
        if (businessDaysFound < targetOffset) {
          intermediateBusinessDays.push(formatDateIso(current));
        }
      }
    }

    // El plazo inicia formalmente en el día hábil fijado por la regla (3er día hábil o 1er día hábil)
    const startDate = new Date(current); // Día hábil #1 a computar
    let counted = 1;
    let runner = new Date(startDate);
    let endDate = new Date(runner);

    // Iterar hasta acumular el total de N días hábiles requeridos
    while (counted < totalBusinessDays) {
      runner.setDate(runner.getDate() + 1);
      if (isHabilDay(runner, holidaysMap)) {
        counted++;
        endDate = new Date(runner);
      }
    }

    // Generar la matriz de días para el calendario
    // Desde el día 1 del mes de notificación hasta el último día del mes de vencimiento
    const firstCalDate = new Date(notifDate.getFullYear(), notifDate.getMonth(), 1);
    const lastCalDate = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0);

    const dayDetails = [];
    let calIter = new Date(firstCalDate);
    let businessDayCounter = 0;
    const notifIso = formatDateIso(notifDate);
    const startIso = formatDateIso(startDate);
    const endIso = formatDateIso(endDate);

    while (calIter <= lastCalDate) {
      const d = new Date(calIter);
      const iso = formatDateIso(d);
      const isWk = isWeekend(d);
      const holidayName = holidaysMap.get(iso) || null;
      const isHol = !!holidayName;
      const isHab = !isWk && !isHol;
      const inRange = iso >= startIso && iso <= endIso;
      const isNotif = (iso === notifIso);
      const isInter = intermediateBusinessDays.includes(iso);

      let bIndex = null;
      if (inRange && isHab) {
        businessDayCounter++;
        bIndex = businessDayCounter;
      }

      dayDetails.push({
        date: d,
        iso: iso,
        isWeekend: isWk,
        isHoliday: isHol,
        holidayName: holidayName,
        isHabil: isHab,
        isInRange: inRange,
        isNotification: isNotif,
        isIntermediate: isInter,
        intermediateIndex: isInter ? (intermediateBusinessDays.indexOf(iso) + 1) : null,
        businessDayNumber: bIndex,
        isStart: iso === startIso,
        isEnd: iso === endIso
      });

      calIter.setDate(calIter.getDate() + 1);
    }

    // Estadísticas del plazo *********************************************
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const calendarDays = Math.round((endDate.getTime() - startDate.getTime()) / 86400000);
    const daysFromToday = Math.round((endDate.getTime() - today.getTime()) / 86400000);

    return {
      notificationDate: notifDate,
      startDate: startDate,
      endDate: endDate,
      calendarDays: calendarDays,
      daysFromToday: daysFromToday,
      businessDaysCounted: totalBusinessDays,
      dayDetails: dayDetails,
      jurisdiction: jurisdiction,
      startDayOffset: targetOffset,
      intermediateBusinessDays: intermediateBusinessDays
    };
  }

  // --- Renderizado de Resultados y Calendario Multimes ---
  function displayResults(data) {
    resultsSection.classList.remove('hidden');

    // 1. Tarjetas de Estadísticas
    statStartDate.textContent = formatDateHuman(data.startDate);
    if (statStartSubtitle) {
      if (data.startDayOffset === 3) {
        statStartSubtitle.textContent = "(Tercer día hábil después de notificación — Inicio y cómputo)";
      } else {
        statStartSubtitle.textContent = "(Primer día hábil después de notificación)";
      }
    }

    statEndDate.textContent = formatDateHuman(data.endDate);
    statEndDayName.textContent = DAY_NAMES[data.endDate.getDay()];
    statCalendarDays.textContent = `${data.calendarDays} días`;
    statBusinessDays.textContent = `${data.businessDaysCounted} días hábiles`;

    // Estado respecto a Hoy
    statCardRemaining.classList.remove('stat-status-good', 'stat-status-warn', 'stat-status-bad');
    if (data.daysFromToday > 5) {
      statCardRemaining.classList.add('stat-status-good');
      statDaysRemaining.textContent = `${data.daysFromToday} días restantes`;
      statDaysRemaining.className = "stat-value text-success";
      statStatusBadge.innerHTML = `<span style="color:var(--success-600); font-weight:600;">✓ Dentro del plazo</span>`;
    } else if (data.daysFromToday > 0) {
      statCardRemaining.classList.add('stat-status-warn');
      statDaysRemaining.textContent = `${data.daysFromToday} días restantes`;
      statDaysRemaining.className = "stat-value text-amber";
      statStatusBadge.innerHTML = `<span style="color:var(--amber-600); font-weight:600;">⚠️ Próximo a vencer</span>`;
    } else if (data.daysFromToday === 0) {
      statCardRemaining.classList.add('stat-status-bad');
      statDaysRemaining.textContent = `Vence HOY`;
      statDaysRemaining.className = "stat-value text-danger";
      statStatusBadge.innerHTML = `<span style="color:var(--danger-600); font-weight:700;">⚠️ Último día para presentar</span>`;
    } else {
      statCardRemaining.classList.add('stat-status-bad');
      statDaysRemaining.textContent = `Vencido hace ${Math.abs(data.daysFromToday)} días`;
      statDaysRemaining.className = "stat-value text-danger";
      statStatusBadge.innerHTML = `<span style="color:var(--danger-600); font-weight:700;">✕ Plazo concluido</span>`;
    }

    // 2. Barra de Progreso
    const totalDays = Math.max(data.calendarDays, 1);
    const elapsedDays = Math.max(0, Math.min(totalDays, totalDays - data.daysFromToday));
    let percent = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));

    progressStartDateLabel.textContent = `Inicio: ${formatDateHuman(data.startDate)}`;
    progressEndDateLabel.textContent = `Vence: ${formatDateHuman(data.endDate)}`;

    progressBarFill.className = "progress-bar-fill";
    if (data.daysFromToday < 0) {
      progressBarFill.classList.add('fill-red');
      progressBarFill.style.width = '100%';
      progressPercentText.textContent = `Plazo VENCIDO hace ${Math.abs(data.daysFromToday)} días naturales`;
      progressPercentText.className = "progress-status text-danger";
    } else if (data.daysFromToday === 0) {
      progressBarFill.classList.add('fill-red');
      progressBarFill.style.width = '100%';
      progressPercentText.textContent = `¡El plazo vence HOY!`;
      progressPercentText.className = "progress-status text-danger";
    } else if (percent >= 80) {
      progressBarFill.classList.add('fill-red');
      progressBarFill.style.width = `${percent}%`;
      progressPercentText.textContent = `${percent.toFixed(0)}% del plazo transcurrido — quedan ${data.daysFromToday} días`;
      progressPercentText.className = "progress-status text-danger";
    } else if (percent >= 50) {
      progressBarFill.classList.add('fill-amber');
      progressBarFill.style.width = `${percent}%`;
      progressPercentText.textContent = `${percent.toFixed(0)}% del plazo transcurrido — quedan ${data.daysFromToday} días`;
      progressPercentText.className = "progress-status text-amber";
    } else {
      progressBarFill.classList.add('fill-green');
      progressBarFill.style.width = `${percent}%`;
      progressPercentText.textContent = `${percent.toFixed(0)}% del plazo transcurrido — quedan ${data.daysFromToday} días`;
      progressPercentText.className = "progress-status text-success";
    }

    // 3. Subtítulo del Calendario
   const jObj = JURISDICTIONS.find(j => j.value === data.jurisdiction);
   //Nuevo
    const jName = jObj ? jObj.short : data.jurisdiction;
    const ruleDesc = data.startDayOffset === 3 
      ? "inicio y cómputo al 3er día hábil" 
      : "inicio al día hábil siguiente"
    calendarSubtitle.textContent = `${jName} — ${data.businessDaysCounted} días hábiles (${ruleDesc}) desde la notificación del ${formatDateHuman(data.notificationDate)}`;

    // 4. Renderizar Meses del Calendario
    renderCalendarMonths(data);

    // 5. Lista de Días Inhábiles Oficiales dentro del Rango
    renderHolidaysSummary(data);

    // Scroll suave hacia los resultados
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderCalendarMonths(data) {
    monthsContainer.innerHTML = '';

    // Agrupar días por año y mes
    const monthGroups = [];
    data.dayDetails.forEach(item => {
      const y = item.date.getFullYear();
      const m = item.date.getMonth();
      let lastGroup = monthGroups[monthGroups.length - 1];
      if (!lastGroup || lastGroup.year !== y || lastGroup.month !== m) {
        lastGroup = { year: y, month: m, days: [] };
        monthGroups.push(lastGroup);
      }
      lastGroup.days.push(item);
    });

    const todayIso = formatDateIso(new Date());

    monthGroups.forEach(group => {
      const monthBox = document.createElement('div');
      monthBox.className = 'month-box';

      // Encabezado del mes
      const heading = document.createElement('h3');
      heading.className = 'month-heading';
      heading.textContent = `${MONTH_NAMES[group.month]} ${group.year}`;
      monthBox.appendChild(heading);

      // Cabecera días de la semana
      const weekdaysGrid = document.createElement('div');
      weekdaysGrid.className = 'weekdays-header';
      DAY_SHORT.forEach(dShort => {
        const cell = document.createElement('div');
        cell.className = 'weekday-cell';
        cell.textContent = dShort;
        weekdaysGrid.appendChild(cell);
      });
      monthBox.appendChild(weekdaysGrid);

      // Cuadrícula de días
      const daysGrid = document.createElement('div');
      daysGrid.className = 'days-grid';

      // Relleno de días vacíos antes del 1º de mes
      const firstDayOfWeek = new Date(group.year, group.month, 1).getDay();
      for (let i = 0; i < firstDayOfWeek; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'day-cell empty';
        daysGrid.appendChild(emptyCell);
      }

      // Días del mes
      group.days.forEach(dayItem => {
        const cell = document.createElement('div');
        cell.className = 'day-cell';

        let tooltipText = "";

        if (dayItem.isStart) {
          cell.classList.add('day-start');
          tooltipText = data.startDayOffset === 3 
            ? `Inicio del plazo (3er día hábil — Día hábil #1)` 
            : `Inicio del plazo (Día hábil #1)`;
        } else if (dayItem.isEnd) {
          cell.classList.add('day-end');
          tooltipText = `VENCIMIENTO DEL PLAZO (Día hábil #${dayItem.businessDayNumber})`;
        } else if (dayItem.isNotification) {
          cell.classList.add('day-notification');
          tooltipText = `Fecha de notificación legal / conocimiento`;
        } else if (dayItem.isIntermediate) {
          cell.classList.add('day-intermediate');
          tooltipText = `${dayItem.intermediateIndex}° día hábil posterior (previo al inicio del cómputo)`;
        } else if (dayItem.isInRange && dayItem.isHabil) {
          cell.classList.add('day-habil-in-range');
          tooltipText = `Día hábil #${dayItem.businessDayNumber}`;
        } else if (dayItem.isInRange && dayItem.isHoliday) {
          cell.classList.add('day-holiday-in-range');
          tooltipText = dayItem.holidayName || "Inhábil oficial";
        } else if (dayItem.isInRange && dayItem.isWeekend) {
          cell.classList.add('day-weekend-in-range');
          tooltipText = "Fin de semana (Inhábil)";
        } else if (dayItem.isHoliday) {
          cell.classList.add('day-holiday-outside');
          tooltipText = dayItem.holidayName || "Inhábil oficial";
        } else {
          cell.classList.add('day-outside');
          if (dayItem.isWeekend) cell.classList.add('is-weekend');
          tooltipText = dayItem.isWeekend ? "Fin de semana" : `${dayItem.date.getDate()} de ${MONTH_NAMES[group.month]}`;
        }

        if (dayItem.iso === todayIso && !dayItem.isStart && !dayItem.isEnd) {
          cell.classList.add('is-today');
          tooltipText += " (Hoy)";
        }

        // Contenido del día
        let html = `<span class="day-number">${dayItem.date.getDate()}</span>`;
        if (dayItem.businessDayNumber && !dayItem.isStart && !dayItem.isEnd) {
          html += `<span class="day-business-idx">#${dayItem.businessDayNumber}</span>`;
        }
        if (dayItem.isNotification && !dayItem.isStart) {
          html += `<span class="day-business-idx badge-notif">Notif</span>`;
        } else if (dayItem.isIntermediate) {
          html += `<span class="day-business-idx badge-prev">Prev #${dayItem.intermediateIndex}</span>`;
        }
        if (dayItem.isStart) {
          html += `<span class="day-business-idx">Inicio</span>`;
        }
        if (dayItem.isEnd) {
          html += `<span class="day-business-idx">Vence</span>`;
        }

        // Tooltip hover
        html += `<div class="tooltip-box">${tooltipText}</div>`;
        cell.innerHTML = html;

        daysGrid.appendChild(cell);
      });

      monthBox.appendChild(daysGrid);
      monthsContainer.appendChild(monthBox);
    });
  }

  function renderHolidaysSummary(data) {
    const holidaysInRange = data.dayDetails.filter(d => d.isInRange && d.isHoliday && !d.isWeekend);

    if (holidaysInRange.length === 0) {
      holidaysSummaryBox.classList.add('hidden');
      return;
    }

    holidaysSummaryBox.classList.remove('hidden');
    holidaysCountSpan.textContent = holidaysInRange.length;
    holidaysListUl.innerHTML = '';

    holidaysInRange.forEach(h => {
      const li = document.createElement('li');
      li.className = 'holiday-item';
      li.innerHTML = `
        <span class="holiday-date">${formatDateHuman(h.date)}</span>
        <span class="holiday-day-name">(${DAY_SHORT[h.date.getDay()]})</span>
        <span>— ${h.holidayName}</span>
      `;
      holidaysListUl.appendChild(li);
    });
  }
//...................................................................................................
  // --- Botones de Acción ---
  btnCalculate.addEventListener('click', () => {
    const notifVal = notificationInput.value;
    const days = getDaysToCompute();
    if (!notifVal || days <= 0) return;

    const data = computeDeadline(notifVal, days, selectedJurisdiction, currentStartRule);
    displayResults(data);
  });

  // Botón Ver con datos de ejemplo (Configurado expresamente con 30 días hábiles mejorados)
  btnSample.addEventListener('click', () => {
    selectedJurisdiction = "PJF";
    tribunalSelect.value = "PJF";
    setStartRule(1, false);
    updateNoticeBox();

    notificationInput.value = "2026-08-03";

    // Seleccionar preset de 30 días: Amparo contra normas autoaplicativas
    isCustomSelected = false;
    const available = getFilteredPresets();
    const idx30 = available.findIndex(p => p.days === 30);
    selectedPresetIndex = idx30 !== -1 ? idx30 : 0;
    customDaysValue = "";
    customNumberInput.value = "";
    clearPillSelection();

    renderPresets();
    updateLegalBasis();
    checkCalculateButtonState();

    const data = computeDeadline("2026-08-03", 30, "PJF", currentStartRule);
    displayResults(data);
  });

  // Botón Limpiar
  btnClear.addEventListener('click', () => {
    selectedJurisdiction = "PJF";
    tribunalSelect.value = "PJF";
    setStartRule(1, false);
    updateNoticeBox();
    notificationInput.value = "";
    selectedPresetIndex = 0;
    isCustomSelected = false;
    customDaysValue = "";
    customNumberInput.value = "";
    clearPillSelection();
    renderPresets();
    updateLegalBasis();
    checkCalculateButtonState();
    resultsSection.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // --- Inicialización ---
  updateNoticeBox();
  renderPresets();
  updateLegalBasis();
  checkCalculateButtonState();
});
