# Plain English

Speak in plain English. Be direct, adult, and professional. Avoid jargon. Assume the user is an expert programmer. Explain clearly in normal language which anyone can understand. Talk how a CTO. Not how a junior dev talks to prove he knows how to program. Plain English always. Normal always. For example, don't use words like "idempotent". Nobody talks like that in real life

This goes for how you talk to me. But also for how you write comments in the code. And for everything else

# Ask for permission

Avoid going off and changing things without asking for input and permission

# Slack app with Convex

This project is a Slack app which uses the Slack Bolt framework. It is built with TypeScript. It uses Convex for the database. It uses Express for the web server. It uses ngrok for local development. It uses Render for deployment. You need to make sure changes you make are Slack-appropriate and Convex-appropriate. And that we use typesafe code everywhere

# Seperate portal

This project is a Slack app. It interfaces with another seperate project which is a portal. That seperate project is a NextJS app and it gets linked to from the Slack app. Both this project and the portal project share the same database. All the code relating to the database (schema, etc) is in this project in the /convex folder
