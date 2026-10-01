const SUBSCRIPTION_TIERS = {
  FREE: {
    name: 'Free',
    maxClients: 5,
    features: ['basic_notes'],
  },
  BASIC: {
    name: 'Basic',
    maxClients: 25,
    features: ['basic_notes', 'chat'],
  },
  PRO: {
    name: 'Pro',
    maxClients: Infinity,
    features: ['basic_notes', 'advanced_notes', 'chat', 'analytics', 'priority_support'],
  },
};

module.exports = SUBSCRIPTION_TIERS;