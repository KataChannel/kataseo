module.exports=[15270,e=>{"use strict";e.s(["prisma",()=>r]);var t=e.i(29173);let r=globalThis.prisma??new t.PrismaClient({log:["query"]})},29173,(e,t,r)=>{t.exports=e.x("@prisma/client",()=>require("@prisma/client"))},18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},20635,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/action-async-storage.external.js",()=>require("next/dist/server/app-render/action-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},61724,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-route-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-route-turbo.runtime.prod.js"))},78978,(e,t,r)=>{},92936,e=>{"use strict";e.s(["handler",()=>A,"patchFetch",()=>q,"routeModule",()=>R,"serverHooks",()=>S,"workAsyncStorage",()=>E,"workUnitAsyncStorage",()=>C],92936);var t=e.i(47909),r=e.i(74017),a=e.i(96250),n=e.i(59756),o=e.i(61916),s=e.i(69741),i=e.i(16795),l=e.i(87718),p=e.i(95169),d=e.i(47587),u=e.i(66012),c=e.i(70101),m=e.i(26937),g=e.i(10372),h=e.i(93695);e.i(52474);var x=e.i(220);e.s(["GET",()=>v],74492);var w=e.i(89171),y=e.i(15270);async function v(){try{let e=process.env.NEXT_PUBLIC_BASE_URL||"http://localhost:3000",t=await y.prisma.post.findMany({where:{status:"PUBLISHED"},select:{slug:!0,updatedAt:!0,createdAt:!0},orderBy:{updatedAt:"desc"}}),r=await y.prisma.category.findMany({select:{slug:!0,_count:{select:{posts:{where:{status:"PUBLISHED"}}}}}}),a=await y.prisma.tag.findMany({select:{slug:!0,_count:{select:{posts:{where:{status:"PUBLISHED"}}}}}}),n=`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  
  <!-- Homepage -->
  <url>
    <loc>${e}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Static pages -->
  <url>
    <loc>${e}/about</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>${e}/contact</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

  <!-- Blog/Posts -->
  <url>
    <loc>${e}/blog</loc>
    <lastmod>${t.length>0?t[0].updatedAt.toISOString():new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Dynamic posts -->
${t.map(t=>`  <url>
    <loc>${e}/blog/${t.slug}</loc>
    <lastmod>${t.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join("\n")}

  <!-- Category pages -->
${r.filter(e=>e._count.posts>0).map(t=>`  <url>
    <loc>${e}/category/${t.slug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`).join("\n")}

  <!-- Tag pages -->
${a.filter(e=>e._count.posts>0).map(t=>`  <url>
    <loc>${e}/tag/${t.slug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`).join("\n")}

</urlset>`;return new w.NextResponse(n,{status:200,headers:{"Content-Type":"application/xml","Cache-Control":"public, max-age=3600, stale-while-revalidate=86400"}})}catch(e){return console.error("Error generating sitemap:",e),w.NextResponse.json({error:"Failed to generate sitemap"},{status:500})}}var f=e.i(74492);let R=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/sitemap/route",pathname:"/api/sitemap",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/sitemap/route.ts",nextConfigOutput:"",userland:f}),{workAsyncStorage:E,workUnitAsyncStorage:C,serverHooks:S}=R;function q(){return(0,a.patchFetch)({workAsyncStorage:E,workUnitAsyncStorage:C})}async function A(e,t,a){var w;let y="/api/sitemap/route";y=y.replace(/\/index$/,"")||"/";let v=await R.prepare(e,t,{srcPage:y,multiZoneDraftMode:!1});if(!v)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:f,params:E,nextConfig:C,isDraftMode:S,prerenderManifest:q,routerServerContext:A,isOnDemandRevalidate:b,revalidateOnlyGenerated:O,resolvedPathname:$}=v,P=(0,s.normalizeAppPath)(y),T=!!(q.dynamicRoutes[P]||q.routes[$]);if(T&&!S){let e=!!q.routes[$],t=q.dynamicRoutes[P];if(t&&!1===t.fallback&&!e)throw new h.NoFallbackError}let _=null;!T||R.isDev||S||(_="/index"===(_=$)?"/":_);let I=!0===R.isDev||!T,N=T&&!I,j=e.method||"GET",k=(0,o.getTracer)(),D=k.getActiveScopeSpan(),U={params:E,prerenderManifest:q,renderOpts:{experimental:{cacheComponents:!!C.experimental.cacheComponents,authInterrupts:!!C.experimental.authInterrupts},supportsDynamicResponse:I,incrementalCache:(0,n.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:null==(w=C.experimental)?void 0:w.cacheLife,isRevalidate:N,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,a)=>R.onRequestError(e,t,a,A)},sharedContext:{buildId:f}},H=new i.NodeNextRequest(e),M=new i.NodeNextResponse(t),B=l.NextRequestAdapter.fromNodeNextRequest(H,(0,l.signalFromNodeResponse)(t));try{let s=async r=>R.handle(B,U).finally(()=>{if(!r)return;r.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=k.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==p.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let n=a.get("next.route");if(n){let e=`${j} ${n}`;r.setAttributes({"next.route":n,"http.route":n,"next.span_name":e}),r.updateName(e)}else r.updateName(`${j} ${e.url}`)}),i=async o=>{var i,l;let p=async({previousCacheEntry:r})=>{try{if(!(0,n.getRequestMeta)(e,"minimalMode")&&b&&O&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let i=await s(o);e.fetchMetrics=U.renderOpts.fetchMetrics;let l=U.renderOpts.pendingWaitUntil;l&&a.waitUntil&&(a.waitUntil(l),l=void 0);let p=U.renderOpts.collectedTags;if(!T)return await (0,u.sendResponse)(H,M,i,U.renderOpts.pendingWaitUntil),null;{let e=await i.blob(),t=(0,c.toNodeOutgoingHttpHeaders)(i.headers);p&&(t[g.NEXT_CACHE_TAGS_HEADER]=p),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==U.renderOpts.collectedRevalidate&&!(U.renderOpts.collectedRevalidate>=g.INFINITE_CACHE)&&U.renderOpts.collectedRevalidate,a=void 0===U.renderOpts.collectedExpire||U.renderOpts.collectedExpire>=g.INFINITE_CACHE?void 0:U.renderOpts.collectedExpire;return{value:{kind:x.CachedRouteKind.APP_ROUTE,status:i.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:a}}}}catch(t){throw(null==r?void 0:r.isStale)&&await R.onRequestError(e,t,{routerKind:"App Router",routePath:y,routeType:"route",revalidateReason:(0,d.getRevalidateReason)({isRevalidate:N,isOnDemandRevalidate:b})},A),t}},h=await R.handleResponse({req:e,nextConfig:C,cacheKey:_,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:q,isRoutePPREnabled:!1,isOnDemandRevalidate:b,revalidateOnlyGenerated:O,responseGenerator:p,waitUntil:a.waitUntil});if(!T)return null;if((null==h||null==(i=h.value)?void 0:i.kind)!==x.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==h||null==(l=h.value)?void 0:l.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});(0,n.getRequestMeta)(e,"minimalMode")||t.setHeader("x-nextjs-cache",b?"REVALIDATED":h.isMiss?"MISS":h.isStale?"STALE":"HIT"),S&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let w=(0,c.fromNodeOutgoingHttpHeaders)(h.value.headers);return(0,n.getRequestMeta)(e,"minimalMode")&&T||w.delete(g.NEXT_CACHE_TAGS_HEADER),!h.cacheControl||t.getHeader("Cache-Control")||w.get("Cache-Control")||w.set("Cache-Control",(0,m.getCacheControlHeader)(h.cacheControl)),await (0,u.sendResponse)(H,M,new Response(h.value.body,{headers:w,status:h.value.status||200})),null};D?await i(D):await k.withPropagatedContext(e.headers,()=>k.trace(p.BaseServerSpan.handleRequest,{spanName:`${j} ${e.url}`,kind:o.SpanKind.SERVER,attributes:{"http.method":j,"http.target":e.url}},i))}catch(t){if(D||t instanceof h.NoFallbackError||await R.onRequestError(e,t,{routerKind:"App Router",routePath:P,routeType:"route",revalidateReason:(0,d.getRevalidateReason)({isRevalidate:N,isOnDemandRevalidate:b})}),T)throw t;return await (0,u.sendResponse)(H,M,new Response(null,{status:500})),null}}}];

//# sourceMappingURL=%5Broot-of-the-server%5D__c181f922._.js.map