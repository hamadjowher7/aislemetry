const basePath = "/aislemetry";
import { stores, brandedStores, brands, brandColors, visits, tasks, batches, workers, qualityQueue, settlement, categoryMetrics, planogramMetrics, agencyMetrics, settlementTotal, csvText, observationAtVisit, skuMetrics } from './data.mjs';
import { shelf, shareChart, trendChart, coverageMap, metric, demoLabel } from './visuals.mjs';

const select = (selector, root = document) => root.querySelector(selector);
const selectAll = (selector, root = document) => [...root.querySelectorAll(selector)];
const escape = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const percent = value => value === null || !Number.isFinite(value) ? 'Unavailable' : `${value.toFixed(1).replace('.0', '')}%`;
const rupees = value => `₹${value.toLocaleString('en-IN')}`;
const formValues = form => Object.fromEntries(new FormData(form));

function downloadText(name, text, type = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

const menu = select('#navigation');
const menuToggle = select('.menu-toggle');
function closeMenu(returnFocus = false) {
  menu.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation');
  if (returnFocus) menuToggle.focus();
}
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menu.classList.toggle('open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  if (open) select('a', menu).focus();
});
selectAll('a', menu).forEach(anchor => anchor.addEventListener('click', () => closeMenu()));
window.matchMedia('(min-width: 1101px)').addEventListener('change', () => closeMenu());
document.addEventListener('click', event => { if (!event.target.closest('.header')) closeMenu(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.classList.contains('open')) closeMenu(true);
  if (event.key === 'Tab' && menu.classList.contains('open')) {
    const links = [menuToggle, ...selectAll('a', menu)];
    if (event.shiftKey && document.activeElement === links[0]) { event.preventDefault(); links.at(-1).focus(); }
    if (!event.shiftKey && document.activeElement === links.at(-1)) { event.preventDefault(); menuToggle.focus(); }
  }
});

const evidenceDialog = select('#evidence-dialog');
let dialogOrigin;
function openDialog(content, origin = document.activeElement) {
  dialogOrigin = origin;
  select('#evidence-content').innerHTML = content;
  if (!evidenceDialog.open) evidenceDialog.showModal();
  document.body.classList.add('body-locked');
}
select('.dialog-close', evidenceDialog).addEventListener('click', () => evidenceDialog.close());
evidenceDialog.addEventListener('click', event => {
  const bounds = evidenceDialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) evidenceDialog.close();
});
evidenceDialog.addEventListener('close', () => {
  document.body.classList.remove('body-locked');
  if (dialogOrigin?.isConnected) dialogOrigin.focus();
});

function evidenceContent(store, mode = 'category', sku = null) {
  if (!store || store.accessStatus === 'refused' || store.status && store.status !== 'accepted') {
    return `<span class="demo-label">ILLUSTRATIVE EXCEPTION</span><h2 id="evidence-title">Evidence unavailable.</h2><p>${escape(store?.issue ?? 'No assessable evidence matches this selection.')}</p><p>No fabricated zero, confidence score, or image is substituted.</p>${store ? `<p>Store ID: ${escape(store.id)}</p>` : ''}`;
  }
  const branded = mode === 'branded';
  return `<span class="demo-label">FICTIONAL EVIDENCE / ORIGINAL ILLUSTRATION</span><h2 id="evidence-title">${escape(store.id)}</h2><p class="evidence-subtitle">${branded ? 'Branded premium bay' : 'Full beverage category'} · Bengaluru ${escape(store.zone)}</p>${shelf({ branded, id: 'drawer-shelf', exception: store.exception || false })}<dl class="evidence-metadata"><dt>Evidence ID</dt><dd>${store.evidenceIds.join(', ')}</dd><dt>Captured</dt><dd>${escape(store.capturedAt)}</dd><dt>Store format</dt><dd>${escape(store.format)}</dd><dt>Completeness / QA</dt><dd>Complete assessable scene · accepted in fictional fixture</dd><dt>Detection confidence</dt><dd>${percent(store.confidence * 100)} sample score; not validated model accuracy</dd><dt>Permission scope</dt><dd>${store.rightsScope.join(' · ')}</dd><dt>Reuse boundary</dt><dd>${branded ? 'Commissioned-brand-only; cross-brand reuse not permitted.' : 'Derived category analyses only within permitted purposes.'}</dd><dt>Selected slot</dt><dd>${sku === null ? 'Full scene / category boundary' : `Fictional product slot ${Number(sku) + 1}`}</dd><dt>Expected / observed</dt><dd>${branded ? `24 planned facings / ${store.observedFacings} observed; ${store.correctSlots} / 12 correct positions` : `${store.history.at(-1)[0]} Brand A facings / 100 category facings`}</dd><dt>Action status</dt><dd>Suggested field verification · not assigned to a real team</dd></dl><p class="small-note">Lineage: insight → selected metric → eligible store cohort → observation → evidence scene. No actual retailer photograph or customer record is represented.</p>`;
}

document.addEventListener('click', event => {
  const slot = event.target.closest('[data-sku]');
  if (!slot || slot.closest('#evidence-dialog') || slot.closest('[data-workspace]')) return;
  openDialog(`<span class="demo-label">ORIGINAL RETAIL ILLUSTRATION</span><h2 id="evidence-title">${escape(slot.getAttribute('aria-label'))}</h2><p>This is a fictional product slot used to explain capture framing and SKU placement. Open the intelligence workspace for store-linked evidence, timestamps, QA and permission scope.</p><a class="button" href="/intelligence?store=ST-BLR-021">Inspect evidence in the workspace ↗</a>`, slot);
});

const shelfSwitch = select('[data-shelf-switch]');
if (shelfSwitch) {
  selectAll('[data-shelf-mode]', shelfSwitch).forEach(button => button.addEventListener('click', () => {
    const branded = button.dataset.shelfMode === 'branded';
    selectAll('[data-shelf-mode]', shelfSwitch).forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    select('#switch-scene').innerHTML = shelf({ branded, id: 'switched-shelf' });
    select('#switch-eyebrow').textContent = branded ? 'BRANDED SHELF ASSURANCE' : 'CATEGORY INTELLIGENCE';
    select('#switch-title').textContent = branded ? 'Did you receive the placement?' : 'Who has visible presence?';
    select('#switch-description').textContent = branded ? 'Compare an agreed planogram with observed slots, priority SKU presence and facing exceptions in a separate 25-store sample.' : 'Compare facings, visible products, shelf-label prices and promotional presence across an explicitly defined category.';
    select('#switch-metric').innerHTML = branded ? '72% <span>18 / 25 sampled stores pass</span>' : '31% <span>Brand A share of visible facings</span>';
    select('#switch-link').href = branded ? '/intelligence/branded-space' : '/intelligence/category';
    select('#switch-link').textContent = branded ? 'Explore branded assurance →' : 'Explore category intelligence →';
  }));
}

