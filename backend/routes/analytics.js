const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Session = require('../models/Session');
const Payment = require('../models/Payment');
const { requireEntitlement } = require('../services/entitlementService');

// Protected by the centralized entitlement check
router.get('/dashboard', requireEntitlement('analytics'), async (req, res) => {
  try {
    const therapistId = new mongoose.Types.ObjectId(req.user.id);

    // 1. Total Revenue Aggregation
    const revenueAgg = await Payment.aggregate([
      { $match: { therapistId, status: 'COMPLETED' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
    ]);
    const revenue = revenueAgg[0]?.totalRevenue || 0;

    // 2. Active Clients Count
    const activeClients = await Session.distinct('clientId', {
      therapistId,
      status: { $ne: 'CANCELLED' },
    });
    const clientsCount = activeClients.length;

    // 3. No-Show Rate Aggregation
    const sessionStats = await Session.aggregate([
      { $match: { therapistId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          noShows: {
            $sum: { $cond: [{ $eq: ['$status', 'NO_SHOW'] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          noShowRate: {
            $cond: [
              { $eq: ['$total', 0] },
              0,
              { $round: [{ $multiply: [{ $divide: ['$noShows', '$total'] }, 100] }, 1] },
            ],
          },
        },
      },
    ]);
    const noShowRate = sessionStats[0]?.noShowRate || 0;

    // 4. Monthly/Weekly Revenue Trend for Recharts
    const monthlyTrend = await Payment.aggregate([
      { $match: { therapistId, status: 'COMPLETED' } },
      {
        $group: {
          _id: { $dateToString: { format: '%b %Y', date: '$createdAt' } },
          revenue: { $sum: '$amount' },
        },
      },
      { $sort: { '_id': 1 } },
    ]);

    const chartData = monthlyTrend.map((item) => ({
      month: item._id,
      revenue: item.revenue,
    }));

    res.json({
      revenue,
      clientsCount,
      noShowRate,
      chartData,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;