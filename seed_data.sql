-- Seed Data for Varsaka Labs Supabase Tables (Humanized Version)

-- Clear existing data to avoid duplicates when running this script multiple times
TRUNCATE TABLE services, testimonials, faqs, blogs, certificates, leads;

-- 1. Insert Services
INSERT INTO services (name, description, category, icon, status) VALUES
('Functional Testing', 'Making sure your app actually works the way you planned, no matter how users try to break it.', 'Core QA', '🧪', 'active'),
('Automation Testing', 'Speed up your launches. We build smart test scripts that do the heavy lifting for you.', 'Speed & Scale', '🤖', 'active'),
('Performance Testing', 'Don''t let traffic spikes crash your app. We test your limits so you can scale with confidence.', 'Scalability', '⚡', 'active'),
('Security Audits', 'Finding the loopholes before the bad guys do. Let''s keep your user data locked down.', 'Protection', '🔐', 'active'),
('AI-Powered Testing', 'Using smart algorithms to predict where bugs might hide and test faster than ever before.', 'Next-Gen', '🧠', 'active'),
('Mobile App Testing', 'Because your users deserve a smooth experience, whether they''re on an old Android or the newest iPhone.', 'Cross-Platform', '📱', 'active');

-- 2. Insert Testimonials
INSERT INTO testimonials (client, company, text, rating, status) VALUES
('Sarah J.', 'CTO, FinTech Startup', 'Honestly, the Varsaka team found bugs we didn''t even know existed. We were about to launch our new payment gateway, and they stepped in at the last minute. Their deep dive uncovered critical edge cases in our transactions that could have cost us thousands. They totally saved our launch day! Beyond just finding issues, they provided clear steps to reproduce and fix them, which made our dev team''s job incredibly easy. Highly recommend their thoroughness.', 5, 'approved'),
('Michael R.', 'VP Engineering, E-commerce', 'Switching to their automated tests gave us back so much time. We test faster and deploy with zero stress now. Before Varsaka, our QA team spent weekends doing manual regression testing for every single update. Now, their custom automation suite runs in our CI/CD pipeline in minutes. We catch regressions instantly, and our developers can focus on building new features rather than fixing old bugs. It''s been a game-changer for our velocity.', 5, 'approved'),
('Priya K.', 'Product Manager, SaaS', 'Super easy to work with and incredibly thorough. They really feel like a part of our own team. We struggled to find QA partners who understood our complex B2B workflows, but Varsaka grasped our product logic immediately. They didn''t just execute test cases; they suggested UX improvements and caught edge cases in our onboarding flow that we completely overlooked. Communication was seamless via Slack, and their daily reports kept everyone aligned.', 5, 'approved'),
('David L.', 'Founder, HealthTech', 'Varsaka made sure our app complied with all data regulations. Testing was flawless and gave us peace of mind. Handling sensitive patient data meant we couldn''t afford a single security slip. The Varsaka team conducted rigorous security audits and penetration testing, identifying vulnerabilities we hadn''t considered. They even helped us generate synthetic test data to ensure privacy. Knowing they had our back allowed us to launch confidently to hospitals.', 5, 'approved'),
('Emma W.', 'Lead Developer, EdTech', 'Our mobile app was crashing on older phones. Varsaka found the exact memory leak in just 2 days. We were getting negative reviews because the app wouldn''t load on low-end devices, and our internal team couldn''t reproduce the issue. Varsaka''s device lab tested it across dozens of real phones, pinpointed the exact screen causing the crash, and provided the logs we needed to patch it. Our app rating went from 3.2 to 4.8 in a month thanks to them.', 5, 'approved'),
('James T.', 'CEO, Logistics Startup', 'We needed performance testing before Black Friday. They pushed our servers to the limit and helped us optimize everything. Last year, our tracking system went down during peak season, so we were nervous. Varsaka simulated thousands of concurrent drivers and users hitting our APIs simultaneously. They identified two database bottlenecks, helped us refactor the queries, and re-tested until the system was rock solid. We survived our biggest weekend ever without a single hiccup.', 5, 'approved'),
('Sophia M.', 'QA Manager, Enterprise SaaS', 'We hired Varsaka to augment our internal team. They integrated seamlessly and boosted our test coverage by 40%.', 5, 'approved'),
('Liam O.', 'Engineering Manager, Mobile Gaming', 'I have never seen such detailed bug reports. Everything was perfectly documented with video recordings and steps.', 5, 'approved'),
('Isabella C.', 'Product Owner, Retail', 'Their automation framework was so easy to understand that our junior devs can now write their own tests.', 5, 'approved'),
('Noah B.', 'Director of IT, Finance', 'The security audit was an eye-opener. They found two critical API vulnerabilities that our internal tools completely missed.', 5, 'approved'),
('Mia P.', 'Startup Founder', 'We didn’t know much about QA, but Varsaka guided us through the whole process. Very friendly and professional.', 5, 'approved'),
('Ethan K.', 'VP of Product, TravelTech', 'Great communication and daily updates. We always knew exactly what was being tested and what the results were.', 5, 'approved'),
('Ava R.', 'Tech Lead, Web3', 'They set up our entire CI/CD testing pipeline from scratch. Now our deployments are fully automated and stress-free.', 5, 'approved'),
('Alexander D.', 'Operations Manager, Food Delivery', 'During our peak hours, the app used to slow down. Thanks to their load testing, we survived our biggest weekend ever.', 5, 'approved'),
('Charlotte H.', 'CEO, HR Software', 'They genuinely care about user experience. They didn’t just report functional bugs, they gave amazing UI/UX feedback too.', 5, 'approved');

