export default {
  async fetch(request) {
    return new Response(`
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Runner OS</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: #f5f5f5;
            margin: 0;
            padding: 40px 20px;
            text-align: center;
          }

          .container {
            max-width: 700px;
            margin: auto;
            background: white;
            padding: 40px 25px;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          }

          h1 {
            font-size: 42px;
            margin-bottom: 10px;
          }

          p {
            color: #666;
            font-size: 18px;
          }

          .status {
            margin-top: 30px;
            padding: 20px;
            background: #eee;
            border-radius: 12px;
            font-size: 18px;
          }
        </style>
      </head>

      <body>
        <div class="container">
          <h1>🏃 Runner OS</h1>
          <p>Инструменты для бегунов</p>

          <div class="status">
            🚀 Runner OS запущен
          </div>
        </div>
      </body>
      </html>
    `, {
      headers: {
        "content-type": "text/html;charset=UTF-8"
      }
    });
  }
};
