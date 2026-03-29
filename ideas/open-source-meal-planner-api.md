# Open Source Meal Planner API

## What
API + basic UI for AI-powered meal planning using OpenFoodFacts database. Generates weekly meal plans based on macros, dietary restrictions, and budget.

## Why
No good open source meal planning option exists. MyFitnessPal is data-harvesting ads. Mealime and Fresh n' Lean are subscription-only. Nutrition planning is dominated by SaaS.

## Market Gap
- MyFitnessPal: Free but ads + data harvesting, no meal planning
- Mealime: $10/month, closed source, no API
- Fresh n' Lean: $12+/meal, no control
- **Gap**: Self-hosted meal planning with AI that respects privacy

## Tech Stack
- **Backend**: Python, FastAPI
- **Database**: SQLite with OpenFoodFacts data (cached)
- **AI**: LangChain or local LLM via Ollama for meal generation
- **Frontend**: React (simple SPA)
- **Nutrition Data**: OpenFoodFacts API (free, open)

## What's Close
- [OpenFoodFacts](https://world.openfoodfacts.org) - Database but no planning
- [Cronometer](https://cronometer.com) - Good but closed source
- [Eat This Much](https://eathismuch.com) - Good but SaaS-only
- [MealPrep Sunday](https://mealprepsunday.com) - Not a software tool

## Revenue Model
- Self-host for individuals (free)
- Recipe marketplace (premium curated plans)
- Integration with meal delivery services (affiliate)

## Priority
[READY]

## Status History
- 2026-03-29: Created - strong open source foundation with OpenFoodFacts
- 2026-03-29: [IMPLEMENTED] - https://github.com/GagnDeep/ai-meal-planner-api-mvp
