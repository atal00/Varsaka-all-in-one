export const caseStudiesData = [
  { 
    id: 'ourfab-technologies',
    client: 'Ourfab Technologies', 
    tag: 'Security Testing', 
    icon: 'fa-shield-halved',
    outcome: 'Zero Breaches Post-Launch', 
    desc: "When Ourfab was gearing up to launch their new fintech app, they knew security couldn't be an afterthought. We dug deep into their architecture with a full OWASP audit, uncovering hidden vulnerabilities that automated tools missed. By working side-by-side with their devs, we locked down the platform weeks before go-live.",
    content: `
      <h2>The Challenge: A High-Stakes Fintech Launch</h2>
      <p>Ourfab Technologies was building a revolutionary payment gateway, but in the fintech world, one security breach can end a company before it even begins. Their internal team was moving fast, relying mostly on automated scanners, which left dangerous blind spots in their business logic and authentication flows.</p>
      
      <h2>Our Approach: Thinking Like the Enemy</h2>
      <p>We didn't just run automated tools. Our security engineers performed a comprehensive manual penetration test, acting as malicious actors would. We discovered a critical broken access control vulnerability that allowed an authenticated user to view another user's transaction history by simply manipulating the API parameters.</p>
      
      <h2>The Fix & Impact</h2>
      <p>We sat down with their backend developers and walked them through exactly how the exploit worked. Within 48 hours, they implemented a robust role-based access control (RBAC) fix. When Ourfab launched to the public three weeks later, they did so with absolute confidence. Six months post-launch, they have maintained a flawless security record with zero reported breaches.</p>
    `
  },
  { 
    id: 'techtd-platform',
    client: 'Techtd Platform', 
    tag: 'Automation', 
    icon: 'fa-bolt-lightning',
    outcome: 'Cut Release Times by 60%', 
    desc: "The engineering team at Techtd was drowning in manual regression testing every sprint. We stepped in and built a custom Cypress automation framework from scratch. Now, their tests run automatically with every CI/CD commit, giving developers instant feedback and freeing up QA to focus on edge cases.",
    content: `
      <h2>The Challenge: Death by Manual Testing</h2>
      <p>Techtd had a massive SaaS platform with hundreds of screens. Every two-week sprint, their QA team spent five days just executing the exact same regression test cases. Developers were waiting forever for feedback, and hotfixes were incredibly stressful because nobody was sure what might break.</p>
      
      <h2>Our Approach: Shifting Left with Cypress</h2>
      <p>We implemented a modern Cypress testing framework that plugged directly into their GitHub Actions CI/CD pipeline. Instead of trying to automate everything, we focused strictly on their most critical user journeys—the "Golden Paths." We also trained their developers to write their own tests alongside new features.</p>
      
      <h2>The Impact</h2>
      <p>The results were immediate. A regression cycle that used to take five days now runs unattended in 12 minutes. Release cycles were slashed by 60%, and the QA team finally had the breathing room to do actual exploratory testing instead of acting like robots.</p>
    `
  },
  { 
    id: 'takecare360',
    client: 'TakeCare360', 
    tag: 'AI-Powered Testing', 
    icon: 'fa-robot',
    outcome: 'Boosted Test Coverage to 90%', 
    desc: "Healthcare apps require flawless precision, but TakeCare360 had massive gaps in their test coverage. We introduced AI-assisted test generation to automatically write and maintain test scripts. The result? We scaled their coverage dramatically while actually reducing the time spent on test maintenance.",
    content: `
      <h2>The Challenge: Gaps in Critical Healthcare Logic</h2>
      <p>TakeCare360 manages sensitive patient records and appointment scheduling. They had basic unit tests, but their end-to-end coverage was sitting at a risky 30%. With a small QA team, manually writing the thousands of test cases required to reach acceptable coverage would have taken years.</p>
      
      <h2>Our Approach: AI Test Generation</h2>
      <p>We leveraged advanced AI testing tools that crawled their application, learned the user flows, and automatically generated robust end-to-end tests. But we didn't stop there. We configured the AI to self-heal the scripts, meaning if a button moved or an ID changed, the tests adapted automatically instead of failing.</p>
      
      <h2>The Impact</h2>
      <p>In just three months, we propelled their test coverage from 30% to over 90%. More importantly, test maintenance time dropped by 80%. When they rolled out a massive UI overhaul last quarter, the AI healed the test suite overnight, saving weeks of manual script updates.</p>
    `
  },
  { 
    id: 'retailedge-india',
    client: 'RetailEdge India', 
    tag: 'Performance Testing', 
    icon: 'fa-gauge-high',
    outcome: 'Handled 5x Holiday Traffic Spikes', 
    desc: "Nothing hurts an ecommerce brand more than crashing during a flash sale. We ran intense, targeted load testing using JMeter on RetailEdge's checkout flow. After identifying severe database bottlenecks, we helped them optimize their infrastructure just in time for their biggest holiday sale of the year.",
    content: `
      <h2>The Challenge: The Nightmare Before Diwali</h2>
      <p>RetailEdge India was preparing for their massive Diwali flash sale. The previous year, their site crashed under the load, resulting in millions of rupees in lost revenue and furious customers venting on Twitter. They couldn't afford a repeat.</p>
      
      <h2>Our Approach: Breaking the System on Purpose</h2>
      <p>We simulated thousands of concurrent users hitting the site using JMeter, specifically targeting the search, add-to-cart, and payment gateway flows. The system crumbled at just 2,000 concurrent users. By analyzing the crash dumps, we discovered the database connection pool was exhausting, and a specific search query was missing an index.</p>
      
      <h2>The Impact</h2>
      <p>Working with their DevOps team, we optimized the database queries, increased the connection pool limits, and implemented aggressive Redis caching. On the day of the sale, traffic spiked to 10,000 concurrent users (5x their normal peak). The site stayed perfectly stable, delivering their most profitable day in company history.</p>
    `
  },
  {
    id: 'edustream-pro',
    client: 'EduStream Pro',
    tag: 'Mobile Testing',
    icon: 'fa-mobile-screen',
    outcome: '4.8 Star App Store Rating',
    desc: "EduStream's mobile app was suffering from negative reviews due to device-specific UI glitches. We deployed a comprehensive real-device testing strategy across 50+ iOS and Android configurations. By catching OS-specific quirks before release, we helped them turn their user reviews around completely.",
    content: `
      <h2>The Challenge: The Fragmentation Nightmare</h2>
      <p>EduStream's educational app worked perfectly on the latest iPhones, but their Android user base (which made up 70% of their traffic) was experiencing brutal UI overlapping and crashes. Their app store rating plummeted to 2.4 stars, and uninstalls were skyrocketing.</p>
      
      <h2>Our Approach: A Massive Device Farm</h2>
      <p>You can't catch device-specific bugs on an emulator. We integrated their build pipeline with a cloud-based real-device farm, testing every release against 50 different hardware and OS combinations. We quickly found that specific Android manufacturers' custom UI layers were breaking the video player component.</p>
      
      <h2>The Impact</h2>
      <p>After pinpointing and fixing the exact manufacturer-specific bugs, the app stabilized. Over the next three months, their crash-free session rate hit 99.8%. The users noticed, and their App Store and Play Store ratings steadily climbed back up to an impressive 4.8 stars.</p>
    `
  },
  {
    id: 'logisync-global',
    client: 'Logisync Global',
    tag: 'API Testing',
    icon: 'fa-network-wired',
    outcome: 'Eliminated Silent Data Failures',
    desc: "As a global logistics platform, Logisync relies on dozens of third-party APIs. When those APIs failed silently, packages got delayed. We built a robust API contract testing suite that actively monitors endpoint health and data integrity, ensuring that data flows smoothly across their entire supply chain.",
    content: `
      <h2>The Challenge: The Silent Killers</h2>
      <p>Logisync's platform routes shipments by connecting to over 40 different shipping carrier APIs. Occasionally, a carrier would quietly change their API response format. The system wouldn't crash, but shipping labels would generate incorrectly, causing massive logistical headaches and delays at warehouses.</p>
      
      <h2>Our Approach: Contract Testing & Real-time Monitoring</h2>
      <p>We implemented API contract testing using Postman and Newman. We set up automated scripts that constantly pinged the third-party APIs to verify not just uptime, but the exact structure and data types of the responses. If a carrier changed a field from an integer to a string, our tests caught it instantly.</p>
      
      <h2>The Impact</h2>
      <p>The days of finding out about an API change from an angry warehouse manager were over. Our monitoring alerted the engineering team to upstream changes the second they happened, allowing them to patch their parsers before a single shipping label was printed incorrectly. Silent data failures dropped to zero.</p>
    `
  }
];
