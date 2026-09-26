# Varsaka Financial & Market Regulatory Comprehensive Audit

**Lead Auditor:** Financial Product & Regulatory Compliance Lead  
**Regulatory Frameworks Evaluated:**
- Securities and Exchange Board of India (SEBI) Act, 1992
- SEBI (Investment Advisers) Regulations, 2013 (IA Regulations)
- SEBI (Research Analysts) Regulations, 2014 (RA Regulations)
- SEBI Circulars on Financial Influencers / Unregistered Advisory Platforms
- Reserve Bank of India (RBI) Payment and Settlement Systems Act, 2007
- Foreign Exchange Management Act, 1999 (FEMA) for cross-border software export billing  

---

## 1. Scope & Operational Boundary Assessment

### 1.1 Direct Operational Determination
A thorough review of the entire codebase (`varsaka-react`, `varsaka-admin`, `varsaka-blogs`, `invoice-generator`, and SQL tables) was conducted to classify every active feature against financial regulatory thresholds:

| Activity / Feature | Product Status | Applicable Regulation | Risk / Classification |
|---|---|---|---|
| **Displays Stock/Market Quotes or Feeds** | **NO** | NSE/BSE Market Data Policy | Unregulated (No market feeds used) |
| **Generates Stock/Crypto Recommendations** | **NO** | SEBI IA / RA Regulations | Unregulated (No trade recommendations) |
| **Provides Personalized Financial Advice** | **NO** | SEBI (Investment Advisers) Regs | Unregulated (No advice provided) |
| **Executes Trades or Connects to Brokers** | **NO** | SEBI Stock Broker Regulations | Unregulated (No trading mechanics) |
| **Handles Customer Investment Funds** | **NO** | RBI / Banking Regulation Act | Unregulated (No fund handling) |
| **Commercial B2B Service Billing** | **YES** | GST / FEMA (for cross-border) | Regulated (Standard commercial tax compliance) |
| **Software Quality Engineering Services** | **YES** | Information Technology Act | Regulated (Standard IT services) |

---

## 2. SEBI Compliance & Disclaimer Verification

### 2.1 Absence of Unregistered Advisory or Research
- **[FACT]**: Varsaka Labs is exclusively an enterprise software quality engineering, test automation, and technical training laboratory. It does NOT distribute financial tips, stock analysis, or investment strategies.
- **[STATUTORY WARNING]**: SEBI strictly prohibits any entity from providing investment advice, price targets, or algorithmic trading strategies without obtaining an Investment Adviser (IA) or Research Analyst (RA) registration.
- **[FINDING]**: Varsaka Labs makes **zero** claims of being a SEBI-registered entity. To avoid any ambiguity with potential fintech clients who contract Varsaka to test their trading platforms, the website features clear technical disclaimers.

### 2.2 Disclaimer for Fintech Testing Case Studies
When Varsaka publishes case studies regarding testing financial, banking, or trading software (e.g. testing algorithmic order execution latency or banking security):
- **Mandatory Disclaimer**:
  > *"Varsaka Labs provides independent software quality engineering, automated testing, and security assessment services. Varsaka Labs is NOT a SEBI-registered Investment Adviser, Research Analyst, Stock Broker, or Portfolio Manager. Case studies, technical blogs, and performance benchmarks demonstrate software testing capabilities and do NOT constitute investment advice, financial research, or recommendations to buy/sell any security."*

---

## 3. Cross-Border Billing & FEMA / RBI Compliance
- **Invoicing Foreign Clients**: Under the Foreign Exchange Management Act (FEMA), 1999 and RBI Master Directions on Export of Goods and Services, software testing services exported to foreign clients qualify as export of services (zero-rated under Section 16 of the IGST Act, 2017).
- **Mandatory Compliance**:
  1. Inward remittances must be received through authorized banking channels (AD Category-I banks) in convertible foreign exchange.
  2. Electronic Foreign Inward Remittance Certificates (e-FIRC) or Foreign Inward Remittance Statements (FIRS) must be retained on file.
  3. Ensure active Letter of Undertaking (LUT) is filed on the GST portal annually for zero-rated service exports.
- **[HUMAN LAWYER / CHARTERED ACCOUNTANT REVIEW REQUIRED]**: **YES**.
