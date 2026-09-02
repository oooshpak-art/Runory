export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // API для ИИ-анализа тренировки
    if (url.pathname === '/api/analyze' && request.method === 'POST') {
      try {
        const workout = await request.json();

        if (!env.OPENAI_API_KEY) {
          return new Response(
            JSON.stringify({ error: 'OPENAI_API_KEY не настроен' }),
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
                    'Ты профессиональный тренер по бегу. Анализируй тренировку бегуна на основе предоставленных данных. Давай практичный, понятный и честный анализ без медицинских диагнозов. Отвечай на украинском языке.'
                },
                {
                  role: 'user',
                  content: `Проаналізуй це бігове тренування як професійний тренер.

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
              error: data.error?.message || 'Помилка OpenAI API'
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
    ?.text || 'Не вдалося отримати аналіз'
          }),
          {
            headers: { 'Content-Type': 'application/json' }
          }
        );

      } catch (error) {
        return new Response(
          JSON.stringify({
            error: error.message || 'Помилка сервера'
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
