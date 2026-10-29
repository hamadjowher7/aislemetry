(() => {
  const stage = document.querySelector('#photo-stage');
  if (!stage) return;
  const boxes = [...stage.querySelectorAll('.photo-box')];
  const steps = [...document.querySelectorAll('[data-step]')];
  const play = document.querySelector('#walkthrough-play');
  const replay = document.querySelector('#walkthrough-replay');
  const beam = document.querySelector('#scan-beam');
  const status = document.querySelector('#walkthrough-status');
  const motionToggle = document.querySelector('#walkthrough-motion');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  motionToggle.checked = !motionPreference.matches;
  const animator = window.gsap;
  const records = {
    suntory: {
      name: 'Suntory / Barley tea', size: '680 ml · matched manually to the visible shelf label',
      status: 'Manually identified', facings: 3, share: '60%', review: false,
      note: 'These three selected bottles are grouped as the same 680 ml barley-tea SKU using the visible packaging and shelf label. This is a manual reading, not a model prediction.'
    },
    amber: {
      name: 'Healthworks / Amber drink', size: 'Exact variant and pack size unconfirmed',
      status: 'SKU needs review', facings: 1, share: '40%', review: true,
      note: 'One selected amber drink is marked here. The brand is a manual visual reading; the exact variant and size need catalogue review. The 40% combines both selected Healthworks packs.'
    },
    dark: {
      name: 'Healthworks / Dark drink', size: 'Exact variant and pack size unconfirmed',
      status: 'SKU needs review', facings: 1, share: '40%', review: true,
      note: 'One selected dark drink is marked here. Its exact SKU is not asserted. Keep it in the selected pack count while reviewing the variant and size against a catalogue.'
    }
  };
  const stages = [
    { mode: 'capture', kicker: '01 / EVIDENCE', title: 'Start with the shelf photo.',
      description: 'A real supermarket photograph is the evidence. For this teaching example, five packs have been selected manually. A production audit starts by defining complete category coverage.', status: 'Start with the photo' },
    { mode: 'locate', kicker: '02 / LOCATE', title: 'Locate the selected packs.',
      description: 'The scan reveals five manually placed boxes. Detection in a working AI pipeline locates product packs; a box alone does not establish the exact SKU.', status: 'Reveal the manual annotations' },
    { mode: 'identify', kicker: '03 / IDENTIFY', title: 'Group matches. Flag uncertainty.',
      description: 'Three selected Suntory bottles match the visible 680 ml barley-tea label. The two Healthworks drinks still need exact variant and size confirmation. Select a box to inspect its manual record.', status: 'Inspect identities and review flags' },
    { mode: 'measure', kicker: '04 / MEASURE', title: 'Read the counts in context.',
      description: 'Five selected packs give us one manually identified SKU and two product groups to review. Suntory accounts for three of the five selected packs. This sample is not a full-category shelf audit.', status: '5 selected packs · sample share 60%' }
  ];
  let currentStage = 3;
  let timeline = null;
  let playing = false;
  const counts = { facings: 0, skus: 0, share: 0 };
  const metrics = {
    facings: document.querySelector('#walkthrough-facings'),
    skus: document.querySelector('#walkthrough-skus'),
    share: document.querySelector('#walkthrough-share')
  };
  function drawCounts() {
    metrics.facings.textContent = Math.round(counts.facings);
    metrics.skus.textContent = Math.round(counts.skus);
    metrics.share.textContent = Math.round(counts.share) + '%';
  }
  function renderStage(index, countImmediately = true) {
    currentStage = index;
    const content = stages[index];
    stage.dataset.mode = content.mode;
    stage.dataset.animation = motionToggle.checked ? 'on' : 'off';
    document.querySelector('#stage-kicker').textContent = content.kicker;
    document.querySelector('#stage-title').textContent = content.title;
    document.querySelector('#stage-description').textContent = content.description;
    status.textContent = `Step ${index + 1} of 4 · ${content.status}`;
    steps.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    boxes.forEach(button => {
      button.hidden = index === 0;
      button.disabled = index < 2;
    });
    document.querySelector('.photo-record').hidden = index < 2;
    beam.hidden = true;
    if (index === 3 && countImmediately) {
      Object.assign(counts, { facings: 5, skus: 1, share: 60 });
      drawCounts();
    } else if (index < 3) {
      Object.values(metrics).forEach(element => { element.textContent = '—'; });
    }
  }
  function idleLabel() {
    return motionToggle.checked ? 'Play walkthrough' : 'Show walkthrough result';
  }
  function stop() {
    if (timeline) timeline.kill();
    timeline = null;
    playing = false;
    beam.hidden = true;
    if (animator) animator.set([beam, ...boxes], { clearProps: 'transform,opacity,visibility' });
    play.textContent = idleLabel();
  }
  function pause() {
    if (!timeline || !playing) return;
    timeline.pause();
    playing = false;
    play.textContent = 'Resume walkthrough';
    status.textContent = `Paused · Step ${currentStage + 1} of 4`;
  }
  function start() {
    stop();
    if (!motionToggle.checked || !animator) {
      renderStage(3);
      status.textContent = !motionToggle.checked
        ? 'Result shown without motion. You can select each stage.'
        : 'Result shown. You can select each stage.';
      return;
    }
    renderStage(0);
    playing = true;
    play.textContent = 'Pause walkthrough';
    timeline = animator.timeline({ onComplete() {
      playing = false;
      play.textContent = 'Play again';
      status.textContent = 'Walkthrough complete · manual teaching sample';
    } });
    timeline.to({}, { duration: 0.9 })
      .call(() => { renderStage(1); beam.hidden = false; })
      .fromTo(beam, { y: 0, autoAlpha: 0 }, { y: () => stage.clientHeight - 3, autoAlpha: 1, duration: 2.4, ease: 'none' })
      .fromTo(boxes, { autoAlpha: 0, scale: 0.95 }, { autoAlpha: 1, scale: 1, duration: 0.45, stagger: 0.16, ease: 'power2.out' }, '<0.25')
      .to(beam, { autoAlpha: 0, duration: 0.2 })
      .call(() => renderStage(2))
      .to({}, { duration: 2.3 })
      .call(() => {
        renderStage(3, false);
        Object.assign(counts, { facings: 0, skus: 0, share: 0 });
        drawCounts();
      })
      .to(counts, { facings: 5, skus: 1, share: 60, duration: 1.2, ease: 'power1.out', onUpdate: drawCounts });
  }
  boxes.forEach(button => button.addEventListener('click', () => {
    if (playing || timeline) stop();
    renderStage(Math.max(currentStage, 2));
    const record = records[button.dataset.record];
    boxes.forEach(box => box.setAttribute('aria-pressed', String(box === button)));
    document.querySelector('#record-heading').textContent = record.name;
    document.querySelector('#record-size').textContent = record.size;
    const recordStatus = document.querySelector('#record-status');
    recordStatus.textContent = record.status;
    recordStatus.classList.toggle('review', record.review);
    document.querySelector('#record-facings').textContent = record.facings;
    document.querySelector('#record-share').textContent = record.share;
    document.querySelector('#record-evidence').textContent = 'Annotation ' + button.dataset.annotation.padStart(2, '0');
    document.querySelector('#record-note').textContent = record.note;
  }));
  steps.forEach(button => button.addEventListener('click', () => {
    stop();
    renderStage(Number(button.dataset.step));
  }));
  play.addEventListener('click', () => {
    if (playing) pause();
    else if (timeline && timeline.progress() < 1) {
      playing = true;
      play.textContent = 'Pause walkthrough';
      status.textContent = `Step ${currentStage + 1} of 4 · ${stages[currentStage].status}`;
      timeline.resume();
    } else start();
  });
  replay.addEventListener('click', start);
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  motionPreference.addEventListener('change', () => {
    motionToggle.checked = !motionPreference.matches;
    stop();
    renderStage(3);
    if (motionPreference.matches) status.textContent = 'Motion reduced to match your device preference.';
  });
  motionToggle.addEventListener('change', () => {
    stop();
    renderStage(motionToggle.checked ? 0 : 3);
    status.textContent = motionToggle.checked
      ? 'Animation enabled by your choice. Select Play walkthrough.'
      : 'Animation off. You can still select each stage and pack.';
  });
  document.querySelector('#walkthrough-controls').hidden = false;
  document.querySelector('#walkthrough-steps').hidden = false;
  play.textContent = idleLabel();
  renderStage(motionToggle.checked ? 0 : 3);
})();
