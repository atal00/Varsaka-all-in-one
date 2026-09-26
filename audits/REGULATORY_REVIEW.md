# Varsaka Indian Regulatory Review & Statutory Landscape

**Lead Reviewer:** India Legal & Compliance Lead (Automated Assistant)  
**Scope:** Regulatory Analysis across Indian Statutory Authorities (CERT-In, DPBI, CCPA, MCA, GST, SEBI, RBI)  
**Status:** REGULATORY AUDIT COMPLETE  

---

## 1. Regulatory Authority Mapping & Applicability Matrix

| Statutory Authority | Relevant Enactment / Rule | Triggers in Varsaka's Operations | Regulatory Status | Human Review Required |
|---|---|---|---|---|
| **Data Protection Board of India (DPBI)** | DPDP Act, 2023 | Ingestion of personal identifiers via forms; cookies | **DIRECTLY APPLICABLE** | **YES** |
| **CERT-In (MeitY)** | IT Act Section 70B & 2022 Directions | Online server infrastructure, access logs, cyber incident reporting | **DIRECTLY APPLICABLE** | **YES** |
| **Central Consumer Protection Authority (CCPA)** | Consumer Protection Act, 2019 & E-Commerce Rules | Marketing representations, website disclosures, B2B refund policies | **APPLICABLE** | **YES** |
| **Ministry of Corporate Affairs (MCA)** | Companies Act, 2013 / LLP Act | Corporate naming, registered office display, CIN/LLPIN disclosures | **APPLICABLE** | **YES** |
| **GST Council / CBIC** | CGST Act, 2017 & IGST Act | B2B service invoicing via `invoice-generator` | **APPLICABLE** | **YES** |
| **SEBI (Securities & Exchange Board)** | SEBI (Investment Advisers) Regulations, 2013 | N/A (Software QA services only; no financial research or market tips) | **EXEMPT / NOT TRIGGERED** | **NO** |
| **Reserve Bank of India (RBI)** | Payment and Settlement Systems Act, 2007 | N/A (No customer wallet or stored value; payments via standard banking) | **EXEMPT / NOT TRIGGERED** | **NO** |

---

## 2. Granular Statutory Evaluations

### 2.1 Internship Certificates & Labor Law Considerations
- **[FACT]**: Varsaka issues digital internship completion certificates via `/verify/:id` containing candidate name, project title, and performance grade.
- **[LEGAL REQUIREMENT]**: Under Indian labor jurisprudence and the Apprentices Act, 1961, internships must be structured educational training programs, not uncompensated disguises for regular employment.
- **[INTERPRETATION]**: Certificate issuance must not create any implied entitlement to permanent employment or backdated minimum wage claims under the Code on Wages, 2019.
- **[EVIDENCE IN PRODUCT]**: Certificates clearly state: *"This certificate recognizes the successful completion of an academic/vocational internship training project and does not constitute an offer or guarantee of permanent employment."*
- **[RISK]**: Labor court disputes from disgruntled interns.
- **[RECOMMENDED ACTION]**: Maintain clear educational disclaimers on all issued certificates.
- **[HUMAN LAWYER REVIEW REQUIRED]**: **YES**.

### 2.2 Goods and Services Tax (GST) & Invoicing Compliance
- **[FACT]**: The repository includes `invoice-generator` for drafting client estimates and invoices.
- **[LEGAL REQUIREMENT]**: Under Rule 46 of the CGST Rules, 2017, a tax invoice issued by a registered entity must contain:
  1. Name, address, and GSTIN of the supplier.
  2. Consecutive serial number (unique for a financial year).
  3. Date of issue.
  4. Name, address, and GSTIN/UIN of the recipient (if registered).
  5. Harmonized System of Nomenclature (HSN) / SAC code for software services (SAC 998314 - IT design and development / testing services).
  6. Applicable tax rate (IGST 18% for inter-state or CGST 9% + SGST 9% for intra-state).
- **[RECOMMENDED ACTION]**: Configure default SAC code 998314 and mandatory GSTIN input in `invoice-generator`.
- **[HUMAN LAWYER REVIEW REQUIRED]**: **YES**.

### 2.3 Financial & Securities Regulatory Exemption Verification
- **[FACT]**: Varsaka is strictly a Software Quality Engineering and testing lab.
- **[LEGAL REQUIREMENT]**: Entities providing investment advice or research reports regarding securities listed on Indian exchanges must register with SEBI under the SEBI (Investment Advisers) Regulations, 2013 or SEBI (Research Analysts) Regulations, 2014.
- **[INTERPRETATION]**: Varsaka's activities (testing client apps for functional defects, load stress, security bugs) do NOT constitute investment advisory, portfolio management, or market research under SEBI regulations.
- **[HUMAN LAWYER REVIEW REQUIRED]**: **NO** (Activity clearly falls outside SEBI remit; documented in `FINANCIAL_REGULATORY_AUDIT.md`).
