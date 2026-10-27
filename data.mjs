export const DEMO_DATA = true;
export const snapshotDate = '2026-10-26';
export const captureDate = '2026-10-20';
export const brands = ['Brand A', 'Brand B', 'Brand C', 'Brand D', 'Other / uncertain'];
export const brandColors = ['#315b43', '#829979', '#bac983', '#b18b59', '#d9ddd1'];
export const zones = ['North', 'South', 'East', 'West'];
export const flaggedIds = [21, 25, 29, 33, 37, 41, 45, 49, 53];
export const visits = ['2026-09-29', '2026-10-06', '2026-10-13', captureDate];
const compensatedIds = Array.from({ length: 113 }, (_, index) => index + 1).filter(index => !flaggedIds.includes(index)).slice(0, 72);

export const stores = Array.from({ length: 120 }, (_, index) => {
  const number = index + 1;
  const accepted = number <= 113;
  const latestA = flaggedIds.includes(number) ? 23 : compensatedIds.includes(number) ? 32 : 31;
  return {
    id: `ST-BLR-${String(number).padStart(3, '0')}`,
    city: 'Bengaluru',
    zone: zones[number % zones.length],
    format: number <= 70 ? 'supermarket' : 'grocery',
    panelId: 'BLR-BEV-120',
    accessStatus: number === 114 ? 'refused' : 'permitted',
    status: accepted ? 'accepted' : number === 114 ? 'unusable' : 'review',
    issue: accepted ? '' : number === 114 ? 'Store permission refused; no capture authorized.' : number === 115 ? 'Low-confidence labels require manual review.' : number === 116 ? 'Incomplete category coverage; excluded from facings.' : 'Blur or occlusion; recapture required.',
    rightsScope: accepted ? ['category-analysis', 'permitted-aggregates'] : [],
    confidence: accepted ? 0.91 + (index % 7) / 100 : null,
    capturedAt: accepted ? `${captureDate}T${String(10 + index % 7).padStart(2, '0')}:20:00+05:30` : null,
    evidenceIds: accepted ? [`EV-BLR-${String(number).padStart(3, '0')}`] : [],
    historyEvidenceIds: accepted ? visits.map((visit, visitIndex) => [`EV-BLR-${String(number).padStart(3, '0')}${visitIndex === 3 ? '' : `-V${visitIndex + 1}`}`]) : [],
    history: accepted ? [[35, 23, 19, 13, 10], [34, 24, 19, 13, 10], [32, 24, 20, 14, 10], [latestA, 56 - latestA, 20, 14, 10]] : [],
    flagged: flaggedIds.includes(number),
    shelfPriceINR: 40 + index % 3 * 2,
    promotion: index % 3 === 0,
    prioritySkuPresent: accepted ? number % 10 !== 0 : null
  };
});

export const brandedStores = Array.from({ length: 25 }, (_, index) => {
  const number = index + 1;
  const exception = number <= 18 ? null : number <= 21 ? 'Missing priority SKU' : 'Placement / facing deviation';
  return {
    id: `PB-BLR-${String(number).padStart(3, '0')}`,
    city: 'Bengaluru', zone: zones[index % 4], format: number <= 15 ? 'supermarket' : 'grocery',
    exception, passed: !exception, plannedSlots: 12, assessableSlots: 12,
    correctSlots: exception === 'Missing priority SKU' ? 11 : exception ? 10 : 12,
    plannedFacings: 24, observedFacings: exception ? 22 : 24,
    priorityPresent: exception === 'Missing priority SKU' ? 3 : 4, priorityPlanned: 4,
    displayPresent: true, confidence: 0.95, capturedAt: `${captureDate}T11:45:00+05:30`,
    evidenceIds: [`EV-PB-${String(number).padStart(3, '0')}`], rightsScope: ['commissioned-brand-only']
  };
});

