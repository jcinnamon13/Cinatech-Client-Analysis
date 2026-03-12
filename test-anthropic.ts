import Anthropic from '@anthropic-ai/sdk';
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
async function main() {
  try {
    const list = await anthropic.models.list();
    console.log(list.data.map(m => m.id));
  } catch (e) {
    console.error("Failed to list models:", e.message);
  }
}
main();