const workspace = select('[data-workspace]');
if (workspace) {
  const filterForm = select('.filter-grid', workspace);
  const storeFilter = filterForm.elements.namedItem('store');
  const params = new URLSearchParams(location.search);
  let mode = workspace.dataset.initialMode;
  let view = ['pricing', 'promotions', 'evidence'].includes(params.get('view')) ? params.get('view') : 'overview';
  let selectedStore = params.get('store') || (mode === 'branded' ? 'PB-BLR-021' : 'ST-BLR-021');
  let sortKey = 'id';
  let descending = false;
  let page = 0;
  let compareMode = 'both';
  let annotations = true;
  let skuSort = 'facings';
  let skuDescending = true;
  let categoryBoundary = true;
  let showUnknown = true;
  let blend = 50;
  const modeStores = () => mode === 'branded' ? brandedStores : stores;
  function updateStoreOptions() {
    storeFilter.innerHTML = `<option value="all">All sampled stores</option>${modeStores().map(store => `<option value="${store.id}">${store.id}</option>`).join('')}`;
  }
  updateStoreOptions();
  if (modeStores().some(store => store.id === params.get('store'))) storeFilter.value = params.get('store');
  ['city', 'format', 'category', 'brand', 'period', 'zone'].forEach(key => { if ([...filterForm.elements.namedItem(key).options].some(option => option.value === params.get(key))) filterForm.elements.namedItem(key).value = params.get(key); });
  const readFilters = () => formValues(filterForm);
  function renderSkuTable() {
    const filters = readFilters();
    const rows = skuMetrics(filters).filter(row => row.brand === filters.brand).sort((first, second) => (first[skuSort] - second[skuSort]) * (skuDescending ? -1 : 1));
    return `<div class="table-toolbar"><h3>${escape(filters.brand)} / visible SKU observations</h3><span class="demo-label">FICTIONAL SKU CATALOG</span></div><div class="table-scroll"><table><caption>Presence means visible in the assessed scene, not confirmed whole-store stock. Unknown products retain no inferred identity or price.</caption><thead><tr><th>SKU / fictional product</th><th><button data-sku-sort="facings">Visible facings ↕</button></th><th><button data-sku-sort="presentStores">Store presence ↕</button></th><th>Mean readable label</th><th>Promo stores</th><th>Sample confidence</th><th>Evidence</th></tr></thead><tbody>${rows.map(row => `<tr><td>${row.id}<small>${row.name}</small></td><td>${row.facings}</td><td>${row.presentStores} / ${row.assessableStores}<small>${percent(row.presence)}</small></td><td>${row.labelPriceINR === null ? 'Unavailable' : rupees(Number(row.labelPriceINR.toFixed(2)))}</td><td>${row.promoStores}</td><td>${row.confidence === null ? 'Unresolved' : percent(row.confidence * 100)}</td><td><button class="table-link" data-evidence="${selectedStore}">Inspect source ↗</button></td></tr>`).join('')}</tbody></table></div>`;
  }
  const metadata = (count, readable, period) => `<p class="panel-metadata">ILLUSTRATIVE DEMO · ${mode === 'branded' ? 'separate branded-display cohort' : 'BLR-BEV-120 deliberate beverage panel'} · ${count} selected stores · ${readable} assessable · ${period === '7d' ? '13 Oct' : '20 Oct'} 2026 capture · snapshot 26 Oct 2026 · not representative population estimates</p>`;
  const emptyState = message => `<div class="empty-state"><span aria-hidden="true">◇</span><h3>Insufficient evidence.</h3><p>${message}</p><button class="small-button" data-reset-filters>Reset demo filters</button></div>`;
  function filteredBranded() {
    const filters = readFilters();
    if (filters.city !== 'Bengaluru' || filters.category !== 'Beverages' || filters.brand !== 'Brand A' || filters.simulation === 'offline') return [];
    return brandedStores.filter(store => (filters.format === 'all' || store.format === filters.format) && (filters.zone === 'all' || store.zone === filters.zone) && (filters.store === 'all' || store.id === filters.store));
  }
  function syncUrl() {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(readFilters())) if (value !== 'all' && value !== 'normal') search.set(key, value);
    if (view !== 'overview') search.set('view', view);
    const pathname = mode === 'branded' ? '/intelligence/branded-space' : location.pathname.includes('/category') ? '/intelligence/category' : '/intelligence';
    history.replaceState(null, '', `${basePath}${pathname}?${search}`);
  }
  function renderStoreTable(cohort, branded = false) {
    const brandIndex = Math.max(0, brands.indexOf(readFilters().brand));
    const visitIndex = readFilters().period === '7d' ? 2 : 3;
    const getValue = store => sortKey === 'value' ? branded ? store.correctSlots : store.history[visitIndex]?.[brandIndex] ?? -1 : store.id;
    const rows = [...cohort].sort((first, second) => {
      const firstValue = getValue(first), secondValue = getValue(second);
      const result = typeof firstValue === 'number' ? firstValue - secondValue : firstValue.localeCompare(secondValue);
      return descending ? -result : result;
    });
    const pages = Math.max(1, Math.ceil(rows.length / 10));
    page = Math.min(page, pages - 1);
    return `<div class="table-toolbar"><h3>Store evidence / ${rows.length} selected</h3><span>Page ${page + 1} of ${pages}</span></div><div class="table-scroll"><table><caption>Fictional sampled stores. Select an ID to inspect the evidence.</caption><thead><tr><th aria-sort="${sortKey === 'id' ? descending ? 'descending' : 'ascending' : 'none'}"><button data-sort="id">Store ID ↕</button></th><th>Zone / format</th><th aria-sort="${sortKey === 'value' ? descending ? 'descending' : 'ascending' : 'none'}"><button data-sort="value">${branded ? 'Correct positions' : 'Visible facings'} ↕</button></th><th>Observed label / promo</th><th>QA / action</th></tr></thead><tbody>${rows.slice(page * 10, (page + 1) * 10).map(store => `<tr class="${selectedStore === store.id ? 'selected-row' : ''}"><td><button class="table-link" data-store-evidence="${store.id}">${store.id}</button></td><td>${store.zone}<small>${store.format}</small></td><td>${branded ? `${store.correctSlots} / ${store.assessableSlots}` : store.status === 'accepted' ? `${store.history[visitIndex][brandIndex]} / 100` : 'Not assessable'}</td><td>${branded ? 'Placement scope' : store.status === 'accepted' ? `${rupees(store.shelfPriceINR)} · ${store.promotion ? 'Promo marked' : 'No promo marked'}` : 'Unavailable'}</td><td>${branded ? store.exception || 'Pass' : store.status === 'accepted' ? store.flagged ? 'Review matched change' : 'Accepted' : escape(store.issue)}</td></tr>`).join('')}</tbody></table></div><div class="pagination"><button class="small-button" data-page="-1" ${page === 0 ? 'disabled' : ''}>← Previous</button><button class="small-button" data-page="1" ${page >= pages - 1 ? 'disabled' : ''}>Next →</button></div>`;
  }
  function renderCategory() {
    const filters = readFilters();
    const data = categoryMetrics(filters);
    if (filters.simulation === 'offline') return emptyState('Offline simulation: the sample workspace cannot retrieve evidence. No current metrics are shown.');
    if (!data.cohort.length) return emptyState('No observations match this city or category. Only the explicitly fictional Bengaluru beverage panel is populated.');
    if (!data.accepted.length) return emptyState(data.cohort[0]?.issue || 'No readable category observation is available.');
    if (!data.cohort.some(store => store.id === selectedStore)) selectedStore = data.accepted[0].id;
    const store = stores.find(item => item.id === selectedStore);
    const trendValues = visits.map((visit, index) => data.accepted.reduce((sum, item) => sum + item.history[index][data.brandIndex], 0) / data.accepted.length);
    const averagePrice = data.accepted.reduce((sum, item) => sum + item.shelfPriceINR, 0) / data.accepted.length;
    const promoCount = data.accepted.filter(item => item.promotion).length;
    const reuseNotice = filters.simulation === 'rights' ? '<p class="warning">Reuse denied in this simulation. Shared buyer-derived output and export are disabled; only a restricted QA preview is shown.</p>' : '';
    return `${reuseNotice}${filters.period === '90d' ? '<p class="warning">Only four visits are available. Current snapshot shown; a 90-day comparison cannot be computed.</p>' : ''}<div class="metrics-row">${metric('Observed / assessable', `${data.cohort.length} / ${data.accepted.length}`, 'selected sample stores')}${metric(`${escape(filters.brand)} visible facings`, percent(data.share), data.delta === null ? 'Insufficient comparison history' : `${data.delta >= 0 ? '+' : ''}${data.delta.toFixed(1)} pp · matched cohort`)}${metric('Usable category coverage', percent(data.coverage), `${data.accepted.length} / ${data.cohort.length} observations`)}${metric('Median evidence age', `${data.medianAgeDays} days`, 'at 26 Oct 2026 snapshot')}</div>${metadata(data.cohort.length, data.accepted.length, filters.period)}<div class="workspace-chart-grid"><div class="workspace-card"><div class="card-heading"><h3>Visible category facings</h3><span class="demo-label">N = ${data.denominator.toLocaleString()} FACINGS</span></div>${shareChart(data.shares, true)}<p class="small-note">Includes Other / uncertain. Select a brand to recompute its metrics and inspect its store cohort. No sales market share is inferred.</p></div><div class="workspace-card"><h3>Matched-store comparison</h3>${filters.period === '90d' ? '<div class="empty-state compact"><h3>90-day history unavailable.</h3><p>Four weekly visits cannot support a 90-day trend.</p></div>' : trendChart(filters.period === '7d' ? trendValues.slice(1, 3) : trendValues, filters.period === '7d' ? ['06 Oct', '13 Oct'] : undefined)}<p class="small-note">${data.accepted.length} matched assessable stores in every shown visit. No changing outlet mix.</p></div></div><div class="workspace-evidence-grid"><div class="workspace-card"><div class="card-heading"><h3>${escape(selectedStore)} / observed scene</h3><button class="small-button" data-evidence="${escape(selectedStore)}">Inspect metadata ↗</button></div><div class="annotation-controls"><label class="checkbox-label"><input type="checkbox" data-annotations ${annotations ? 'checked' : ''}>Facing annotations</label><label class="checkbox-label"><input type="checkbox" data-boundary ${categoryBoundary ? 'checked' : ''}>Category boundary</label><label class="checkbox-label"><input type="checkbox" data-unknown ${showUnknown ? 'checked' : ''}>Other / uncertain</label></div><div class="shelf-wrapper ${categoryBoundary ? 'show-boundary' : ''} ${showUnknown ? '' : 'hide-unknown'}">${shelf({ id: 'workspace-category', annotations })}</div><p class="small-note">Original schematic scene, not a real photo or exact rendering of every counted facing. Select a product for slot details.</p></div><div class="workspace-card insights-card"><span class="eyebrow">${view.toUpperCase()} / EVIDENCE-LINKED FINDING</span><h3>${view === 'pricing' ? `Readable labels average ${rupees(Number(averagePrice.toFixed(2)))}` : view === 'promotions' ? `${promoCount} of ${data.accepted.length} stores show a promo marker` : `${escape(filters.brand)} represents ${percent(data.share)} of visible facings.`}</h3><p>${view === 'pricing' ? 'Observed shelf labels only. Sample price does not imply a current retail offer or competitor confidential data.' : view === 'promotions' ? 'Presence of a promotion marker is an observation, not proof of promotional lift or sales impact.' : `This result uses ${data.denominator.toLocaleString()} assessable category facings across ${data.accepted.length} matched stores.`}</p>${filters.brand === 'Brand A' && filters.period !== '7d' ? `<p>${data.flags.length} selected stores show a material matched loss in visible presence.</p>` : '<p>Review selected store evidence before forming a commercial interpretation.</p>'}<button class="button" data-evidence="${escape(selectedStore)}">Trace the evidence ↗</button><div class="insight-lineage"><span>Metric denominator: ${data.denominator} facings</span><span>Source: ${escape(store?.historyEvidenceIds?.[data.visitIndex]?.[0] || 'No accepted evidence')}</span><span>Suggested move: field verification</span></div></div></div>${view === 'evidence' ? '<p class="warning">Evidence view: inspect a store ID below. Unusable and denied captures remain visible as exceptions.</p>' : ''}${renderSkuTable()}${renderStoreTable(data.cohort)}<details class="methodology-inline"><summary>Sample definition and limitations <span>+</span></summary><p>120 deliberately selected Bengaluru outlets: 70 supermarkets and 50 grocery stores. Four matched visits, 113 readable stores and seven excluded captures. No probability-based city estimate. Category share includes unknown classifications. Confidence values are fictional demonstration scores. Capture dates are pinned, not live.</p></details>`;
  }
  function renderBranded() {
    const filters = readFilters();
    const cohort = filteredBranded();
    if (filters.simulation === 'offline') return emptyState('Offline simulation. No branded evidence can be retrieved.');
    if (!cohort.length) return emptyState('No branded observations match these filters. The separate branded sample contains Brand A beverage bays in Bengaluru only.');
    if (!cohort.some(store => store.id === selectedStore)) selectedStore = cohort.find(store => !store.passed)?.id || cohort[0].id;
    const store = cohort.find(item => item.id === selectedStore);
    const data = planogramMetrics(cohort);
    return `${filters.simulation === 'rights' ? '<p class="warning">This sample is commissioned-brand-only. No cross-brand reuse is permitted.</p>' : ''}${filters.period !== '30d' ? '<p class="warning">Only the 20 Oct branded observation is populated. No historical branded comparison is available for this date window.</p>' : ''}<div class="metrics-row">${metric('Assessable stores', data.count, 'separate branded cohort')}${metric('Store pass rate', percent(data.passRate), `${data.pass} pass / ${data.count} assessable`)}${metric('Slot adherence', percent(data.adherence), 'correct / assessable planned positions')}${metric('Exception stores', data.fail, `${data.missing} missing SKU · ${data.deviations} placement / facing`)}</div>${metadata(data.count, data.count, '30d')}<div class="workspace-card"><div class="card-heading"><h3>${store.id} / expected versus observed</h3><button class="small-button" data-evidence="${store.id}">Inspect this evidence ↗</button></div><div class="segmented" role="group" aria-label="Planogram comparison"><button data-compare="both" aria-pressed="${compareMode === 'both'}">Side by side</button><button data-compare="expected" aria-pressed="${compareMode === 'expected'}">Expected</button><button data-compare="actual" aria-pressed="${compareMode === 'actual'}">Observed</button><button data-compare="blend" aria-pressed="${compareMode === 'blend'}">Blend overlay</button></div><div class="planogram-scenes ${compareMode === 'both' ? '' : 'single-scene'} ${compareMode === 'blend' ? 'blend-scenes' : ''}">${compareMode !== 'actual' ? `<div class="expected-scene">${shelf({ branded: true, expected: true, id: 'expected-planogram' })}</div>` : ''}${compareMode !== 'expected' ? `<div class="actual-scene" ${compareMode === 'blend' ? `style="clip-path:inset(0 ${100 - blend}% 0 0)"` : ''}>${shelf({ branded: true, id: 'actual-planogram', exception: store.exception || false })}</div>` : ''}</div>${compareMode === 'blend' ? `<label class="blend-control">Observed overlay reveal <input type="range" min="0" max="100" value="${blend}" data-blend aria-label="Percentage of observed planogram revealed"></label>` : ''}<div class="planogram-legend"><span class="legend-good">Correct</span><span class="legend-warning">Assessable warning</span><span class="legend-bad">Verified demo exception</span><span class="legend-unknown">Unknown / unassessable</span></div><div class="metrics-row">${metric('Planned / observed facings', `24 / ${store.observedFacings}`)}${metric('Correct positions', `${store.correctSlots} / 12`)}${metric('Priority SKU presence', `${store.priorityPresent} / 4`)}${metric('Display / QA', 'Present / 95%', 'fictional detection score')}</div><p class="small-note">${store.exception || 'No qualified exception in this mock store.'} · All 12 planned positions assessable · fictional slots accept only their labeled SKU; no unlisted substitute is assumed. Illustration explains exception types, while this store’s counts remain authoritative.</p></div><div class="workspace-card"><h3>Store observation timeline</h3><div class="timeline"><div><strong>13 Oct 2026</strong><p>No branded observation collected. Historical adherence unavailable.</p></div><div><strong>20 Oct 2026 · 11:45 IST</strong><p>${store.id} · ${store.correctSlots} / 12 correct positions · ${store.observedFacings} visible facings</p><button class="table-link" data-evidence="${store.id}">Open captured evidence ↗</button></div></div></div>${renderStoreTable(cohort, true)}<p class="panel-metadata">25-store base fixture: 18 pass + 7 exceptions = 25. Of the seven exception stores, three have missing priority SKUs and four have placement/facing deviations. Slot adherence and store pass rate are distinct measures.</p>`;
  }
  function renderWorkspace() {
    selectAll('[data-mode]', workspace).forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === mode)));
    select('#workspace-content').innerHTML = mode === 'branded' ? renderBranded() : renderCategory();
    syncUrl();
  }
  filterForm.addEventListener('submit', event => event.preventDefault());
  filterForm.addEventListener('change', () => { page = 0; if (storeFilter.value !== 'all') selectedStore = storeFilter.value; renderWorkspace(); });
  workspace.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.mode) {
      mode = button.dataset.mode;
      if (mode === 'branded') filterForm.elements.namedItem('brand').value = 'Brand A';
      selectedStore = mode === 'branded' ? 'PB-BLR-021' : 'ST-BLR-021';
      page = 0;
      updateStoreOptions();
      renderWorkspace();
    }
    if (button.dataset.workspaceView) { view = button.dataset.workspaceView; page = 0; renderWorkspace(); }
    if (button.dataset.brand) { filterForm.elements.namedItem('brand').value = button.dataset.brand; renderWorkspace(); }
    if (button.dataset.storeEvidence) { selectedStore = button.dataset.storeEvidence; renderWorkspace(); openDialog(evidenceContent(mode === 'category' ? observationAtVisit(modeStores().find(store => store.id === selectedStore), readFilters().period === '7d' ? 2 : 3) : modeStores().find(store => store.id === selectedStore), mode), select(`[data-store-evidence="${selectedStore}"]`, workspace)); }
    if (button.dataset.evidence) openDialog(evidenceContent(mode === 'category' ? observationAtVisit(modeStores().find(store => store.id === button.dataset.evidence), readFilters().period === '7d' ? 2 : 3) : modeStores().find(store => store.id === button.dataset.evidence), mode), button);
    if (button.dataset.sku !== undefined) openDialog(evidenceContent(mode === 'category' ? observationAtVisit(modeStores().find(store => store.id === selectedStore), readFilters().period === '7d' ? 2 : 3) : modeStores().find(store => store.id === selectedStore), mode, button.dataset.sku), button);
    if (button.dataset.sort) { descending = sortKey === button.dataset.sort ? !descending : false; sortKey = button.dataset.sort; renderWorkspace(); }
    if (button.dataset.skuSort) { skuDescending = skuSort === button.dataset.skuSort ? !skuDescending : true; skuSort = button.dataset.skuSort; renderWorkspace(); }
    if (button.dataset.page) { page += Number(button.dataset.page); renderWorkspace(); }
    if (button.dataset.compare) { compareMode = button.dataset.compare; renderWorkspace(); }
    if (button.hasAttribute('data-reset-filters')) { filterForm.reset(); page = 0; renderWorkspace(); }
    if (button.hasAttribute('data-export')) {
      const filters = readFilters();
      if (filters.simulation === 'offline' || filters.simulation === 'rights') { openDialog('<h2 id="evidence-title">Export unavailable.</h2><p>Offline evidence or missing reuse rights prevents this sample export. No restricted output was generated.</p>', button); return; }
      const rows = [['ILLUSTRATIVE DEMO — NOT REAL MARKET DATA'], ['store_id', 'city', 'zone', 'format', 'brand', 'visible_facings', 'category_denominator', 'captured_at', 'evidence_id', 'quality', 'rights_scope']];
      if (mode === 'category') {
        const data = categoryMetrics(filters);
        data.cohort.forEach(store => rows.push([store.id, store.city, store.zone, store.format, filters.brand, store.history[data.visitIndex]?.[data.brandIndex] ?? 'unavailable', store.status === 'accepted' ? 100 : 'unavailable', store.status === 'accepted' ? `${visits[data.visitIndex]} sample capture` : 'unavailable', store.historyEvidenceIds[data.visitIndex]?.[0], store.status, store.rightsScope.join('|')]));
      } else {
        rows[1] = ['store_id', 'correct_positions', 'assessable_positions', 'planned_facings', 'observed_facings', 'exception', 'evidence_id', 'rights_scope'];
        filteredBranded().forEach(store => rows.push([store.id, store.correctSlots, store.assessableSlots, store.plannedFacings, store.observedFacings, store.exception || 'none', store.evidenceIds[0], store.rightsScope.join('|')]));
      }
      if (rows.length === 2) { openDialog('<h2 id="evidence-title">No matching sample rows.</h2><p>Change the filters before exporting.</p>', button); return; }
      downloadText(`aislemetry-${mode}-ILLUSTRATIVE-DEMO.csv`, csvText(rows), 'text/csv;charset=utf-8');
    }
  });
  workspace.addEventListener('change', event => {
    if (event.target.hasAttribute('data-annotations')) { annotations = event.target.checked; renderWorkspace(); }
    if (event.target.hasAttribute('data-boundary')) { categoryBoundary = event.target.checked; renderWorkspace(); }
    if (event.target.hasAttribute('data-unknown')) { showUnknown = event.target.checked; renderWorkspace(); }
  });
  workspace.addEventListener('input', event => {
    if (event.target.hasAttribute('data-blend')) { blend = Number(event.target.value); select('.actual-scene', workspace).style.clipPath = `inset(0 ${100 - blend}% 0 0)`; }
  });
  renderWorkspace();
}

