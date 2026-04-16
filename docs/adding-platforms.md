# Adding New Platforms

GigOps uses a scraper plugin pattern — adding a new platform takes about 2 hours.

## Steps

### 1. Create the scraper

```bash
cp src/scrapers/upwork.ts src/scrapers/myplatform.ts
```

Edit `myplatform.ts`:
- Change `platform = 'myplatform'`
- Update `scrapeListingUrl()` with the platform's DOM selectors
- Update `searchListings()` with the search URL pattern
- Update `scrapeClientProfile()` if the platform has client profiles

### 2. Add platform config

```bash
cp config/platforms/upwork.yml config/platforms/myplatform.yml
```

Edit with the platform's selectors and settings.

### 3. Register in index.ts

In `src/index.ts`, add to the `getScraper()` function:

```typescript
case 'myplatform': return new MyPlatformScraper();
```

And in `src/utils/config.ts`, add to `detectPlatform()`:

```typescript
if (url.includes('myplatform.com')) return 'myplatform';
```

### 4. Add skill doc

Create `skills/myplatform.md` documenting platform-specific behaviour.

### 5. Test it

```bash
npx ts-node src/index.ts evaluate https://myplatform.com/job/12345
npx ts-node src/index.ts scan --platform myplatform --keywords "developer" --limit 3
```

## Tips for Writing Scrapers

- **Use DevTools** to find stable selectors (prefer `data-*` attributes over class names)
- **Check for auth gates** — some platforms require login; set `auth_required: true`
- **Handle rate limits** — set `rate_limit_ms` appropriately (1500-3000ms is usually safe)
- **Test with headless: false** first to see what the browser sees
- **Graceful degradation** — always `.catch(() => '')` on optional fields

## Platforms on the Roadmap

- Toptal
- PeoplePerHour
- Guru
- Fiverr (limited — fixed price model)
- LinkedIn Services Marketplace
- Direct job boards (Seek, Indeed)

## Contributing

Open a PR with your new scraper! See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.
