require('dotenv').config();
const { App } = require('@slack/bolt');
const { randomUUID } = require('crypto');
const express = require('express');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

// Express app for HTTP routes
const expressApp = express();
expressApp.use(express.json());

// Track claimed card timestamps
let claimedCards = new Set();

// Store card data for editing (timestamp -> { title, desc })
let cardData = new Map();

// Channel mapping for tag routing
const channelMap = {
  'python': '#help-python',
  'javascript': '#help-javascript',
  'general': '#help-general'
};

// Create card function that returns Slack Block Kit JSON
function createCard(title, desc, zoomLink) {
  return {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${title}* (unclaimed)\n${desc}\nZoom: ${zoomLink}`
        }
      },
      {
        type: 'divider'
      }
    ]
  };
}

// POST route for posting cards to Slack
expressApp.post('/api/slack/post-card', async (req, res) => {
  try {
    const { title, desc, primaryTag } = req.body;
    
    // Generate zoom link
    const zoomLink = `https://meet.jit.si/bugbuddy-${randomUUID()}`;
    
    // Determine channel based on primaryTag using channelMap
    const channel = channelMap[primaryTag] || '#help-general';
    
    // Post message to Slack
    const result = await app.client.chat.postMessage({
      channel: channel,
      text: `${title} - ${desc}`, // Adding text for accessibility
      ...createCard(title, desc, zoomLink)
    });
    
    // Store card data for future editing
    if (result.ts) {
      cardData.set(result.ts, { title, desc });
    }
    
    res.json({ zoomLink, channel });
  } catch (error) {
    console.error('Error posting card:', error);
    res.status(500).json({ error: 'Failed to post card' });
  }
});

// Respond to mentions
app.event('app_mention', async ({ event, say }) => {
  await say(`Hello, <@${event.user}>! You mentioned me!`);
});

// Respond to direct messages
app.message('test', async ({ message, say }) => {
  await say(`Hello, <@${message.user}>! You said 'test'!`);
});

// Add a simple hello command
app.message('hello', async ({ message, say }) => {
  await say(`Hi there, <@${message.user}>! 👋`);
});

// Listen for reaction events to handle card claiming
app.event('reaction_added', async ({ event, say, client }) => {
  // Check if the reaction is a wave (👋)
  if (event.reaction !== 'wave') {
    return;
  }
  
  const cardTimestamp = event.item.ts;
  
  // Check if this card is already claimed
  if (claimedCards.has(cardTimestamp)) {
    return;
  }
  
  // Mark this card as claimed
  claimedCards.add(cardTimestamp);
  
  // Generate a unique Zoom link for the claimer
  const zoomLink = `https://meet.jit.si/bugbuddy-${randomUUID()}`;
  
  // Get the original card data
  const originalCard = cardData.get(cardTimestamp);
  const title = originalCard ? originalCard.title : 'Card';
  
  // Edit the original card message to show claimed status
  try {
    await client.chat.update({
      channel: event.item.channel,
      ts: cardTimestamp,
      text: `*${title}* ✔ Claimed by <@${event.user}>`
    });
  } catch (error) {
    console.error('Error updating card message:', error);
  }
  
  // Send DM to the claimer with the Zoom link
  try {
    await client.chat.postMessage({
      channel: event.user,
      text: `Your Zoom link: ${zoomLink}`
    });
  } catch (error) {
    console.error('Error sending DM to claimer:', error);
  }
  
  // Notify the channel that the card has been claimed
  try {
    await client.chat.postMessage({
      channel: event.item.channel,
      thread_ts: cardTimestamp,
      text: `Claimed by <@${event.user}>`
    });
  } catch (error) {
    console.error('Error posting claim notification:', error);
  }
});

(async () => {
  // Start the Express server
  const PORT = process.env.PORT || 3000;
  expressApp.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
  });
  
  // Start the Slack app
  await app.start();
  console.log('Bolt app is running!');
})();