const taskFilters = select('#task-filters');
if (taskFilters) {
  let selectedTaskId = tasks[0].id;
  let permissionAcknowledged = false;
  function showTask(task) {
    selectedTaskId = task.id;
    permissionAcknowledged = false;
    select('#task-preview').innerHTML = `<div><span class="eyebrow">${task.id} / FICTIONAL TASK DETAIL</span><h3>${task.name}</h3><p>${task.requirements}</p><div class="task-detail-chips"><span>${rupees(task.reward)} sample reward</span><span>${task.minutes} min, excluding travel</span><span>${task.photos} required photos</span><span>Bengaluru ${task.zone}</span></div><p>${task.expires}. No actual outlet address or live navigation is provided.</p></div><div><h4>Permission comes first.</h4><p>Eligible participating store only. Decline if refused. Do not capture faces, private records or restricted areas.</p><label class="checkbox-label"><input type="checkbox" id="task-permission">I understand the permission requirement for this simulation.</label><button class="button" id="task-prepare">Preview preparation →</button><p id="task-status" role="status"></p></div>`;
    select('#task-permission').addEventListener('change', event => { permissionAcknowledged = event.target.checked; });
    select('#task-prepare').addEventListener('click', () => {
      select('#task-status').textContent = permissionAcknowledged ? `Simulation prepared for ${selectedTaskId}. No task has been accepted. Capture full-category framing, readable labels and ${task.photos} original sample angles; review and payout remain simulated.` : 'Acknowledge store permission before continuing. If a retailer refuses, decline and report.';
    });
  }
  function renderTasks() {
    const filters = formValues(taskFilters);
    const matching = tasks.filter(task => (filters.category === 'all' || task.category === filters.category) && task.distance <= Number(filters.radius) && task.reward >= Number(filters.reward) && Number(task.minutes.split('–')[1]) <= Number(filters.minutes));
    select('#task-list').innerHTML = matching.length ? matching.map(task => `<button class="task-card ${task.id === selectedTaskId ? 'active' : ''}" data-task="${task.id}"><span class="demo-label">SAMPLE TASK / NOT AVAILABLE</span><strong>${task.name}</strong><span>${task.category} · ${task.distance} km fictional distance</span><div><b>${rupees(task.reward)}</b><span>${task.minutes} min</span></div><small>${task.photos} required photos · view details ↗</small></button>`).join('') : '<div class="empty-state"><h3>No sample tasks match.</h3><p>Widen your filters. This is not a live location feed.</p></div>';
    if (matching.length) showTask(matching.find(task => task.id === selectedTaskId) || matching[0]);
    else select('#task-preview').innerHTML = '';
  }
  taskFilters.addEventListener('change', renderTasks);
  taskFilters.addEventListener('submit', event => event.preventDefault());
  select('#task-list').addEventListener('click', event => { const card = event.target.closest('[data-task]'); if (card) { selectedTaskId = card.dataset.task; renderTasks(); } });
  renderTasks();
}

