// These templates are seeded for each user on first visit to the Templates section.

export type SeedTemplate = {
  templateId: string;
  title: string;
  summary: string;
  category: "cro" | "cmo" | "cco" | "cpo";
  body: string;
};

export const seedTemplates: SeedTemplate[] = [
  {
    templateId: "cro_pipeline_health",
    title: "Pipeline health review",
    summary: "Inspect top-of-funnel volume, velocity, and conversion gaps.",
    category: "cro",
    body: `Pipeline Health Review

Timeframe
- <month or quarter>

Coverage
- Target coverage: <x>
- Current coverage: <x>
- Gap and drivers: <notes>

Stage Performance
- Stage 1 conversion: <percent>
- Stage 2 conversion: <percent>
- Stage 3 conversion: <percent>

Top Risks
- <risk>: <impact> - <owner>
- <risk>: <impact> - <owner>

Actions
- <action> - <owner> - <date>
- <action> - <owner> - <date>
`,
  },
  {
    templateId: "cro_qbr",
    title: "Revenue QBR",
    summary: "Quarterly business review for revenue leadership.",
    category: "cro",
    body: `Revenue QBR

Headline
- ARR booked: <amount>
- Attainment: <percent>
- Net retention: <percent>

What Worked
- <motion or play>
- <segment insight>

What Missed
- <deal pattern>
- <capacity constraint>

Next Quarter Focus
- <focus area>
- <pipeline program>
`,
  },
  {
    templateId: "cro_forecast_call",
    title: "Forecast call prep",
    summary: "Weekly forecast roll-up for leadership alignment.",
    category: "cro",
    body: `Forecast Call Prep

Week Of
- <date>

Number
- Commit: <amount>
- Best case: <amount>
- Worst case: <amount>

Deals to Watch
- <deal> - <stage> - <risk>
- <deal> - <stage> - <risk>

Asks
- <decision needed>
- <support needed>
`,
  },
  {
    templateId: "cro_win_loss",
    title: "Win-loss recap",
    summary: "Pattern capture from closed won and lost deals.",
    category: "cro",
    body: `Win-Loss Recap

Period
- <month>

Wins
- <deal> - <why we won>
- <deal> - <why we won>

Losses
- <deal> - <why we lost>
- <deal> - <why we lost>

Adjustments
- <messaging change>
- <process change>
`,
  },
  {
    templateId: "cro_account_plan",
    title: "Strategic account plan",
    summary: "Multi-threaded plan for top revenue accounts.",
    category: "cro",
    body: `Strategic Account Plan

Account
- <name>
- ARR: <amount>

Stakeholders
- <name> - <role> - <influence>

Value Narrative
- <primary outcome>
- <secondary outcome>

Growth Plan
- <next use case>
- <expansion path>
`,
  },
  {
    templateId: "cro_pricing_review",
    title: "Pricing review",
    summary: "Quarterly assessment of pricing and packaging.",
    category: "cro",
    body: `Pricing Review

Inputs
- Win rate by tier: <data>
- Discounting trend: <data>

Observations
- <pattern>
- <pattern>

Recommendations
- <change>
- <change>

Decision
- <owner> - <date>
`,
  },
  {
    templateId: "cmo_campaign_brief",
    title: "Campaign brief",
    summary: "Single source for goals, audience, and channels.",
    category: "cmo",
    body: `Campaign Brief

Objective
- <goal>

Audience
- <segment>
- <pain point>

Message
- <primary message>
- <proof points>

Channels
- <channel> - <owner>
- <channel> - <owner>

Success Metrics
- <metric>
- <metric>
`,
  },
  {
    templateId: "cmo_launch_plan",
    title: "Launch plan",
    summary: "Coordinated product launch plan and timeline.",
    category: "cmo",
    body: `Launch Plan

Launch Date
- <date>

Audience Segments
- <segment>
- <segment>

Assets
- <asset> - <status>
- <asset> - <status>

Milestones
- <milestone> - <owner>
- <milestone> - <owner>
`,
  },
  {
    templateId: "cmo_brand_message",
    title: "Messaging framework",
    summary: "Clarify positioning, proof, and narrative pillars.",
    category: "cmo",
    body: `Messaging Framework

Positioning
- For <audience> who <need>, <product> is <category> that <value>.

Pillars
- <pillar>
- <pillar>
- <pillar>

Proof
- <case study>
- <metric>
`,
  },
  {
    templateId: "cmo_content_calendar",
    title: "Content calendar",
    summary: "Monthly view of content themes and owners.",
    category: "cmo",
    body: `Content Calendar

Month
- <month>

Themes
- <theme> - <owner>
- <theme> - <owner>

Key Assets
- <asset> - <due date>
- <asset> - <due date>
`,
  },
  {
    templateId: "cmo_marketing_qbr",
    title: "Marketing QBR",
    summary: "Performance recap for pipeline, brand, and retention.",
    category: "cmo",
    body: `Marketing QBR

Pipeline
- New pipeline: <amount>
- Sourced pipeline: <amount>

Brand
- Share of voice: <percent>
- Brand search trend: <trend>

Retention
- Expansion influenced: <amount>

Next Quarter Bets
- <bet>
- <bet>
`,
  },
  {
    templateId: "cmo_experiment_log",
    title: "Experiment log",
    summary: "Track growth experiments and learnings.",
    category: "cmo",
    body: `Experiment Log

Hypothesis
- <statement>

Test
- <channel or asset>
- <duration>

Result
- <metric change>

Decision
- <scale, iterate, or stop>
`,
  },
  {
    templateId: "cco_health_score",
    title: "Customer health score",
    summary: "Unified health scoring rubric and actions.",
    category: "cco",
    body: `Customer Health Score

Signals
- Product usage: <metric>
- Support volume: <metric>
- Executive engagement: <metric>

Score
- Health tier: <green/yellow/red>
- Reason: <notes>

Action Plan
- <action> - <owner>
- <action> - <owner>
`,
  },
  {
    templateId: "cco_renewal_plan",
    title: "Renewal plan",
    summary: "Timeline and actions for upcoming renewals.",
    category: "cco",
    body: `Renewal Plan

Account
- <name>
- Renewal date: <date>

Objectives
- <outcome>

Risks
- <risk>
- <risk>

Plan
- <action> - <owner> - <date>
- <action> - <owner> - <date>
`,
  },
  {
    templateId: "cco_vox",
    title: "Voice of customer",
    summary: "Monthly synthesis of customer feedback themes.",
    category: "cco",
    body: `Voice of Customer

Themes
- <theme> - <examples>
- <theme> - <examples>

Top Requests
- <request>
- <request>

Impact
- <impact on retention>
- <impact on expansion>
`,
  },
  {
    templateId: "cco_qbr",
    title: "Customer success QBR",
    summary: "Quarterly review of retention and expansion.",
    category: "cco",
    body: `Customer Success QBR

Retention
- Gross retention: <percent>
- Net retention: <percent>

Expansion
- Expansion ARR: <amount>

Adoption
- Product adoption: <metric>

Focus
- <initiative>
- <initiative>
`,
  },
  {
    templateId: "cco_onboarding",
    title: "Onboarding checklist",
    summary: "Standardize customer onboarding milestones.",
    category: "cco",
    body: `Onboarding Checklist

Kickoff
- <stakeholders>
- <success criteria>

Milestones
- <milestone> - <date>
- <milestone> - <date>

Enablement
- <training> - <owner>
- <training> - <owner>
`,
  },
  {
    templateId: "cco_escalation",
    title: "Escalation plan",
    summary: "Response plan for at-risk accounts.",
    category: "cco",
    body: `Escalation Plan

Account
- <name>
- Health: <status>

Issue Summary
- <issue>

Response Team
- <owner>
- <exec sponsor>

Timeline
- <step> - <date>
- <step> - <date>
`,
  },
  {
    templateId: "cpo_product_brief",
    title: "Product brief",
    summary: "Define problem, target user, and success metrics.",
    category: "cpo",
    body: `Product Brief

Problem
- <user problem>

Audience
- <segment>

Solution
- <approach>

Success
- <metric>
- <metric>
`,
  },
  {
    templateId: "cpo_roadmap_review",
    title: "Roadmap review",
    summary: "Quarterly roadmap health check and tradeoffs.",
    category: "cpo",
    body: `Roadmap Review

Themes
- <theme>
- <theme>

Risks
- <risk>
- <risk>

Decisions
- <decision> - <owner>
- <decision> - <owner>
`,
  },
  {
    templateId: "cpo_prd",
    title: "PRD lite",
    summary: "Lightweight requirements doc for execution.",
    category: "cpo",
    body: `PRD Lite

Goal
- <goal>

Requirements
- <requirement>
- <requirement>

Out of Scope
- <item>

Dependencies
- <dependency>
`,
  },
  {
    templateId: "cpo_experiment_brief",
    title: "Experiment brief",
    summary: "Define hypothesis and measurement for product tests.",
    category: "cpo",
    body: `Experiment Brief

Hypothesis
- <statement>

Change
- <variation>

Metric
- <primary metric>

Timeline
- <start> to <end>
`,
  },
  {
    templateId: "cpo_launch_readiness",
    title: "Launch readiness",
    summary: "Pre-launch checklist across functions.",
    category: "cpo",
    body: `Launch Readiness

Quality
- <test coverage>
- <known issues>

Comms
- <release note>
- <internal enablement>

Support
- <runbook>
- <on-call>
`,
  },
  {
    templateId: "cpo_beta_program",
    title: "Beta program plan",
    summary: "Recruit, run, and learn from beta customers.",
    category: "cpo",
    body: `Beta Program Plan

Goal
- <learning objective>

Participants
- <target customers>

Plan
- <timeline>
- <feedback cadence>

Success
- <exit criteria>
`,
  },
];
