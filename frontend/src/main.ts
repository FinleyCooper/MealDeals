import './style.css';

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1556287869348348016/S63jYG_-PfFsC79MG3I_XV3w1zOccPL0pJDiE69BruWR_zuZK_jgZoBSHCaGtHIt7IvB';

const petitionStatus = document.getElementById('petition-status');
const petitionForm = document.getElementById('petition-form');

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
