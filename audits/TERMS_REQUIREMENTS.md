# Varsaka Terms of Service Statutory & Contractual Requirements

**Lead Reviewer:** India Legal & Compliance Lead (Automated Assistant)  
**Governing Jurisprudence:** Indian Contract Act, 1872; Information Technology Act, 2000; Arbitration and Conciliation Act, 1996  
**Classification:** Pre-Counsel Legal Draft Analysis  

---

## 1. Essential Contractual Foundations

### 1.1 Electronic Contract Validity (IT Act Section 10A)
- **[FACT]**: Users engage with Varsaka by browsing the website, submitting quote requests, and entering mutual NDAs.
- **[LEGAL REQUIREMENT]**: Under Section 10A of the Information Technology Act, 2000, contracts formed through electronic records and communication are legally valid and enforceable in India.
- **[INTERPRETATION]**: Assent captured electronically via checkboxes and IP/timestamp logging provides admissible evidence under Section 65B of the Indian Evidence Act, 1872 (now Bharatiya Sakshya Adhiniyam, 2023).
- **[HUMAN LAWYER REVIEW REQUIRED]**: **YES**.

---

## 2. Key Terms Provisions & Statutory Alignment

### 2.1 Limitation of Liability (Section 73 & 74, Indian Contract Act)
- **[FACT]**: Varsaka's Terms of Service state that Varsaka's total cumulative liability for any breach or defect shall be capped at the fees paid by the client in the 3 months preceding the event.
- **[LEGAL REQUIREMENT]**: Sections 73 and 74 of the Indian Contract Act, 1872 govern compensation for breach. Liquidated damages or limitation caps must represent a genuine pre-estimate of loss and cannot act as an unlawful penalty.
- **[INTERPRETATION]**: A liability cap equal to recent service fees is standard and recognized by Indian courts for B2B commercial software contracts.
- **[RISK]**: If clauses attempt to disclaim liability for gross negligence, fraud, or intentional misconduct, Indian courts may strike down the limitation as contrary to public policy under Section 23 of the Contract Act.
- **[RECOMMENDED ACTION]**: Maintain explicit exception in the Terms: *"Nothing herein shall limit liability for death, personal injury caused by negligence, or fraud."*
- **[HUMAN LAWYER REVIEW REQUIRED]**: **YES**.

### 2.2 Intellectual Property Rights & Work-for-Hire
- **[FACT]**: Varsaka provides software QA testing services, test automation frameworks, and test scripts.
- **[LEGAL REQUIREMENT]**: Under the Indian Copyright Act, 1957 (Section 17), the author of a work is the first owner of copyright unless created under a contract of service or written assignment.
- **[INTERPRETATION]**: The Terms must clearly differentiate between:
  1. **Client Materials**: Client proprietary software and data remain 100% owned by the client.
  2. **Deliverables**: Customized test suites built specifically for the client are assigned upon full payment.
  3. **Varsaka Background IP**: Pre-existing testing utilities, helper libraries, and generic test frameworks remain the property of Varsaka Labs, licensed on a non-exclusive basis.
- **[RECOMMENDED ACTION]**: Retain this three-way IP distinction in `/terms-of-service` and `/nda-template`.
- **[HUMAN LAWYER REVIEW REQUIRED]**: **YES**.

### 2.3 Governing Law, Jurisdiction & Dispute Resolution
- **[FACT]**: Terms designate the exclusive jurisdiction of courts in **New Delhi, India**.
- **[LEGAL REQUIREMENT]**: Under Section 28 of the Indian Contract Act, 1872, agreements in restraint of legal proceedings are void, EXCEPT agreements between parties conferring jurisdiction on one of multiple competent courts where a part of the cause of action arises.
- **[INTERPRETATION]**: Since Varsaka is headquartered/managed in Delhi/NCR, designating New Delhi courts is lawful and enforceable under Indian law (*Hakam Singh v. Gammon (India) Ltd.*).
- **[RECOMMENDED ACTION]**: Maintain dispute resolution ladder: (1) Good-faith executive negotiation (30 days); (2) Sole arbitrator under the Arbitration and Conciliation Act, 1996 seated in New Delhi with proceedings in English.
- **[HUMAN LAWYER REVIEW REQUIRED]**: **YES**.

---

## 3. Mandatory Human Legal Review Elements
1. [ ] Arbitration clause compliance with latest amendments to Arbitration and Conciliation Act, 1996.
2. [ ] Standardized non-compete / non-solicitation clauses regarding intern recruitment under Section 27 of Contract Act (voidness of restraint of trade).
3. [ ] Force majeure clause addressing telecommunication and edge cloud outages.
