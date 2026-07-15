import React from 'react';
import { Card } from '@/components/ui/Card';
import { Shield, Layers, LayoutTemplate, Calculator, Zap, Lock, ShieldCheck, FileText } from 'lucide-react';
import styles from '@/components/ui/ui.module.css';

export default function FeaturesPage() {
  return (
    <div style={{ paddingBottom: '6rem' }}>
      
      {/* Full-width Hero Section */}
      <section style={{ textAlign: 'center', marginBottom: '6rem', paddingTop: '6rem', paddingBottom: '8rem', position: 'relative' }}>
        
        {/* Floating Decorative Elements (Left) */}
        <div className={styles.floatingDecor} style={{ top: '10%', left: '5%', animationDelay: '0.5s' }}>
          <div style={{ background: '#ecfdf5', padding: '0.75rem', borderRadius: '12px' }}><ShieldCheck size={24} color="#10b981" /></div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Security</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>Bank-grade</p>
          </div>
        </div>
        
        <div className={styles.floatingDecor} style={{ top: '65%', left: '10%', animationDelay: '2s' }}>
          <div style={{ background: '#eff6ff', padding: '0.75rem', borderRadius: '12px' }}><Calculator size={24} color="#3b82f6" /></div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Tax Engine</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Automated Math</p>
          </div>
        </div>

        {/* Floating Decorative Elements (Right) */}
        <div className={styles.floatingDecor} style={{ top: '15%', right: '5%', animationDelay: '1.2s' }}>
          <div style={{ background: '#fef2f2', padding: '0.75rem', borderRadius: '12px' }}><LayoutTemplate size={24} color="#ef4444" /></div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Templates</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Real-time Swap</p>
          </div>
        </div>

        <div className={styles.floatingDecor} style={{ top: '70%', right: '10%', animationDelay: '3.5s' }}>
          <div style={{ background: '#f5f3ff', padding: '0.75rem', borderRadius: '12px' }}><FileText size={24} color="#8b5cf6" /></div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Export Speed</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#8b5cf6' }}>&lt; 1s</p>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 20, maxWidth: '1000px', margin: '0 auto', padding: '0 2rem' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '-0.04em' }}>
            Everything you need to bill like a pro.
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto' }}>
            Explore the deep architectural features that make INVOICER. the fastest, most reliable billing platform on the market.
          </p>
        </div>
      </section>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6rem', maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
        
        {/* Feature 1 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4rem', alignItems: 'center' }}>
          <div style={{ flex: '1 1 400px' }}>
            <div style={{ background: 'rgba(37, 99, 235, 0.1)', width: '60px', height: '60px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Calculator size={28} color="var(--accent-primary)" />
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '-0.025em' }}>Flawless Dual-Tax Engine</h2>
            <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Our proprietary calculation engine independently calculates both Tax 1 and Tax 2 atop a post-discount subtotal. You never have to worry about rounding errors or sequential calculation faults ever again.
            </p>
          </div>
          <Card className="float-animation" style={{ flex: '1 1 400px', padding: '3rem', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '100%', background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-deep)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                <span>Subtotal</span><span>$1,000.00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', color: '#ef4444' }}>
                <span>Discount (10%)</span><span>-$100.00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                <span>State Tax (5%)</span><span>$45.00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                <span>City Tax (2%)</span><span>$18.00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0 0 0', marginTop: '0.5rem', borderTop: '2px solid #e2e8f0', fontWeight: 'bold' }}>
                <span>Grand Total</span><span style={{ color: 'var(--accent-primary)' }}>$963.00</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Feature 2 */}
        <div style={{ display: 'flex', flexWrap: 'wrap-reverse', gap: '4rem', alignItems: 'center' }}>
          <Card className="float-animation" style={{ flex: '1 1 400px', padding: '3rem', minHeight: '300px', background: 'var(--accent-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <h3 style={{ fontSize: '3rem', fontWeight: 800 }}>Spatial UI<br/>Engine</h3>
          </Card>
          <div style={{ flex: '1 1 400px' }}>
            <div style={{ background: 'rgba(37, 99, 235, 0.1)', width: '60px', height: '60px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <LayoutTemplate size={28} color="var(--accent-primary)" />
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '-0.025em' }}>Real-time Template Switching</h2>
            <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Generate highly polished, completely distinct visual layouts with a single click. Shift from a sleek minimal structure to a heavy, modern accented block aesthetic instantly.
            </p>
          </div>
        </div>

        {/* Feature 3 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4rem', alignItems: 'center' }}>
          <div style={{ flex: '1 1 400px' }}>
            <div style={{ background: 'rgba(37, 99, 235, 0.1)', width: '60px', height: '60px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Lock size={28} color="var(--accent-primary)" />
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '-0.025em' }}>Cryptographic Data Isolation</h2>
            <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Our multi-tenant architecture is built on Prisma and NextAuth. Every database interaction enforces strict `userId` constraints. Your client data is invisible to everyone else on the platform.
            </p>
          </div>
          <Card className="float-animation" style={{ flex: '1 1 400px', padding: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
             <Shield size={64} color="var(--text-primary)" />
             <Shield size={64} color="var(--accent-primary)" style={{ opacity: 0.5 }} />
             <Shield size={64} color="var(--text-secondary)" style={{ opacity: 0.2 }} />
          </Card>
        </div>

        {/* Feature 4 */}
        <div style={{ display: 'flex', flexWrap: 'wrap-reverse', gap: '4rem', alignItems: 'center' }}>
          <Card className="float-animation" style={{ flex: '1 1 400px', padding: '3rem', minHeight: '300px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
             <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
               <div style={{ background: '#ef4444', color: 'white', padding: '1rem', borderRadius: '12px', fontWeight: 800, fontSize: '1.5rem' }}>PDF</div>
               <div style={{ background: 'var(--accent-primary)', color: 'white', padding: '1rem', borderRadius: '12px', fontWeight: 800, fontSize: '1.5rem' }}>CSV</div>
             </div>
             <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Instant High-Res Render</p>
          </Card>
          <div style={{ flex: '1 1 400px' }}>
            <div style={{ background: 'rgba(37, 99, 235, 0.1)', width: '60px', height: '60px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Zap size={28} color="var(--accent-primary)" />
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '-0.025em' }}>Lightning Fast Export</h2>
            <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Export your meticulously crafted invoices into high-resolution PDFs instantly. Built for speed, our custom rendering engine ensures your documents look absolutely identical on screen and in print.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
