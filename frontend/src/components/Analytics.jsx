import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function AnalyticsDashboard() {
  const [data, setData] = useState({
    revenue: 0,
    clientsCount: 0,
    noShowRate: 0,
    chartData: [],
  });
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics/dashboard', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        if (res.status === 403) {
          setIsLocked(true);
          throw new Error('Upgrade required');
        }
        return res.json();
      })
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: '24px' }}>Loading analytics...</div>;

  // Day 6 Requirement: Centralized Entitlement Gate
  if (isLocked) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 24px', fontFamily: 'sans-serif' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
        <h2>Analytics is a Pro Feature</h2>
        <p style={{ color: '#6B7280', maxWidth: '450px', margin: '0 auto 24px' }}>
          Real-time revenue tracking, client engagement, and no-show rate analytics require a <strong>Pro</strong> subscription.
        </p>
        <button
          style={{
            backgroundColor: '#4F46E5',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
          onClick={() => alert('Redirect to subscription upgrade...')}
        >
          Upgrade to Pro
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif' }}>
      <h2>Therapist Analytics</h2>

      {/* 3 Metric Cards */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
        {/* Revenue Card */}
        <div style={cardStyle}>
          <div style={labelStyle}>Revenue</div>
          <div style={valueStyle}>₹{Number(data.revenue || 0).toLocaleString('en-IN')}</div>
        </div>

        {/* Clients Card */}
        <div style={cardStyle}>
          <div style={labelStyle}>Clients</div>
          <div style={valueStyle}>{data.clientsCount || 0}</div>
        </div>

        {/* No-show Card */}
        <div style={cardStyle}>
          <div style={labelStyle}>No-show</div>
          <div style={valueStyle}>{data.noShowRate || 0}%</div>
        </div>
      </div>

      {/* Simple Recharts Graph */}
      <div style={{ ...cardStyle, width: '100%', height: '320px', minWidth: '300px' }}>
        <h3 style={{ margin: '0 0 16px 0' }}>Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data.chartData || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(val) => `₹${val}`} />
            <Bar dataKey="revenue" fill="#4F46E5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const cardStyle = {
  border: '1px solid #E5E7EB',
  borderRadius: '8px',
  padding: '16px 24px',
  background: '#56aafd',
  minWidth: '180px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
};

const labelStyle = { color: '#6B7280', fontSize: '14px', marginBottom: '8px' };
const valueStyle = { fontSize: '24px', fontWeight: 'bold', color: '#111827' };