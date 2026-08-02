-- Safe Seed Script to insert missing default data without destroying existing custom data

-- 1. Insert missing Services
INSERT INTO services (name, description, category, icon, status)
SELECT 'Functional Testing', 'Making sure your app actually works the way you planned, no matter how users try to break it.', 'Core QA', '🧪', 'active'
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Functional Testing');

INSERT INTO services (name, description, category, icon, status)
SELECT 'Automation Testing', 'Speed up your launches. We build smart test scripts that do the heavy lifting for you.', 'Speed & Scale', '🤖', 'active'
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Automation Testing');

INSERT INTO services (name, description, category, icon, status)
SELECT 'Performance Testing', 'Don''t let traffic spikes crash your app. We test your limits so you can scale with confidence.', 'Scalability', '⚡', 'active'
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Performance Testing');

INSERT INTO services (name, description, category, icon, status)
SELECT 'Security Audits', 'Finding the loopholes before the bad guys do. Let''s keep your user data locked down.', 'Protection', '🔐', 'active'
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Security Audits' OR name = 'Security Testing');

INSERT INTO services (name, description, category, icon, status)
SELECT 'AI-Powered Testing', 'Using smart algorithms to predict where bugs might hide and test faster than ever before.', 'Next-Gen', '🧠', 'active'
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'AI-Powered Testing');

INSERT INTO services (name, description, category, icon, status)
SELECT 'Mobile App Testing', 'Because your users deserve a smooth experience, whether they''re on an old Android or the newest iPhone.', 'Cross-Platform', '📱', 'active'
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Mobile App Testing');


-- 2. Insert missing Testimonials
INSERT INTO testimonials (client, company, text, rating, status)
SELECT 'Sarah J.', 'CTO, FinTech Startup', 'Honestly, the Varsaka team found bugs we didn''t even know existed. We were about to launch our new payment gateway, and they stepped in at the last minute. Their deep dive uncovered critical edge cases in our transactions that could have cost us thousands. They totally saved our launch day! Beyond just finding issues, they provided clear steps to reproduce and fix them, which made our dev team''s job incredibly easy. Highly recommend their thoroughness.', 5, 'approved'
WHERE NOT EXISTS (SELECT 1 FROM testimonials WHERE client = 'Sarah J.');

INSERT INTO testimonials (client, company, text, rating, status)
SELECT 'Michael R.', 'VP Engineering, E-commerce', 'Switching to their automated tests gave us back so much time. We test faster and deploy with zero stress now. Before Varsaka, our QA team spent weekends doing manual regression testing for every single update. Now, their custom automation suite runs in our CI/CD pipeline in minutes. We catch regressions instantly, and our developers can focus on building new features rather than fixing old bugs. It''s been a game-changer for our velocity.', 5, 'approved'
WHERE NOT EXISTS (SELECT 1 FROM testimonials WHERE client = 'Michael R.');

INSERT INTO testimonials (client, company, text, rating, status)
SELECT 'Priya K.', 'Product Manager, SaaS', 'Super easy to work with and incredibly thorough. They really feel like a part of our own team. We struggled to find QA partners who understood our complex B2B workflows, but Varsaka grasped our product logic immediately. They didn''t just execute test cases; they suggested UX improvements and caught edge cases in our onboarding flow that we completely overlooked. Communication was seamless via Slack, and their daily reports kept everyone aligned.', 5, 'approved'
WHERE NOT EXISTS (SELECT 1 FROM testimonials WHERE client = 'Priya K.');

INSERT INTO testimonials (client, company, text, rating, status)
SELECT 'David L.', 'Founder, HealthTech', 'Varsaka made sure our app complied with all data regulations. Testing was flawless and gave us peace of mind. Handling sensitive patient data meant we couldn''t afford a single security slip. The Varsaka team conducted rigorous security audits and penetration testing, identifying vulnerabilities we hadn''t considered. They even helped us generate synthetic test data to ensure privacy. Knowing they had our back allowed us to launch confidently to hospitals.', 5, 'approved'
WHERE NOT EXISTS (SELECT 1 FROM testimonials WHERE client = 'David L.');

INSERT INTO testimonials (client, company, text, rating, status)
SELECT 'Emma W.', 'Lead Developer, EdTech', 'Our mobile app was crashing on older phones. Varsaka found the exact memory leak in just 2 days. We were getting negative reviews because the app wouldn''t load on low-end devices, and our internal team couldn''t reproduce the issue. Varsaka''s device lab tested it across dozens of real phones, pinpointed the exact screen causing the crash, and provided the logs we needed to patch it. Our app rating went from 3.2 to 4.8 in a month thanks to them.', 5, 'approved'
WHERE NOT EXISTS (SELECT 1 FROM testimonials WHERE client = 'Emma W.');

INSERT INTO testimonials (client, company, text, rating, status)
SELECT 'James T.', 'CEO, Logistics Startup', 'We needed performance testing before Black Friday. They pushed our servers to the limit and helped us optimize everything. Last year, our tracking system went down during peak season, so we were nervous. Varsaka simulated thousands of concurrent drivers and users hitting our APIs simultaneously. They identified two database bottlenecks, helped us refactor the queries, and re-tested until the system was rock solid. We survived our biggest weekend ever without a single hiccup.', 5, 'approved'
WHERE NOT EXISTS (SELECT 1 FROM testimonials WHERE client = 'James T.');


-- 3. Insert missing FAQs
INSERT INTO faqs (question, answer, category)
SELECT 'How quickly can you start testing our app?', 'We can usually jump in and start testing within 3 to 5 days after we chat and figure out exactly what you need.', 'General'
WHERE NOT EXISTS (SELECT 1 FROM faqs WHERE question = 'How quickly can you start testing our app?');

INSERT INTO faqs (question, answer, category)
SELECT 'Do we get our own dedicated testers?', 'Absolutely! You get a dedicated crew of QA experts who basically work as an extension of your own development team.', 'Services'
WHERE NOT EXISTS (SELECT 1 FROM faqs WHERE question = 'Do we get our own dedicated testers?');

INSERT INTO faqs (question, answer, category)
SELECT 'What kind of testing tools do you guys use?', 'We use whatever gets the best results for your stack—usually industry favorites like Selenium, Playwright, Cypress, and JMeter.', 'Technology'
WHERE NOT EXISTS (SELECT 1 FROM faqs WHERE question = 'What kind of testing tools do you guys use?');

INSERT INTO faqs (question, answer, category)
SELECT 'Do you test on real phones or just emulators?', 'A mix of both! We use real devices to feel exactly what your users experience, and emulators to run hundreds of tests super fast.', 'Mobile'
WHERE NOT EXISTS (SELECT 1 FROM faqs WHERE question = 'Do you test on real phones or just emulators?');

INSERT INTO faqs (question, answer, category)
SELECT 'Have you worked with apps in our industry?', 'Chances are, yes! We’ve tested everything from banking apps and online stores to healthcare platforms and SaaS tools.', 'General'
WHERE NOT EXISTS (SELECT 1 FROM faqs WHERE question = 'Have you worked with apps in our industry?');

INSERT INTO faqs (question, answer, category)
SELECT 'How do you report bugs to us?', 'We hate confusing spreadsheets too. We drop bugs right into your Jira, Trello, or Slack, complete with clear steps and screenshots.', 'Process'
WHERE NOT EXISTS (SELECT 1 FROM faqs WHERE question = 'How do you report bugs to us?');
