import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import './Services.css';

export default function PerformanceTesting() {
  const navigate = useNavigate();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="svc-page">
      <SEO 
        title="Performance Testing Services | Load & Stress Testing"
        description="Varsaka Labs provides expert performance testing services including load, stress, and spike testing using JMeter and k6 to ensure your app handles thousands of users."
        keywords="performance testing services, load testing company, stress testing, JMeter experts, k6 testing, website performance audit"
      />
      <div className="svc-hero">
        <div className="svc-breadcrumb">
          <a onClick={() => navigate('/')}>Home</a>
          <span>/</span>
          <a onClick={() => navigate('/#services')}>Services</a>
          <span>/</span>
          <span style={{ color: '#fff' }}>Performance Testing</span>
        </div>
        <div className="svc-hero-icon">⚡</div>
        <h1>Performance Testing</h1>
        <p className="svc-hero-sub">We simulate thousands of users hitting your app at once - finding bottlenecks before they find your customers.</p>
        <div className="svc-hero-pills">
          {['Load Testing', 'Stress Testing', 'Soak Testing', 'Spike Testing', 'JMeter', 'k6', 'Gatling'].map(p => (
            <span key={p} className="svc-hero-pill">{p}</span>
          ))}
        </div>
      </div>

      <div className="svc-content">
        <div className="svc-overview">
          <div className="svc-overview-text">
            <h2>What is Performance Testing?</h2>
            <p>Performance testing measures how your application behaves under load. It answers critical questions: How many users can your app handle? Where does it slow down? What happens when traffic spikes unexpectedly?</p>
            <p>At Varsaka Labs, we design realistic traffic simulations based on your actual user patterns to uncover bottlenecks in your code, database, and infrastructure - before your launch or peak season.</p>
            <p>Don't let your biggest traffic day become your worst day. Let us stress-test it first.</p>
          </div>
          <div className="svc-overview-visual">
            <div className="big-icon">⚡</div>
            <div className="svc-stat-row">
              <div className="svc-stat"><strong>10x</strong><span>Throughput Improvement</span></div>
              <div className="svc-stat"><strong>100K+</strong><span>Virtual Users Simulated</span></div>
              <div className="svc-stat"><strong>40%</strong><span>Avg. Response Time Cut</span></div>
            </div>
          </div>
        </div>

        <h2 className="svc-section-title">Types of Performance Testing We Do</h2>
        <p className="svc-section-sub">A complete spectrum of performance validation for your application.</p>
        <div className="svc-features-grid">
          {[
            { icon: '📈', title: 'Load Testing', desc: 'Validate system behavior under expected peak load conditions and verify it meets response time SLAs.' },
            { icon: '💥', title: 'Stress Testing', desc: 'Push the system beyond its limits to find the breaking point and understand failure behavior.' },
            { icon: '🌊', title: 'Soak Testing', desc: 'Run sustained load over hours or days to detect memory leaks and resource degradation over time.' },
            { icon: '⚡', title: 'Spike Testing', desc: 'Simulate sudden, massive traffic spikes (like a flash sale) to see how the system reacts and recovers.' },
            { icon: '📊', title: 'Scalability Testing', desc: 'Determine how the application scales horizontally and vertically with increasing load.' },
            { icon: '🔍', title: 'Bottleneck Identification', desc: 'Pinpoint exact code paths, DB queries, or infrastructure components causing slow response times.' },
          ].map(f => (
            <div key={f.title} className="svc-feature-card">
              <div className="svc-feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="svc-process">
          <h2 className="svc-section-title">Our Performance Testing Process</h2>
          <p className="svc-section-sub">A data-driven methodology from baseline to optimization.</p>
          <div className="svc-steps">
            {[
              { n: '01', title: 'Scope & SLA Definition', desc: 'We define your performance targets: response times, throughput, error rates, and concurrent user goals.' },
              { n: '02', title: 'Workload Modeling', desc: 'We analyze your traffic patterns to create realistic user scenarios and transaction mixes.' },
              { n: '03', title: 'Test Environment Setup', desc: 'We configure a production-like environment and set up monitoring on all system layers.' },
              { n: '04', title: 'Script Development & Execution', desc: 'We build and run realistic load scripts, gradually ramping traffic to simulate real-world conditions.' },
              { n: '05', title: 'Bottleneck Analysis', desc: 'We correlate performance metrics with monitoring data to identify the exact root cause of issues.' },
              { n: '06', title: 'Report & Recommendations', desc: 'A comprehensive report with graphs, findings, and prioritized optimization recommendations.' },
            ].map(s => (
              <div key={s.n} className="svc-step">
                <div className="svc-step-num">{s.n}</div>
                <div className="svc-step-body"><h3>{s.title}</h3><p>{s.desc}</p></div>
              </div>
            ))}
          </div>
        </div>

        <div className="svc-tools">
          <h2 className="svc-section-title">Tools & Technologies</h2>
          <p className="svc-section-sub">Industry-leading performance engineering tools in our arsenal.</p>
          <div className="svc-tools-grid">
            {['Apache JMeter', 'k6', 'Gatling', 'Locust', 'Grafana', 'InfluxDB', 'New Relic', 'Datadog', 'Prometheus', 'AWS CloudWatch', 'BlazeMeter', 'Artillery'].map(t => (
              <span key={t} className="svc-tool-chip">{t}</span>
            ))}
          </div>
        </div>

        <div className="svc-deliverables">
          <h2 className="svc-section-title">What You'll Get</h2>
          <p className="svc-section-sub">Clear, actionable performance insights you can act on immediately.</p>
          <div className="svc-deliverables-list">
            {['Performance Test Plan', 'Load Test Scripts', 'Baseline Performance Report', 'Bottleneck Analysis', 'Real-Time Monitoring Dashboard', 'Optimization Recommendations', 'Stress Test Results', 'Final Performance Certification'].map(d => (
              <div key={d} className="svc-deliverable-item">{d}</div>
            ))}
          </div>
        </div>

        <div className="svc-cta">
          <h2>Don't Let Traffic Crashes Kill Your Launch! ⚡</h2>
          <p>Get a free performance assessment of your application before your next big release or peak season.</p>
          <div className="svc-cta-btns">
            <a href="/#contact" className="svc-btn-white">Get Free Consultation</a>
            <a href="/#services" className="svc-btn-outline">Explore Other Services</a>
          </div>
        </div>
      </div>
    </div>
  );
}
