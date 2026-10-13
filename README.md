# Prompt Brawl

[![Made with pollinations.ai](https://raw.githubusercontent.com/pollinations/pollinations/main/packages/ui/src/brand/badge-made-with.svg)](https://pollinations.ai/?ref=badge)

**Describe a fighter in one line. Watch it brawl.**

Play: **https://lotxo1.github.io/prompt-brawl/**

Type one line, like *"a grandma with a cast-iron frying pan who never loses her cool"*. The AI designs the whole fighter from it (name, portrait, stats, three moves, a quirk and a weakness) and throws it into a short, commentated battle. Clever descriptions win: the referee sets the odds from what the fighters are, so exploiting a weakness beats raw stats, and each fighter's dice decide the rest, so a lucky underdog can still pull off an upset.

- **Ladder:** six challengers, from a sleepy 3 a.m. cat to a storm cloud made of Monday mornings.
- **Daily boss:** a new boss every day.
- **Commentary:** turn-by-turn play-by-play, read aloud if you turn the voice on.
- **Share a fight:** every fight has a link that replays it for anyone, no sign-in needed.
- **Any language:** write your fighter in Spanish, Japanese or anything else and the fight is commentated in that language. The interface is in English and Spanish.

## Bring your own Pollen

Players sign in with their own Pollinations account (Connect User Wallets, OAuth code flow with PKCE, no backend) and pay with their own Pollen, so no shared key runs dry. A fight costs about 0.01 Pollen; new Pollinations accounts get free Pollen to start.

| What | Model |
|------|-------|
| Fighter design and fight | `openai/gpt-6-luna` (falls back to `openai/gpt-5.4-nano`) |
| Portraits | `tongyi-mai/z-image-turbo` (falls back to `black-forest-labs/flux.1-schnell`) |
| Voice | `openai/tts-1` |

## How it works

- `game.js` asks the text model for a fighter sheet as JSON, then normalizes it: stats always add up to 22, so no fighter is simply stronger.
- The fight prompt gets both sheets plus five d20 rolls per fighter. A coin flip puts the player's fighter in either corner, so the model can't favor whoever is listed first. The game then makes the damage add up to an exact knockout.
- Share links carry the whole fight, compressed in the URL fragment, so replays cost nothing and nothing is stored on a server.
- Model text is always rendered as text, never as HTML, and shared links are validated (portraits must come from `media.pollinations.ai`).

It's a static site: `index.html`, `game.js` and `styles.css`, no build step. To run it locally, serve the folder at `http://localhost:5179/` (that redirect URI is registered for the App Key) or swap in your own App Key from [enter.pollinations.ai](https://enter.pollinations.ai).

## License

MIT
