# AI Teacher Assistant — Self-Hosted

## What It Would Be
A self-hosted AI assistant specifically built for teachers: lesson plan generator, quiz/test builder, student progress summarizer, and parent communication drafter. Teachers input grade level, subject, and topic → get a structured lesson plan with objectives, activities, and assessment ideas. Input student names and grades → get progress summaries ready to copy into parent emails.

## Why This Doesn't Exist
Most "AI for education" tools are either:
1. Full LMS platforms (Canvas, Google Classroom) with basic AI chatbots bolted on
2. Privacy-hostile SaaS that collects student data
3. Expensive per-seat licenses that schools can't afford
4. Generic ChatGPT wrappers that teachers have to prompt-engineer themselves

No credible open-source, self-hosted option exists that understands teacher's workflow specifically.

## Market Gap
- 76M+ K-12 teachers globally (US alone: 3.7M)
- Average teacher spends 50+ hours/week on lesson prep and administrative tasks
- School budgets are tight — free self-hosted tools have massive appeal
- FERPA/GDPR concerns make cloud AI tools unusable for many schools
- Teachers are time-poor but have steady internet — perfect for AI assistance

## Tech Stack
- **Backend:** Python/FastAPI
- **AI:** Ollama (self-hosted LLMs like Llama 3 or Mistral) or free OpenAI-compatible APIs
- **Frontend:** Simple HTML/CSS dashboard — no build step, runs on any school server
- **Database:** SQLite (zero config, works on old hardware)
- **Export:** PDF generation with ReportLab for printable lesson plans

## What's Close
- **Tutorsp ace:** Proprietary AI tutoring but not lesson planning
- **Khan Academy:** Free but not self-hostable and not for teachers' admin work
- **Canva AI:** Not designed for lesson planning workflow
- **Magic School AI:** Proprietary SaaS, $30+/month, data privacy concerns
- **GitHub:** No open-source teacher AI assistant repo exists

## Revenue Model
- Completely free and open source (donations welcome)
- Schools can self-host on old laptops or Raspberry Pi clusters
- Could offer a "Teacher Tools Suite" hosted version for districts that don't want to self-host
- Differentiator: privacy-first, FERPA-compliant by design

## MVP Scope
1. `POST /lesson-plan` — input: subject, grade level, topic, duration → output: structured lesson plan (objectives, materials, activities, assessment)
2. `POST /quiz` — input: topic, grade level, num_questions, format (multiple choice/short answer) → output: ready-to-print quiz
3. `POST /student-summary` — input: student name, grades/notes → output: formatted parent email paragraph
4. `POST /rubric` — input: assignment name, criteria → output: grading rubric table

## Key Files
- `app/main.py` — FastAPI app
- `app/lesson_planner.py` — Lesson plan generation logic
- `app/quiz_builder.py` — Quiz generation
- `app/email_drafter.py` — Student summary emails
- `app/rubric_maker.py` — Rubric generation
- `templates/lesson_plan.html` — Printable template
- `requirements.txt`
- `README.md`
