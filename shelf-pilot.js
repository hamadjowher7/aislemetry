document.querySelector('#pilot-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const category = document.querySelector('#pilot-category').value.trim();
  const question = document.querySelector('#pilot-question').value.trim();
  if (!category || !question) {
    document.querySelector('#pilot-status').textContent = 'Enter a category and measurement question to create your brief.';
    return;
  }
  document.querySelector('#pilot-brief').value = `Aislemetry shelf-analysis pilot\n\nCategory: ${category}\nBusiness question: ${question}\n\nInputs to agree: representative shelf photos; SKU catalogue with variants, sizes, and reference images.\nMeasures to agree: exact SKU identification, visible facing counts, facings-based share of shelf, and review rate.\nValidation: compare against manually labelled shelves; report small-pack results separately.\nNext step: agree sample scope and success criteria with the Aislemetry team.`;
  document.querySelector('#brief-result').hidden = false;
  document.querySelector('#pilot-status').textContent = 'Brief ready. Copy it to share with your Aislemetry contact.';
  document.querySelector('#pilot-brief').focus();
});
document.querySelector('#copy-brief').addEventListener('click', async () => {
  const brief = document.querySelector('#pilot-brief');
  try {
    await navigator.clipboard.writeText(brief.value);
    document.querySelector('#pilot-status').textContent = 'Pilot brief copied.';
  } catch {
    brief.focus();
    brief.select();
    document.querySelector('#pilot-status').textContent = 'Select and copy the brief above using your browser’s Copy command.';
  }
});