if (select('[data-capture]')) {
  let captured = 0;
  const guidance = ['Include the left and right category boundaries. Avoid people and private information.', 'Keep shelf labels readable. Check for glare before continuing.', 'Capture a matching overlapping angle, with no occluded target shelf.', 'Confirm the full category and required evidence before simulated review.'];
  function renderCapture(message = '') {
    select('#capture-progress').value = captured;
    select('#capture-title').textContent = captured === 4 ? '4 of 4 sample frames · simulated receipt' : `Frame ${captured + 1} of 4 · ${['full category', 'readable labels', 'overlap angle', 'coverage check'][captured]}`;
    select('#capture-guidance').textContent = captured === 4 ? 'TASK-DEMO-CAPTURE · sample files 4 · fictional outlet ST-BLR-021 · Under Review. No actual capture or upload occurred. Review/appeal process is proposed, not operational.' : guidance[captured];
    select('[data-capture-next]').disabled = captured === 4;
    select('#capture-status').textContent = message || 'Preview only. No photo has been taken, sent or approved for payment.';
  }
  select('[data-capture-next]').addEventListener('click', () => { captured = Math.min(4, captured + 1); renderCapture(); });
  select('[data-capture-blur]').addEventListener('click', () => renderCapture('Simulated QA issue: blur detected. Retake this sample frame; progress does not advance.'));
  select('[data-capture-reset]').addEventListener('click', () => { captured = 0; renderCapture(); });
  renderCapture();
}

