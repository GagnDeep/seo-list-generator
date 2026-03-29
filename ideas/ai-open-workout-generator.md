# AI Open Workout Generator

## What
Open source, self-hosted AI that generates personalized workout programs based on user goals, equipment, and experience level.

## Why
No credible open source option exists. TrainHeroic, Fitbod, and JuggernautAI are all SaaS-only with subscription models. Fitness professionals and self-hosters need an alternative.

## Market Gap
- TrainHeroic: $30+/month, closed source, enterprise-focused
- Fitbod: $100+/year, proprietary algorithm, no API
- JuggernautAI: $25/month, powerlifting focused only
- **Gap**: No free, open source option that combines AI generation with exercise science

## Tech Stack
- **Backend**: Python, FastAPI
- **Database**: SQLite (simple deployment)
- **AI**: LangChain for workout logic, could integrate with Ollama for local LLM
- **Exercise Data**: Integration with wger.de API (open exercise database)
- **Frontend**: Optional React or just API-first

## What's Close
- [wger](https://github.com/wger-project/wger) - Open source workout manager, but no AI generation
- [Exercism](https://exercism.org) - Exercise database, not workout generation
- [Strong](https://www.strong.app) - App but closed source
- No real open source AI workout generator exists

## Revenue Model
- Self-host for individuals (free)
- Hosting SaaS for gyms (premium tier)
- Plugin marketplace for specialized programs (powerlifting, yoga, rehab)

## Priority
[READY]

## Status History
- 2026-03-29: Created - identified as highest priority gap in fitness SaaS market
- 2026-03-29: [IMPLEMENTED] - https://github.com/GagnDeep/ai-workout-generator-mvp
