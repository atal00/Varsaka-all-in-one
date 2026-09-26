# Varsaka Privacy & DPDP Act 2023 Statutory Requirements

**Lead Reviewer:** India Legal & Compliance Lead (Automated Assistant)  
**Primary Legislation:** Digital Personal Data Protection Act, 2023 (Act No. 22 of 2023)  
**Classification:** Pre-Counsel Compliance Specification  

---

## 1. Statutory Role Definition & Scope

- **[FACT]**: Varsaka determines the purpose and means of processing personal data collected through `varsaka.com`.
- **[LEGAL REQUIREMENT]**: Under Section 2(i) of the DPDP Act 2023, Varsaka qualifies as a **Data Fiduciary**. Individual visitors, prospective clients, and internship applicants qualify as **Data Principals** (Section 2(j)).
- **[INTERPRETATION]**: As a Data Fiduciary, Varsaka bears ultimate statutory responsibility for compliance, including processing carried out by its data processors (e.g. Supabase, FormSubmit).
- **[OPEN QUESTION]**: Has Varsaka entered into formal Data Processing Addendums (DPAs) with third-party cloud infrastructure vendors (Supabase Inc., Cloudflare Inc., FormSubmit)?
- **[RECOMMENDED ACTION]**: Execute standard DPAs with all cloud infrastructure providers ensuring Section 8(2) compliance.
- **[HUMAN LAWYER REVIEW REQUIRED]**: **YES**.

---

## 2. Requirements Under Chapter II: Obligations of Data Fiduciary

### Section 4: Grounds for Processing Personal Data
- **[FACT]**: Varsaka processes personal data based on user consent provided during form submission.
- **[LEGAL REQUIREMENT]**: Personal data may be processed only for a lawful purpose for which the Data Principal has given consent, or for certain legitimate uses specified in Section 7.
- **[INTERPRETATION]**: Marketing communications or sales follow-ups must be strictly limited to the stated purpose consented to by the user. Secondary marketing to unconsented third parties is strictly prohibited.
- **[HUMAN LAWYER REVIEW REQUIRED]**: **YES**.

### Section 5: Notice Requirements
- **[FACT]**: Varsaka displays a notice alongside all form inputs hyperlinking to `/privacy-policy`.
- **[LEGAL REQUIREMENT]**: Notice must inform the Data Principal of:
  1. The personal data to be collected and purpose of processing.
  2. The manner in which the Data Principal may exercise rights of withdrawal, grievance redressal, and complaint to the Data Protection Board.
  3. Option to view the notice in English or any of the 22 languages specified in the Eighth Schedule to the Constitution of India.
- **[INTERPRETATION]**: Currently, the notice is provided in English. Once DPDP Rules are notified, multi-lingual notice support (especially Hindi) may become mandatory.
- **[RECOMMENDED ACTION]**: Prepare Hindi localization of the Privacy Policy notice for rapid rollout upon rule notification.
- **[OPEN QUESTION]**: Will upcoming DPDP Rules mandate immediate bilingual notice on B2B technical sites?
- **[HUMAN LAWYER REVIEW REQUIRED]**: **YES**.

### Section 6: Affirmative Consent Standard
- **[FACT]**: Checkboxes are un-ticked by default; user must actively click the checkbox before form submission is enabled.
- **[LEGAL REQUIREMENT]**: Consent must be granular, unbundled from non-essential services, and must not make service provision conditional on consent to non-necessary data collection (Section 6(1)).
- **[EVIDENCE IN CODE]**: Contact form only requires Name, Email, and Message. Phone and Company are optional.
- **[HUMAN LAWYER REVIEW REQUIRED]**: **NO** (Implementation adheres to Section 6).

---

## 3. Requirements Under Chapter III: Rights of Data Principal

| Section | Statutory Right | Varsaka Implementation Mechanism | Human Review Required |
|---|---|---|---|
| **Section 11** | **Right to Access Information** | Data Principal can request a summary of personal data processed by emailing `info@varsaka.com`. | **YES** |
| **Section 12** | **Right to Correction & Erasure** | User can request correction of inaccurate data or complete erasure of lead/applicant records. | **YES** |
| **Section 13** | **Right of Grievance Redressal** | Grievance Redressal Officer reachable at `info@varsaka.com`. Acknowledged within 48h; resolved within 30 days. | **YES** |
| **Section 14** | **Right to Nominate** | Right to nominate an individual to exercise rights in the event of death/incapacity. Included in Privacy Policy text. | **YES** |

---

## 4. Grievance Redressal Officer Designation

In accordance with Section 8(9) and Section 13 of the DPDP Act 2023, the Privacy Policy explicitly designates:
- **Designation**: Data Protection & Grievance Redressal Officer
- **Entity**: Varsaka Labs
- **Official Contact**: `info@varsaka.com`
- **Location**: New Delhi, India
- **Escalation Path**: If unresolved within statutory timelines, Data Principal has the right to file a complaint before the **Data Protection Board of India**.
