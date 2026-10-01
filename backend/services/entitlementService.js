const User = require('../models/User');
const SUBSCRIPTION_TIERS = require('../config/subscriptionTiers');

/**
 * Centralized Entitlement Check
 * @param {string} therapistId
 * @param {string} featureKey (e.g., 'analytics', 'advanced_notes')
 * @returns {Promise<boolean>}
 */
async function canAccess(therapistId, featureKey) {
  const therapist = await User.findById(therapistId);
  if (!therapist) return false;

  const tier = therapist.subscriptionTier || 'FREE';
  const tierConfig = SUBSCRIPTION_TIERS[tier];

  if (!tierConfig) return false;
  return tierConfig.features.includes(featureKey);
}

/**
 * Check if therapist can onboard a new client
 * @param {string} therapistId
 * @param {number} currentClientCount
 */
async function canAddClient(therapistId, currentClientCount) {
  const therapist = await User.findById(therapistId);
  if (!therapist) return false;

  const tier = therapist.subscriptionTier || 'FREE';
  const maxAllowed = SUBSCRIPTION_TIERS[tier]?.maxClients || 5;

  return currentClientCount < maxAllowed;
}

/**
 * Express Middleware to protect routes by feature key
 */
function requireEntitlement(featureKey) {
  return async (req, res, next) => {
    try {
      const allowed = await canAccess(req.user.id, featureKey);
      if (!allowed) {
        return res.status(403).json({
          error: `Upgrade required: Your current tier does not include '${featureKey}'.`,
        });
      }
      next();
    } catch (err) {
      res.status(500).json({ error: 'Entitlement check failed' });
    }
  };
}

module.exports = { canAccess, canAddClient, requireEntitlement };