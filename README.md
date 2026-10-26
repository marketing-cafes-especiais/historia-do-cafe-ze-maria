# Landing page Zé Maria Cafés Especiais

Landing page sobre a história e o preparo do café Zé Maria, exportada do Figma Make e publicada via GitHub Pages.

## Vídeo da história

A seção "História" tem um espaço reservado para o vídeo. Para inserir o vídeo do YouTube:

1. Abra `src/App.tsx`.
2. Encontre a constante `historyVideoEmbedUrl` no topo do arquivo.
3. Cole o link de incorporação do vídeo, por exemplo:
   ```ts
   const historyVideoEmbedUrl = "https://www.youtube.com/embed/SEU_ID_AQUI"
   ```
4. Faça commit e push na branch `main` — o GitHub Actions builda e publica automaticamente.

## Desenvolvimento local

```bash
pnpm install
pnpm dev
```

## Publicação

O deploy para o GitHub Pages acontece automaticamente a cada push na branch `main` (veja `.github/workflows/deploy.yml`).
