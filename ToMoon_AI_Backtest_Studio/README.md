# ToMoon AI Backtest Studio

A new standalone project folder for AI-native strategy building and backtesting.

## What this project includes

- Real LLM integration (OpenAI-compatible `/chat/completions` API)
- Strategy JSON schema validation
- Live strategy canvas rendering in frontend
- Pre-backtest confirmation modal (payload + risk + engine mode)
- Dedicated backend endpoint for condition-code backtest (no component-stage validation)
- OHLCV data from Dukascopy with synthetic fallback

## Architecture

- `backend/`:
  - `main.py`: FastAPI server + API routes + static serving
  - `app/llm_client.py`: LLM parser
  - `app/strategy_schema.py`: JSON extraction + schema validation
  - `app/data_provider.py`: Dukascopy OHLCV provider
  - `app/backtest_engine.py`: condition execution and PnL loop
- `frontend/`:
  - `index.html`: chat + canvas + config + confirm modal + results
  - `app.js`: orchestration and API calls
  - `styles.css`: layout and styling

## API routes

- `GET /api/health`
- `GET /api/early-access/db-health`
- `POST /api/agent/parse`
- `GET /api/market-data/bars`
- `POST /api/backtest/condition/run`
- `POST /api/early-access/subscribe`

## Run

1. Open terminal in `ToMoon_AI_Backtest_Studio/backend`
2. Create and activate a virtual env (recommended)
3. Install deps:

```bash
pip install -r requirements.txt
```

4. Copy `.env.example` to `.env` and set required variables.
5. Start server:

```bash
python main.py
```

6. Open browser at:

- `http://localhost:8100`

## Notes

- If Dukascopy fetch fails, backend auto-falls back to synthetic OHLCV, so demo still runs.
- For production, move API key usage fully to backend and avoid exposing keys in frontend.
- To enable real early-access emails from landing page, configure SMTP variables in `backend/.env`:
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`
  - `SMTP_FROM_EMAIL`, optional `SMTP_FROM_NAME`, `SMTP_USE_TLS`
- To persist early-access subscribers in PostgreSQL, configure either:
  - `DATABASE_URL` (recommended), or
  - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, optional `DB_SSLMODE`, `DB_CONNECT_TIMEOUT`
