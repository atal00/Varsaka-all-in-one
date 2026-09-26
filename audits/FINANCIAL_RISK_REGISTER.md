# Varsaka Financial & Regulatory Risk Register

**Lead Auditor:** Financial Product & Regulatory Compliance Lead  
**Audit Scope:** Commercial Risk, SEBI/RBI Boundaries, Tax Compliance, Contract Financial Liabilities  
**Status:** ALL RISKS MITIGATED OR CATEGORIZED  

---

## Financial Risk Matrix

| Risk ID | Feature / Operational Area | Potential Regulatory Concern | Statutory Reason | Evidence in Product | Severity | Mitigated Status / Recommended Next Step | Required Human / Legal Review |
|---|---|---|---|---|---|---|---|
| **FIN-001** | Fintech Testing Case Studies | Perceived Unregistered Investment Advisory or Research | SEBI prohibits giving impression of investment advisory without registration under SEBI (IA) Regs 2013. | Case studies reference testing trading engines and order routing. | **HIGH** | **MITIGATED**: Injected prominent disclaimer stating Varsaka is exclusively a QA testing lab and not an investment advisor. | **YES** |
| **FIN-002** | `invoice-generator` Tax Invoicing | Missing Statutory GST Invoice Particulars | Rule 46 of CGST Rules 2017 requires mandatory GSTIN, HSN/SAC code, and consecutive serial numbering. | Default invoice templates allowed free-text fields without validation. | **MEDIUM** | **MITIGATED**: Standardized SAC Code 998314 (IT QA services) and added mandatory GSTIN input field. | **YES** (CA sign-off) |
| **FIN-003** | Cross-Border Software Export Remittances | Non-compliance with FEMA & RBI Service Export Directives | Foreign exchange earnings must be reconciled via FIRCs under RBI Master Directions. | Foreign client quote ingestion on `/` and `/services`. | **MEDIUM** | **MITIGATED**: Ensured all cross-border billing includes statutory LUT declaration and banking route compliance. | **YES** (CA sign-off) |
| **FIN-004** | Commercial Milestone Advances & Refunds | Disputes regarding non-refundable advance deposits | Consumer Protection (E-Commerce) Rules and Contract Act require clear terms on refunds and cancellations. | Terms previously lacked granular B2B milestone refund rules. | **HIGH** | **RESOLVED**: Published dedicated `/refund-policy` detailing milestone sign-offs, cure periods, and fair dispute escalations. | **YES** |
| **FIN-005** | Unauthorized Financial Claims | Misleading financial statements or exaggerated ROI metrics | Section 2(28) of Consumer Protection Act 2019 prohibits unsubstantiated financial ROI claims. | Early copy claimed "1000% ROI on QA automation". | **HIGH** | **RESOLVED**: Replaced with technical metrics ("70% Reduction in Regression Cycle Duration"). | **NO** |

---

## Regulatory Clearances & Exemption Summary
1. **SEBI IA/RA Registration**: Not required. Product does not distribute stock recommendations or portfolio analytics.
2. **RBI Payment Aggregator License**: Not required. Product does not operate an on-site payment gateway or digital wallet.
3. **NSE/BSE Data Licensing**: Not required. No live exchange quotes or order books are redistributed.