const agency = select('[data-agency]');
if (agency) {
  let tab = 'roster';
  const localWorkers = workers.map(worker => ({ ...worker }));
  const localQuality = qualityQueue.map(item => ({ ...item }));
  const zoneBatches = { North: ['B-01'], East: ['B-02'], South: ['B-03'], West: ['B-04', 'B-05'] };
  function selectedBatches() {
    const id = select('#agency-batch').value;
    const zone = select('#agency-zone').value;
    return batches.filter(batch => (id === 'all' || batch.id === id) && (zone === 'all' || zoneBatches[zone].includes(batch.id)));
  }
  function renderAgency() {
    const selected = selectedBatches();
    const data = agencyMetrics(selected);
    select('#agency-metrics').innerHTML = metric('Assigned store tasks', data.assigned) + metric('Complete', data.complete) + metric('Due today', data.due) + metric('Not started', data.notStarted);
    select('#batch-list').innerHTML = selected.length ? selected.map(batch => `<button class="batch-row" data-select-batch="${batch.id}"><span><strong>${batch.name}</strong><small>${batch.status}</small></span><span>${batch.complete} / ${batch.assigned}<small>${batch.due} due today</small></span></button>`).join('') : '<p class="empty-state">No batches match this zone and campaign combination.</p>';
    selectAll('[data-agency-tab]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.agencyTab === tab)));
    if (tab === 'roster') select('#agency-panel').innerHTML = `<div class="card-heading"><h3>18 verified mock workers / 11 active</h3><span class="demo-label">SESSION-ONLY ALLOCATION</span></div><div class="table-scroll"><table><caption>Assigning a worker changes this demo session only; it does not dispatch real work or change delivery counts.</caption><thead><tr><th>Worker</th><th>Readiness</th><th>Accepted / completed</th><th>Demo quality</th><th>Allocate batch</th></tr></thead><tbody>${localWorkers.map(worker => `<tr><td>${worker.name}<small>${worker.id}</small></td><td>${worker.active ? 'Active' : 'Available later'} · ${worker.trained ? 'Trained' : 'Training pending'}</td><td>${worker.accepted} / ${worker.completed}</td><td>${percent(worker.accepted / worker.completed * 100)}</td><td><select data-worker="${worker.id}" aria-label="Allocate ${worker.name}" ${worker.trained ? '' : 'disabled'}><option value="">Unassigned</option>${batches.map(batch => `<option value="${batch.id}" ${worker.assignment === batch.id ? 'selected' : ''}>${batch.name}</option>`).join('')}</select></td></tr>`).join('')}</tbody></table></div>`;
    if (tab === 'quality') select('#agency-panel').innerHTML = `<h3>${localQuality.filter(item => item.status === 'Needs review').length} sample submissions still require review</h3><div class="quality-cards">${localQuality.map(item => `<article><span>${item.id} / ${item.storeId}</span><h4>${item.reason}</h4><p>${item.status}</p><button class="small-button" data-qa="${item.id}" ${item.status !== 'Needs review' ? 'disabled' : ''}>Request sample recheck ↗</button></article>`).join('')}</div><p class="small-note">A recheck request is not acceptance. No real evidence is approved or rejected.</p>`;
    if (tab === 'settlement') select('#agency-panel').innerHTML = `<div class="card-heading"><h3>Fictional settlement / pending</h3><strong>${rupees(settlementTotal())}</strong></div><div class="table-scroll"><table><caption>Independent example invoice ledger; not a real rate card or current payable.</caption><thead><tr><th>Accepted work</th><th>Quantity</th><th>Example rate</th><th>Adjustments</th><th>Net</th></tr></thead><tbody>${settlement.map(entry => `<tr><td>${entry.description}</td><td>${entry.quantity}</td><td>${rupees(entry.rate)}</td><td>${rupees(entry.adjustment)}</td><td>${rupees(entry.quantity * entry.rate + entry.adjustment)}</td></tr>`).join('')}</tbody></table></div><p class="small-note">Gross ${rupees(settlement.reduce((sum, entry) => sum + entry.quantity * entry.rate, 0))}, adjustment −₹160, pending ${rupees(settlementTotal())}. No money has been sent. This separate example ledger is unaffected by campaign filters.</p>`;
  }
  select('#agency-batch').addEventListener('change', renderAgency);
  select('#agency-zone').addEventListener('change', renderAgency);
  agency.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.agencyTab) { tab = button.dataset.agencyTab; renderAgency(); }
    if (button.dataset.selectBatch) { select('#agency-batch').value = button.dataset.selectBatch; renderAgency(); }
    if (button.dataset.mapZone) { select('#agency-zone').value = button.dataset.mapZone; select('#agency-batch').value = 'all'; renderAgency(); }
    if (button.dataset.qa) { localQuality.find(item => item.id === button.dataset.qa).status = 'Recheck requested (demo)'; renderAgency(); select('#agency-status').textContent = `${button.dataset.qa}: a sample recheck was recorded in this session. No real notification was sent.`; }
    if (button.hasAttribute('data-settlement-export')) downloadText('aislemetry-settlement-ILLUSTRATIVE-DEMO.csv', csvText([['ILLUSTRATIVE AGENCY SETTLEMENT — NO REAL PAYMENT'], ['id', 'description', 'accepted_quantity', 'example_rate_INR', 'adjustment_INR', 'net_INR'], ...settlement.map(entry => [entry.id, entry.description, entry.quantity, entry.rate, entry.adjustment, entry.quantity * entry.rate + entry.adjustment])]), 'text/csv;charset=utf-8');
  });
  agency.addEventListener('change', event => {
    if (event.target.dataset.worker) { localWorkers.find(worker => worker.id === event.target.dataset.worker).assignment = event.target.value; select('#agency-status').textContent = `${event.target.dataset.worker}: allocation updated locally. No job was dispatched; delivery counters remain unchanged.`; }
  });
  renderAgency();
}

