export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // API для ИИ-анализа тренировки
    if (url.pathname === '/api/analyze' && request.method === 'POST') {
      try {
        const payload = await request.json();
        const language = payload.language === 'en' ? 'en' : 'uk';
        const { language: _language, ...workout } = payload;

        if (!env.OPENAI_API_KEY) {
          return new Response(
            JSON.stringify({ error: language === 'en' ? 'OPENAI_API_KEY is not configured' : 'OPENAI_API_KEY не настроен' }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }

        const response = await fetch(
          'https://api.openai.com/v1/responses',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
              model: 'gpt-5.6-luna',
              input: [
                {
                  role: 'system',
                  content:
                    language === 'en'
                      ? 'You are a professional running coach. Analyze the runner\'s workout using the provided data. Give practical, clear, and honest feedback without medical diagnoses. Respond in English.'
                      : 'Ти професійний тренер з бігу. Аналізуй тренування бігуна на основі наданих даних. Давай практичний, зрозумілий і чесний аналіз без медичних діагнозів. Відповідай українською мовою.'
                },
                {
                  role: 'user',
                  content: language === 'en'
                    ? `Analyze this running workout as a professional coach.

WORKOUT DATA:
${JSON.stringify(workout, null, 2)}

WHAT MATTERS MOST:
The workout contains a "splits" array with kilometer splits.

You must analyze their dynamics:
- how pace changed from kilometer to kilometer;
- whether the pace was even;
- where there were accelerations or slowdowns;
- how heart rate changed with pace;
- whether heart rate increased at the same or slower pace;
- always include "bpm" after every heart-rate value or range (for example, "163 bpm" or "170–176 bpm");
- whether there are signs of a positive or negative split;
- how cadence changed;
- whether climbs could have affected pace;
- which kilometer was the fastest;
- which was the slowest;
- how consistently the workout was executed.

Do not invent data that is not present.

Answer in English using exactly this structure:

1. SCORE — X/10

2. WHAT HAPPENED
Briefly describe the workout based on the numbers.

3. SPLIT ANALYSIS
Analyze the dynamics of each important segment and the overall pace consistency.

4. PACE + HEART RATE
Explain how pace and heart rate related to each other.

5. WHAT WAS DONE WELL
Specific strengths of the workout.

6. WHAT COULD BE IMPROVED
Specific things the runner can change.

7. LOAD
Assess the overall training load considering distance, duration, pace, heart rate, and split characteristics.

8. RECOVERY
What you recommend doing after this workout.

9. COACH'S CONCLUSION
2–4 sentences with the main takeaway.

Do not make medical diagnoses.`
                    : `Проаналізуй це бігове тренування як професійний тренер.

ДАНІ ТРЕНУВАННЯ:
${JSON.stringify(workout, null, 2)}

ОСОБЛИВО ВАЖЛИВО:
У тренуванні є масив "splits" — покілометрові спліти.

Обов'язково проаналізуй їхню динаміку:
- як змінювався темп від кілометра до кілометра;
- чи був рівний темп;
- де були прискорення або просадки;
- як змінювався пульс разом із темпом;
- чи зростав пульс при незмінному або повільнішому темпі;
- чи є ознаки позитивного або негативного спліту;
- як змінювався каденс;
- чи могли підйоми вплинути на темп;
- який кілометр був найшвидшим;
- який був найповільнішим;
- наскільки стабільно виконана робота.

Не вигадуй дані, яких немає.

Дай відповідь українською у такій структурі:

1. ОЦІНКА — X/10

2. ЩО ВІДБУЛОСЯ
Коротко опиши тренування на основі цифр.

3. АНАЛІЗ СПЛІТІВ
Проаналізуй динаміку кожного важливого відрізка та загальну стабільність темпу.

4. ТЕМП + ПУЛЬС
Поясни, як співвідносилися темп і пульс.

5. ЩО ЗРОБЛЕНО ДОБРЕ
Конкретні сильні сторони тренування.

6. ЩО МОЖНА ПОКРАЩИТИ
Конкретні речі, які бігун може змінити.

7. НАВАНТАЖЕННЯ
Оціни загальне тренувальне навантаження з урахуванням дистанції, тривалості, темпу, пульсу та характеру сплітів.

8. ВІДНОВЛЕННЯ
Що рекомендуєш зробити після цього тренування.

9. ВИСНОВОК ТРЕНЕРА
2–4 речення з головним висновком.

Не став медичних діагнозів.`
                }
              ]
            })
          }
        );

        const data = await response.json();

        if (!response.ok) {
          return new Response(
            JSON.stringify({
              error: data.error?.message || (language === 'en' ? 'OpenAI API error' : 'Помилка OpenAI API')
            }),
            {
              status: response.status,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }

        return new Response(
          JSON.stringify({
            analysis:
  data.output
    ?.flatMap(item => item.content || [])
    ?.find(item => item.type === 'output_text')
    ?.text || (language === 'en' ? 'Could not get an analysis' : 'Не вдалося отримати аналіз')
          }),
          {
            headers: { 'Content-Type': 'application/json' }
          }
        );

      } catch (error) {
        return new Response(
          JSON.stringify({
            error: error.message || (language === 'en' ? 'Server error' : 'Помилка сервера')
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Все остальное обслуживает сайт
    return env.ASSETS.fetch(request);
  }
};
