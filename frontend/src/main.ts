import './style.css';
import grievances from './grievenies.json';

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1556287869348348016/S63jYG_-PfFsC79MG3I_XV3w1zOccPL0pJDiE69BruWR_zuZK_jgZoBSHCaGtHIt7IvB';

const petitionStatus = document.getElementById('petition-status');
const petitionForm = document.getElementById('petition-form');
const quotesGrid = document.getElementById('quotes-grid');
const namesTicker = document.getElementById('names-ticker');

const visibleGrievanceCount = 4;
const grievanceMessages = grievances.messages.filter(
  (grievance) => grievance.message.trim().toLowerCase() !== 'no reason given'
);
let grievanceOffset = 0;

const formatName = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => (part === part.toUpperCase() ? part : `${part[0].toUpperCase()}${part.slice(1).toLowerCase()}`))
    .join(' ');

if (namesTicker) {
  const tickerNames = grievanceMessages
    .filter((grievance) => grievance.name.trim().toLowerCase() !== 'anonymous')
    .map((grievance) => formatName(grievance.name));
  namesTicker.setAttribute('aria-label', `People speaking out: ${tickerNames.join(', ')}`);

  const tickerTrack = document.createElement('div');
  tickerTrack.className = 'names-ticker-track';

  for (let copy = 0; copy < 2; copy += 1) {
    const names = document.createElement('span');
    names.className = 'names-ticker-copy';
    names.setAttribute('aria-hidden', copy === 1 ? 'true' : 'false');
    names.textContent = `${tickerNames.join('  •  ')}  •  `;
    tickerTrack.append(names);
  }

  namesTicker.append(tickerTrack);
}

const renderGrievances = () => {
  if (!quotesGrid) {
    return;
  }

  quotesGrid.replaceChildren();

  for (let index = 0; index < visibleGrievanceCount; index += 1) {
    const grievance = grievanceMessages[(grievanceOffset + index) % grievanceMessages.length];
    const card = document.createElement('blockquote');
    card.className = 'quote-card';

    const message = document.createElement('p');
    message.textContent = `“${grievance.message}”`;

    const author = document.createElement('cite');
    author.textContent = formatName(grievance.name);

    card.style.animationDelay = `${index * 55}ms`;
    card.append(message, author);
    quotesGrid.append(card);
  }
};

renderGrievances();

if (grievanceMessages.length > visibleGrievanceCount) {
  window.setInterval(() => {
    grievanceOffset = (grievanceOffset + visibleGrievanceCount) % grievanceMessages.length;
    renderGrievances();
  }, 5000);
}

if (petitionForm && petitionStatus) {
  petitionForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    const name = (formData.get('name') as string | null)?.trim() || 'Anonymous martyr';
    const department = (formData.get('department') as string | null)?.trim() || 'Unknown department';
    const reason = (formData.get('reason') as string | null)?.trim() || 'No reason given';
    const issues = formData.getAll('issues').map((value) => String(value)).join(', ') || 'None selected';

    const payload = {
      content: 'New meal deal grievance submitted',
      embeds: [
        {
          title: 'Churchill meal deal complaint',
          color: 15158332,
          fields: [
            { name: 'Name', value: name, inline: true },
            { name: 'Department', value: department, inline: true },
            { name: 'Issues', value: issues, inline: false },
            { name: 'Why this matters', value: reason, inline: false }
          ],
          timestamp: new Date().toISOString()
        }
      ]
    };

    try {
      const response = await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Webhook request failed with status ${response.status}`);
      }

      petitionStatus.textContent = `${name}, your complaint has been logged. Thank you!`;
      form.reset();
    } catch (error) {
      console.error(error);
      petitionStatus.textContent = 'The webhook failed, so the complaint has been filed in the “probably not delivered” folder instead.';
    }
  });
}