if (select('[data-wallet-state]')) {
  const entries = [
    { id: 'W-201', task: 'Snacks availability', amount: 55, status: 'Submitted', note: 'Sample receipt created; not yet reviewed.' },
    { id: 'W-202', task: 'Beverage category', amount: 80, status: 'Under Review', note: 'Readable-label review pending.' },
    { id: 'W-203', task: 'Premium branded bay', amount: 120, status: 'Approved', note: 'Accepted in the fictional ledger; payment not initiated.' },
    { id: 'W-204', task: 'Category repeat visit', amount: 100, status: 'Paid', note: 'Fictional paid entry; no actual transfer.' },
    { id: 'W-205', task: 'Earlier beverage check', amount: 80, status: 'Paid', note: 'Fictional paid entry; no actual transfer.' }
  ];
  function renderWallet(state) {
    selectAll('[data-wallet-state]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.walletState === state)));
    const selected = entries.filter(entry => entry.status === state);
    select('#wallet-ledger').innerHTML = `<div class="metrics-row">${metric(`${state} / sample entries`, selected.length)}${metric('Illustrative total', rupees(selected.reduce((sum, entry) => sum + entry.amount, 0)), 'No live earnings or payment')}</div><div class="wallet-records">${selected.map(entry => `<article><span>${entry.id} / ${entry.status}</span><h3>${entry.task}</h3><strong>${rupees(entry.amount)}</strong><p>${entry.note}</p></article>`).join('')}</div>`;
  }
  selectAll('[data-wallet-state]').forEach(button => button.addEventListener('click', () => renderWallet(button.dataset.walletState)));
  select('[data-wallet-appeal]').addEventListener('click', () => { select('#wallet-support').textContent = 'Proposed review route: reference the task ID, read the QA reason, provide corrected evidence through a future secure capture flow, and request a second review. No support ticket was created.'; });
  renderWallet('Submitted');
}

const jobUpload = select('#agency-jobs-upload');
if (jobUpload) {
  select('[data-job-template]').addEventListener('click', () => downloadText('aislemetry-job-import-DEMO.csv', 'store_id,zone\nST-DEMO-001,North\nST-DEMO-002,South\nST-DEMO-003,East\n', 'text/csv;charset=utf-8'));
  jobUpload.addEventListener('change', async () => {
    const file = jobUpload.files[0];
    if (!file) return;
    if (file.size > 100000) { select('#job-upload-status').textContent = 'Choose a demo CSV smaller than 100 KB.'; return; }
    try {
      const lines = (await file.text()).trim().replace(/^\uFEFF/, '').split(/\r?\n/);
      if (lines[0] !== 'store_id,zone') throw new Error('Use the template header: store_id,zone.');
      const rows = lines.slice(1).map(line => line.split(','));
      if (!rows.length || rows.length > 500 || rows.some(row => row.length !== 2 || !/^ST-DEMO-\d{3}$/.test(row[0]) || !['North', 'South', 'East', 'West'].includes(row[1]))) throw new Error('Use 1–500 fictional ST-DEMO-000 store IDs and North, South, East or West zones. Do not upload actual store or personal records.');
      if (new Set(rows.map(row => row[0])).size !== rows.length) throw new Error('Each fictional store ID must be unique.');
      select('#job-upload-status').textContent = `${rows.length} sample rows parsed locally. No batch was created, tasks dispatched or file uploaded to a server.`;
      select('#job-upload-preview').innerHTML = rows.slice(0, 8).map(([id, zone]) => `<span>${escape(id)} · ${escape(zone)}</span>`).join('');
    } catch (error) {
      select('#job-upload-status').textContent = error.message;
      select('#job-upload-preview').replaceChildren();
    }
  });
}

selectAll('[data-interest]').forEach(form => form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = formValues(form);
  if (!data.name.trim() || !data.city.trim()) { select('.form-status', form).textContent = 'Enter a name and city, not just spaces.'; return; }
  const lines = ['AISLEMETRY — LOCAL DEMO PROFILE / NOT SUBMITTED', `Profile type: ${form.dataset.interest}`, '', ...Object.entries(data).filter(([key]) => key !== 'consent').map(([key, value]) => `${key}: ${value}`), '', 'No information was transmitted. No waitlist entry, commercial inquiry, booking, task or account was created.'];
  downloadText(`aislemetry-${form.dataset.interest}-local-profile.txt`, lines.join('\n'));
  select('.form-status', form).textContent = 'Local profile downloaded. Nothing was submitted; you have not been added to a waitlist or contacted.';
}));

