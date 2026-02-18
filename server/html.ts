export function generateHtml(importMap: object): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>no-build-next</title>
  <script type="importmap">
${JSON.stringify(importMap, null, 2)}
  </script>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/client/bootstrap.tsx"></script>
</body>
</html>`;
}
