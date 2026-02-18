import { getHeadAssets, getHeadScripts, getBodyEndScripts } from "./head-assets.ts";

export function generateHtml(importMap: object): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Brew Coffee Roasters</title>
${getHeadAssets()}
  <script type="importmap">
${JSON.stringify(importMap, null, 2)}
  </script>
${getHeadScripts()}
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/client/bootstrap.tsx"></script>
  <script>
  !function(){
    var last=0,pending=false;
    window.__hmrVersion=0;
    var es=new EventSource("/__events");
    es.onmessage=function(e){
      try{var d=JSON.parse(e.data)}catch(x){return}
      if(d.type==="connected"){window.__hmrVersion=d.version;return}
      if(d.type!=="reload")return;
      window.__hmrVersion=d.version;
      var elapsed=Date.now()-last;
      if(elapsed>=1000){last=Date.now();pending=false;location.reload()}
      else if(!pending){pending=true;setTimeout(function(){last=Date.now();pending=false;location.reload()},1000-elapsed)}
    };
    es.onerror=function(){console.warn("[hmr] SSE connection lost, reconnecting...")};
  }();
  </script>
${getBodyEndScripts()}
</body>
</html>`;
}
