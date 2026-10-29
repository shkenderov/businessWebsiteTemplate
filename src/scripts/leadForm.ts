/**
 * Wires every <form data-lead-form> on the page.
 *
 * With data-endpoint: POSTs the form (Formspree, Web3Forms, your own).
 * Without: builds a plain-text message from the fields and hands it to the
 * phone's SMS app (on touch devices) or copies it to the clipboard (desktop),
 * so the request reaches the owner's phone with no backend at all.
 *
 * Each field's line in the message uses its <label> text. Fields with
 * data-skip are left out (honeypot).
 */

function status(form: HTMLFormElement) {
  return form.querySelector<HTMLElement>('[data-status]');
}

function say(form: HTMLFormElement, msg: string, ok = true) {
  const el = status(form);
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
  el.classList.toggle('text-red-700', !ok);
}

function labelFor(form: HTMLFormElement, field: Element): string {
  const id = field.getAttribute('id');
  const label = id ? form.querySelector<HTMLLabelElement>(`label[for="${id}"]`) : null;
  return (label?.textContent ?? field.getAttribute('name') ?? '').trim().replace(/[:?]$/, '');
}

function buildMessage(form: HTMLFormElement): string {
  const lines: string[] = [];
  const subject = form.dataset.subject;
  if (subject) lines.push(subject);
  const fields = form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, select, textarea');
  fields.forEach((f) => {
    if (!f.name || f.hasAttribute('data-skip') || f.type === 'hidden' || f.type === 'submit') return;
    if (f instanceof HTMLInputElement && f.type === 'checkbox' && !f.checked) return;
    const value = f instanceof HTMLSelectElement ? f.selectedOptions[0]?.text ?? '' : f.value;
    if (!value.trim()) return;
    lines.push(`${labelFor(form, f)}: ${value.trim()}`);
  });
  return lines.join('\n');
}

async function submit(form: HTMLFormElement) {
  if (!form.reportValidity()) return;
  const honeypot = form.querySelector<HTMLInputElement>('input[data-skip]');
  if (honeypot?.value) return; // bot

  const phone = form.dataset.phone ?? '';
  const endpoint = form.dataset.endpoint;
  const btn = form.querySelector<HTMLButtonElement>('button[type=submit]');

  if (endpoint) {
    if (btn) btn.disabled = true;
    try {
      const res = await fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(String(res.status));
      say(form, form.dataset.okText ?? 'Получихме заявката ви. Ще ви потърсим до един работен ден.');
      form.reset();
    } catch {
      say(form, `Заявката не беше изпратена. Позвънете на ${phone} или опитайте отново.`, false);
    } finally {
      if (btn) btn.disabled = false;
    }
    return;
  }

  const text = buildMessage(form);
  const isTouch = matchMedia('(pointer: coarse)').matches;
  if (isTouch) {
    window.location.href = `sms:${phone}?&body=${encodeURIComponent(text)}`;
    say(form, 'Отваряме SMS с попълнена заявка — остава само да натиснете „Изпрати“.');
  } else {
    try { await navigator.clipboard.writeText(text); } catch { /* clipboard may be blocked */ }
    say(form, `Заявката е копирана. Изпратете я по Viber или SMS на ${phone}, или ни позвънете.`);
  }
}

export function wireLeadForms(root: ParentNode = document) {
  root.querySelectorAll<HTMLFormElement>('form[data-lead-form]').forEach((form) => {
    if (form.dataset.wired) return;
    form.dataset.wired = '1';
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      void submit(form);
    });
  });
}