const pilotForm = select('#pilot-form');
if (pilotForm) {
  const bundle = new URLSearchParams(location.search).get('bundle');
  if (bundle === 'pulse') { pilotForm.elements.namedItem('useCase').value = 'category'; pilotForm.elements.namedItem('stores').value = '100'; pilotForm.elements.namedItem('cadence').value = 'weekly'; }
  if (bundle === 'assurance') { pilotForm.elements.namedItem('stores').value = '25'; pilotForm.elements.namedItem('cadence').value = 'fortnightly'; }
  if (bundle === 'launch') { pilotForm.elements.namedItem('useCase').value = 'category'; pilotForm.elements.namedItem('stores').value = '50'; pilotForm.elements.namedItem('cadence').value = 'weekly'; pilotForm.elements.namedItem('question').value = 'Are our three new priority SKUs visible in 50 target stores across repeat visits?'; }
  const guidance = {
    branded: 'Suggested measures: assessable planned positions, observed facings, priority SKU presence, display verification and severity-ranked exceptions.',
    category: 'Suggested measures: complete-category visible facings, SKU presence, readable labels and same-store trends. Reuse is subject to explicit rights.',
    pricing: 'Suggested measures: readable shelf and promotional labels, display presence, capture dates and location context. No sales or promotion-lift inference.',
    mystery: 'Suggested scope: structured observation questions, eligible store/channel sample, required evidence and clear access and privacy boundaries.'
  };
  function pilotData() {
    const data = formValues(pilotForm);
    const storeCount = Number(data.stores);
    const validCount = Number.isFinite(storeCount) && storeCount >= 10 && storeCount <= 500 && Number.isInteger(storeCount);
    const waves = data.cadence === 'weekly' ? 4 : data.cadence === 'fortnightly' ? 2 : 1;
    return { ...data, validCount, storeCount, waves, visits: validCount ? storeCount * waves : null, deliverables: new FormData(pilotForm).getAll('deliverables') };
  }
  function renderPilot() {
    const data = pilotData();
    select('#pilot-guidance').textContent = guidance[data.useCase];
    select('#pilot-summary').innerHTML = `<dl><dt>Use case</dt><dd>${escape(pilotForm.elements.namedItem('useCase').selectedOptions[0].textContent)}</dd><dt>Proposed geography</dt><dd>${escape(data.city)} · ${escape(data.zones || 'zones to scope')}</dd><dt>Outlet scope</dt><dd>${data.validCount ? data.storeCount : 'Enter 10–500 whole'} stores · ${escape(data.format)}</dd><dt>Cadence</dt><dd>${data.waves} proposed observation wave${data.waves > 1 ? 's' : ''}</dd><dt>Collection workload</dt><dd>${data.visits ?? 'Unavailable'} store visits, before retries</dd><dt>Category / QA</dt><dd>${escape(data.category)} · ${escape(data.verification)}</dd><dt>Deliverables</dt><dd>${data.deliverables.map(escape).join(' · ') || 'None selected'}</dd><dt>Access and reuse</dt><dd>${escape(data.rights)}</dd></dl><span class="demo-label">CONFIGURATION ONLY / NOT CONFIRMED COVERAGE</span>`;
  }
  pilotForm.addEventListener('input', renderPilot);
  pilotForm.addEventListener('change', renderPilot);
  pilotForm.addEventListener('submit', event => {
    event.preventDefault();
    const data = pilotData();
    if (!pilotForm.reportValidity()) return;
    if (!data.validCount || !data.deliverables.length || !data.question.trim() || !data.name.trim() || !data.company.trim() || !data.role.trim()) { select('#pilot-status').textContent = 'Enter complete details, a whole store count from 10 to 500, and at least one deliverable.'; return; }
    const lines = ['AISLEMETRY — PROPOSED PILOT BRIEF / NOT SUBMITTED', '', ...Object.entries(data).filter(([key]) => !['consent', 'validCount', 'deliverables'].includes(key)).map(([key, value]) => `${key}: ${value}`), `deliverables: ${data.deliverables.join(', ')}`, '', 'Coverage, access, sampling, QA, rights, delivery and commercial terms require confirmation.', 'This file was prepared locally. No proposal request was submitted and no pilot was booked.'];
    downloadText('aislemetry-proposed-pilot-brief.txt', lines.join('\n'));
    select('#pilot-status').textContent = 'Your configured brief was downloaded locally. No request was submitted and no coverage or commercial terms were confirmed.';
  });
  renderPilot();
}

