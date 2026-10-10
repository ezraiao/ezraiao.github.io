# ezraiao.github.io

Personal site for Ezra Cheng Iao — cybersecurity student and Tier 1 SOC analyst.

Plain HTML, CSS, and JavaScript. No build step.

```
index.html   page content
style.css    layout, colors, light/dark mode
script.js    lab zone explorer, SOAR walkthrough, mobile menu, copy email
assets/      résumé PDF
```

## Publish on GitHub Pages

1. Create a public repo named exactly `ezraiao.github.io`.
2. Upload `index.html`, `style.css`, `script.js`, and the `assets` folder to the repo root.
3. Settings → Pages → Source: "Deploy from a branch", branch `main`, folder `/ (root)`.
4. After a minute the site is live at https://ezraiao.github.io

## Updating

- Text: edit `index.html`.
- Lab zones: edit the `ZONES` object at the top of `script.js`.
- Résumé: replace `assets/Ezra_Cheng_Iao_Resume.pdf` (keep the same file name).