-- 3. Insert FAQs
INSERT INTO faqs (question, answer, category) VALUES
('How quickly can you start testing our app?', 'We can usually jump in and start testing within 3 to 5 days after we chat and figure out exactly what you need.', 'General'),
('Do we get our own dedicated testers?', 'Absolutely! You get a dedicated crew of QA experts who basically work as an extension of your own development team.', 'Services'),
('What kind of testing tools do you guys use?', 'We use whatever gets the best results for your stack—usually industry favorites like Selenium, Playwright, Cypress, and JMeter.', 'Technology'),
('Do you test on real phones or just emulators?', 'A mix of both! We use real devices to feel exactly what your users experience, and emulators to run hundreds of tests super fast.', 'Mobile'),
('Have you worked with apps in our industry?', 'Chances are, yes! We’ve tested everything from banking apps and online stores to healthcare platforms and SaaS tools.', 'General'),
('How do you report bugs to us?', 'We hate confusing spreadsheets too. We drop bugs right into your Jira, Trello, or Slack, complete with clear steps and screenshots.', 'Process'),
('Can you just help our current QA team?', 'For sure. We often jump in to give existing teams an extra boost, especially right before a big, stressful release.', 'Services'),
('Do you only do long-term contracts?', 'Nope, we’re flexible. Whether you just need a quick security audit or want us around for years, we’ve got you covered.', 'Services'),
('How do you keep our app data safe?', 'We take privacy super seriously. We sign strict NDAs, use secure test environments, and mask any sensitive user data.', 'Security'),
('How does your pricing work?', 'It really depends on what you need. We can do a flat fee for a specific project or a simple monthly rate for a dedicated team.', 'Pricing'),
('Do you test backend stuff like APIs?', 'Yep! We don’t just look at the pretty screens. We test your APIs to make sure data flows securely and reliably behind the scenes.', 'Services'),
('What about test data? Do you use our real users?', 'Never. We generate fake, synthetic data or carefully scramble your database so we can test realistically without risking privacy.', 'Process'),
('Can you plug your tests into our GitHub or CI/CD?', 'Oh yeah, that’s our bread and butter. We’ll wire up our automated tests so they run automatically every time you push code.', 'Technology'),
('What if we aren''t happy with the testing?', 'We want you to be thrilled. If anything feels off, just tell us. We can always adjust our approach or offer a trial period to build trust.', 'General'),
('Do you check if the app is actually easy to use?', 'Yes! We don’t just look for broken buttons; we’ll also tell you if a user flow feels clunky or confusing on certain screen sizes.', 'Services'),
('Where is your team located for time zones?', 'We have folks working in overlapping shifts, so whether you''re in the US, Europe, or Asia, we’ll find a time to collaborate smoothly.', 'General');

-- 4. Insert Blogs
INSERT INTO blogs (title, summary, content, author, status, views) VALUES
('Why AI is the Best Thing to Happen to Software Testing', 'Let''s talk about how AI is changing the QA game and why you shouldn''t be afraid of it.', '<p>AI isn''t here to take our testing jobs—it''s here to do the boring parts for us! Imagine having a tool that writes basic test scripts while you sleep or warns you which part of your app is most likely to crash after a new update. In this post, we break down how we’re using AI at Varsaka to test smarter, not harder.</p>', 'Varsaka Labs Team', 'published', 1250),
('The Top 10 Security Mistakes Startups Make', 'A friendly guide to making sure your app isn''t accidentally leaving the front door wide open for hackers.', '<p>Building an app is hard enough without worrying about security breaches. But honestly, most hacks happen because of simple, preventable mistakes. Today, we''re going over the OWASP Top 10 vulnerabilities in plain English—what they are, why they happen, and how you can lock them down before launch day.</p>', 'Varsaka Security', 'published', 840);

-- 5. Insert Certificates (Dummy data)
INSERT INTO certificates (full_name, internship_role, project_title, mentor_name, grade, location, start_date, end_date, issue_date, cert_year, cert_num, certificate_id) VALUES
('Ramesh Kumar', 'QA Intern', 'E-commerce Platform Automation', 'Abhishek Sharma', 'A+', 'Remote, India', '2023-01-15', '2023-04-15', '2023-04-20', '2023', '001', 'VAR-INT-2023-001'),
('Sneha Gupta', 'Frontend Intern', 'Admin Dashboard Revamp', 'Priya Singh', 'A', 'Remote, India', '2023-05-10', '2023-08-10', '2023-08-15', '2023', '002', 'VAR-INT-2023-002');

-- 6. Insert Leads (Dummy data)
INSERT INTO leads (name, email, phone, company, service, message, source, status) VALUES
('John Doe', 'john@example.com', '+1 234 567 8900', 'Tech Innovators', 'Automation Testing', 'Hey there! We really need some help automating our regression suite before we go crazy.', 'Website Form', 'new'),
('Amit Patel', 'amit@example.in', '+91 9876543210', 'StartUp Inc', 'Security Audits', 'Hi Varsaka team, we have a big product launch next month and want to make sure our app is bulletproof.', 'Website Form', 'ongoing');