export const tasks = [
  { id: 'TASK-201', name: 'Beverage category shelf check', category: 'Beverages', reward: 80, minutes: '8–12', distance: 1.2, photos: 4, zone: 'South', expires: 'Sample window: 20 Oct, 18:00', requirements: 'Full beverage category, readable shelf tags, and three coverage checks.' },
  { id: 'TASK-202', name: 'Snacks availability audit', category: 'Snacks', reward: 55, minutes: '5–8', distance: 2.4, photos: 3, zone: 'East', expires: 'Sample window: 20 Oct, 17:00', requirements: 'Specified snack section and visible presence of target products.' },
  { id: 'TASK-203', name: 'Premium branded bay audit', category: 'Branded bay', reward: 120, minutes: '12–15', distance: 3.1, photos: 5, zone: 'North', expires: 'Sample window: 21 Oct, 12:00', requirements: 'Full endcap, two placement angles, priority slots, and promotional label.' },
  { id: 'TASK-204', name: 'Category repeat visit', category: 'Beverages', reward: 100, minutes: '10–12', distance: 4.5, photos: 4, zone: 'West', expires: 'Sample window: 21 Oct, 18:00', requirements: 'Matched-store visit with comparable framing and checked shelf positioning.' }
];

export const batches = [
  { id: 'B-01', name: 'South beverage panel', status: 'In field', assigned: 40, complete: 34, due: 4, notStarted: 2 },
  { id: 'B-02', name: 'East grocery repeat', status: 'In field', assigned: 30, complete: 24, due: 3, notStarted: 3 },
  { id: 'B-03', name: 'Branded bay review', status: 'In QA', assigned: 25, complete: 22, due: 3, notStarted: 0 },
  { id: 'B-04', name: 'North assortment', status: 'Awaiting acceptance', assigned: 15, complete: 9, due: 1, notStarted: 5 },
  { id: 'B-05', name: 'West promo check', status: 'Awaiting acceptance', assigned: 10, complete: 5, due: 1, notStarted: 4 }
];
export const workers = Array.from({ length: 18 }, (_, index) => ({ id: `FW-${String(index + 1).padStart(2, '0')}`, name: `Field partner ${String(index + 1).padStart(2, '0')}`, verified: true, active: index < 11, trained: index < 16, completed: 12 + index, accepted: 11 + index, assignment: null }));
export const qualityQueue = Array.from({ length: 8 }, (_, index) => ({ id: `QA-${index + 1}`, reason: index < 3 ? 'Unreadable label' : index < 5 ? 'Incomplete category' : 'Metadata / framing review', storeId: `ST-BLR-${String(115 + index % 6).padStart(3, '0')}`, status: 'Needs review' }));
export const settlement = [{ id: 'INV-DEMO-01', description: 'Accepted beverage observations', quantity: 34, rate: 180, adjustment: 0 }, { id: 'INV-DEMO-02', description: 'Accepted repeat observations', quantity: 24, rate: 160, adjustment: -160 }, { id: 'INV-DEMO-03', description: 'Accepted branded bay checks', quantity: 22, rate: 220, adjustment: 0 }];

export function percentage(numerator, denominator) {
  return denominator > 0 ? numerator * 100 / denominator : null;
}

export function selectCohort(filters = {}) {
  const category = filters.category ?? 'Beverages';
  if (filters.city === 'Hyderabad' || category !== 'Beverages' || filters.simulation === 'offline') return [];
  return stores.filter(store => (!filters.format || filters.format === 'all' || store.format === filters.format) && (!filters.zone || filters.zone === 'all' || store.zone === filters.zone) && (!filters.store || filters.store === 'all' || store.id === filters.store));
}

export function categoryMetrics(filters = {}) {
  const cohort = selectCohort(filters);
  const accepted = cohort.filter(store => store.status === 'accepted');
  const visitIndex = filters.period === '7d' ? 2 : 3;
  const previousIndex = filters.period === '7d' ? 1 : 0;
  const totals = brands.map((brand, index) => accepted.reduce((sum, store) => sum + store.history[visitIndex][index], 0));
  const previous = brands.map((brand, index) => accepted.reduce((sum, store) => sum + store.history[previousIndex][index], 0));
  const denominator = totals.reduce((sum, value) => sum + value, 0);
  const previousDenominator = previous.reduce((sum, value) => sum + value, 0);
  const shares = totals.map(value => percentage(value, denominator));
  const previousShares = filters.period === '90d' ? null : previous.map(value => percentage(value, previousDenominator));
  const brandIndex = Math.max(0, brands.indexOf(filters.brand ?? 'Brand A'));
  const coverage = percentage(accepted.length, cohort.length);
  return {
    cohort, accepted, totals, shares, previousShares, denominator, coverage, visitIndex,
    brandIndex, share: shares[brandIndex], delta: previousShares && shares[brandIndex] !== null ? shares[brandIndex] - previousShares[brandIndex] : null,
    flags: accepted.filter(store => store.flagged),
    evidenceIds: accepted.flatMap(store => store.historyEvidenceIds[visitIndex]),
    medianAgeDays: accepted.length ? visitIndex === 2 ? 13 : 6 : null,
    presence: percentage(accepted.filter(store => store.prioritySkuPresent).length, accepted.length)
  };
}

