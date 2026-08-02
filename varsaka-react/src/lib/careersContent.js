// Static Careers *page copy* and shared enums. This is brand content, not records —
// job listings and applications live in MongoDB and are fetched via the API layer.

export const DEPARTMENTS = ['Engineering', 'Security', 'Product', 'Operations']
export const LOCATIONS = ['Remote', 'Remote · EU', 'Hybrid · Bangalore']
export const TYPES = ['Full-time', 'Contract', 'Part-time']
export const JOB_STATUSES = ['published', 'draft', 'closed']
export const APP_STATUSES = ['New', 'Reviewing', 'Interview', 'Shortlisted', 'Rejected', 'Hired']

export const HIRING_STEPS = [
  { n: '01', title: 'Application', desc: 'You send us your story. A short note on why this work matters to you tells us more than a CV ever will.' },
  { n: '02', title: 'Review', desc: 'A senior engineer — not an algorithm — reads every application within five business days and replies either way.' },
  { n: '03', title: 'Conversation', desc: 'A relaxed call about your work, how you think about quality, and what you want to build next.' },
  { n: '04', title: 'Assessment', desc: 'A paid, realistic exercise drawn from work we actually do. No whiteboard puzzles, no trick questions.' },
  { n: '05', title: 'Offer', desc: 'We move fast. A clear offer, transparent compensation, and the space to ask anything before you decide.' },
  { n: '06', title: 'Welcome', desc: 'A structured first month with a mentor, real ownership early, and the room to do your best work.' },
]

export const BENEFITS = [
  { title: 'Competitive compensation', desc: 'Top-of-market salaries with meaningful equity. When clients succeed because of our work, everyone shares the upside.' },
  { title: 'Flexible, remote-first', desc: 'Work from wherever you think best. We default to async, protect deep-work time, and judge output, not hours.' },
  { title: 'Annual learning budget', desc: 'A generous yearly allowance for courses, conferences, certifications, and the books that keep you sharp.' },
  { title: 'Modern equipment', desc: 'A workstation of your choosing and whatever tooling helps you move fast without fighting your setup.' },
  { title: 'Career development', desc: 'Clear growth paths, quarterly craft reviews, and mentorship from engineers who have built quality at scale.' },
  { title: 'Health & wellbeing', desc: 'Comprehensive health cover, wellness support, and genuine, unmonitored time off — taken, not just offered.' },
]

export const fmtPosted = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? String(iso) : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
