const http = require('http');

const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PartySally - Multiplayer Party Games</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      background: linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #a855f7 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      color: white;
      font-family: system-ui, -apple-system, sans-serif;
    }
    h1 { font-size: clamp(2rem, 8vw, 5rem); margin-bottom: 20px; text-shadow: 0 4px 20px rgba(0,0,0,0.3); }
    p { font-size: clamp(1rem, 3vw, 1.5rem); opacity: 0.9; margin-bottom: 40px; text-align: center; }
    .container {
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 30px;
      text-align: center;
      max-width: 500px;
      width: 100%;
    }
    h2 { font-size: 1.5rem; margin-bottom: 20px; }
    .buttons { display: flex; flex-direction: column; gap: 15px; }
    button {
      border: none;
      padding: 15px 30px;
      border-radius: 12px;
      font-size: 1.1rem;
      font-weight: bold;
      cursor: pointer;
      color: white;
    }
    .green { background: #10b981; }
    .orange { background: #f59e0b; }
    .red { background: #ef4444; }
    .footer { margin-top: 40px; opacity: 0.7; font-size: 0.9rem; }
  </style>
</head>
<body>
  <h1>🎉 PartySally</h1>
  <p>TV mostra il gioco • Smartphone sono i controller</p>
  <div class="container">
    <h2>🎮 Giochi Disponibili</h2>
    <div class="buttons">
      <button class="green">🃏 Comic Hazard</button>
      <button class="orange">🎪 Mercante in Fiera</button>
      <button class="red">🎴 UNO</button>
    </div>
  </div>
  <p class="footer">Crea una stanza e condividi il codice con i tuoi amici!</p>
</body>
</html>`;

const server = http.createServer((req, res) => {
  console.log('Request:', req.url);
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-cache'
  });
  res.end(html);
});

server.listen(3000, '0.0.0.0', () => {
  console.log('Server running on http://0.0.0.0:3000');
});