export function planogramMetrics(cohort = brandedStores) {
  const assessable = cohort.filter(store => store.assessableSlots > 0);
  return {
    count: assessable.length, pass: assessable.filter(store => store.passed).length,
    fail: assessable.filter(store => !store.passed).length,
    passRate: percentage(assessable.filter(store => store.passed).length, assessable.length),
    adherence: percentage(assessable.reduce((sum, store) => sum + store.correctSlots, 0), assessable.reduce((sum, store) => sum + store.assessableSlots, 0)),
    missing: assessable.filter(store => store.exception === 'Missing priority SKU').length,
    deviations: assessable.filter(store => store.exception === 'Placement / facing deviation').length
  };
}

export function agencyMetrics(selectedBatches = batches) {
  return ['assigned', 'complete', 'due', 'notStarted'].reduce((result, key) => ({ ...result, [key]: selectedBatches.reduce((sum, batch) => sum + batch[key], 0) }), {});
}

export function settlementTotal(entries = settlement) {
  return entries.reduce((sum, entry) => sum + entry.quantity * entry.rate + entry.adjustment, 0);
}

export function csvText(rows) {
  return rows.map(row => row.map(cell => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(',')).join('\r\n');
}

export function observationAtVisit(store, visitIndex = 3) {
  if (!store || store.status !== 'accepted' || !store.history[visitIndex]) return store;
  return { ...store, capturedAt: store.capturedAt.replace(captureDate, visits[visitIndex]), evidenceIds: store.historyEvidenceIds[visitIndex], history: [store.history[visitIndex]] };
}

export function skuMetrics(filters = {}) {
  const data = categoryMetrics(filters);
  const rows = [];
  brands.forEach((brand, brandIndex) => {
    const skuCount = brandIndex === 4 ? 1 : 2;
    for (let skuIndex = 0; skuIndex < skuCount; skuIndex++) {
      const quantities = data.accepted.map(store => {
        const quantity = store.history[data.visitIndex][brandIndex];
        const first = brandIndex === 0 && !store.prioritySkuPresent ? quantity : Math.floor(quantity * 0.6);
        return { store, quantity: skuCount === 1 ? quantity : skuIndex === 0 ? first : quantity - first };
      });
      const present = quantities.filter(item => item.quantity > 0);
      rows.push({
        id: brandIndex === 4 ? 'UNKNOWN' : `${String.fromCharCode(65 + brandIndex)}-${String(skuIndex + 1).padStart(2, '0')}`,
        brand,
        name: brandIndex === 4 ? 'Unresolved category products' : `${['Field', 'Mesa', 'Nori', 'Soma'][brandIndex]} ${skuIndex === 0 ? 'Original' : 'Citrus'} · fictional 250 ml`,
        facings: quantities.reduce((sum, item) => sum + item.quantity, 0),
        presentStores: present.length,
        assessableStores: data.accepted.length,
        presence: percentage(present.length, data.accepted.length),
        labelPriceINR: brandIndex === 4 || !present.length ? null : present.reduce((sum, item) => sum + item.store.shelfPriceINR + skuIndex * 2, 0) / present.length,
        promoStores: present.filter(item => item.store.promotion).length,
        confidence: brandIndex === 4 || !present.length ? null : present.reduce((sum, item) => sum + item.store.confidence, 0) / present.length,
        evidenceIds: present.flatMap(item => item.store.historyEvidenceIds[data.visitIndex])
      });
    }
  });
  return rows;
}
