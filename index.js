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
                  content: `Проаналізуй це тренування:

${JSON.stringify(workout, null, 2)}

Дай:
1. Оцінку тренування від 1 до 10.
2. Короткий загальний висновок.
3. Що було зроблено добре.
4. Що можна покращити.
5. Оцінку навантаження.
6. Що рекомендуєш зробити для відновлення.
7. Чи є щось підозріле або таке, на що бігуну варто звернути увагу.

Не вигадуй дані, яких немає у тренуванні.`
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
            analysis: data.output?.[0]?.content?.[0]?.text || 'Не вдалося отримати аналіз'
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