const designer = select('#audit-designer');
if (designer) designer.addEventListener('submit', event => {
  event.preventDefault();
  const values = formValues(designer);
  if (!values.question.trim()) return;
  const placement = values.focus === 'Branded placement';
  select('#designer-output').innerHTML = `<article class="designer-output"><span class="demo-label">RULE-BASED TEMPLATE / NOT AI-GENERATED</span><h3>${escape(values.question)}</h3><div class="three-columns"><div><h4>Define the scope</h4><p>${placement ? 'Agree the contracted planogram, assessable positions and priority SKU list.' : 'Define a full-category boundary, selected outlet panel and readable-label requirements.'}</p></div><div><h4>Capture deliberately</h4><p>Confirm store permission, framing, dates, outlet mix and repeat-store comparisons before fieldwork.</p></div><div><h4>Review the finding</h4><p>${placement ? 'Compare correct positions, missing products and observed facings with the agreed layout.' : 'Compare visible facings, observed SKU presence and dated shelf labels. Do not infer sales velocity.'}</p></div></div><p>Evidence requirements: authorized shelf views, anonymous store ID, capture timestamp, quality status and usage-rights record.</p><a class="button" href="/pilot">Refine this in the pilot builder ↗</a></article>`;
});

function localizePublicLinks(root = document) {
  if (!basePath) return;
  root.querySelectorAll('a[href^="/"]').forEach(anchor => {
    const destination = anchor.getAttribute('href');
    if (!destination.startsWith('//') && destination !== basePath && !destination.startsWith(basePath + '/')) anchor.setAttribute('href', basePath + destination);
  });
}
localizePublicLinks();
new MutationObserver(() => localizePublicLinks()).observe(document.body, { childList: true, subtree: true });
