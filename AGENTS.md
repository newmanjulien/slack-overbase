# Seperate portal

This project is a Slack app. It interfaces with another seperate project which is a portal. That seperate project is a NextJS app and it gets linked to from the Slack app. Both this project and the portal project share the same database. All the code relating to the database (schema, etc) is in this project in the /convex folder

# Don't screw up the portal

# IMPORTANT

Be careful when making changes to the database schema. It's possible to break the portal. Always think about the portal when making changes to the database schema. When in doubt, ask me or check the portal code: /Users/juliennewman/Documents/slack-portal

# Elegant, robust and type safe

Our goal is to make the most elegant and simple solution possible. But we also want it to be robust (scalable is not all that important...but brittle is very bad). And we want to make sure everything is type safe (full-stack type safety). We don't want to overcomplicate things, but we also don't want to make compromises that will cause problems down the line

# Plain English

Speak in plain English. Be direct, adult, and professional. Avoid jargon. Assume the user is an expert programmer. Explain clearly in normal language which anyone can understand. Talk how a CTO. Not how a junior dev talks to prove he knows how to program. Plain English always. Normal always. For example, don't use words like "idempotent". Nobody talks like that in real life

This goes for how you talk to me. But also for how you write comments in the code. And for everything else

# Ask for permission

Avoid going off and changing things without asking for input and permission
