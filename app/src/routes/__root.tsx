import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet, Link, useRouter, HeadContent, Scripts } from '@tanstack/react-router';
import { useEffect, type ReactNode } from 'react';
import appCss from '../styles.css?url';
import { reportHiggsfieldError } from '../lib/higgsfield-error-reporting';
import appMetaJson from '../app-meta.json';

declare const __HF_DESIGN_INSPECTOR__: boolean;

const meta = appMetaJson as {og_title:string; og_description:string; og_image_url:string; favicon_url:string};
const site = 'https://ana-international-llc.higgsfield.app';

export const Route = createRootRouteWithContext<{queryClient:QueryClient}>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: meta.og_title },
      { name: 'description', content: meta.og_description },
      { property: 'og:title', content: meta.og_title },
      { property: 'og:description', content: meta.og_description },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'Ana International Group LLC' },
      { property: 'og:url', content: site },
      { property: 'og:image', content: site+meta.og_image_url },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:image', content: site+meta.og_image_url },
      { name: 'theme-color', content: '#101D32' }
    ],
    links: [
      { rel: 'stylesheet', href:appCss },
      { rel: 'icon', href:meta.favicon_url, type: 'image/svg+xml' },
      { rel: 'apple-touch-icon', href:'/assets/apple-touch-icon.png' },
      { rel: 'manifest', href:'/site.webmanifest' },
      { rel: 'preconnect', href:'https://fonts.googleapis.com' },
      { rel: 'preconnect', href:'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href:'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap' }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: ErrorView,
});

function RootShell({children}:{children:ReactNode}) {
  return <html lang="en"><head><HeadContent/></head><body>{children}<Scripts/></body></html>;
}
function RootComponent(){
  const {queryClient} = Route.useRouteContext();
  useEffect(() => {
    if (!__HF_DESIGN_INSPECTOR__) return;
    void import('../module/design-inspector/runtime').then(({installHiggsfieldDesignInspector}) => {
      installHiggsfieldDesignInspector();
    }).catch((error) => reportHiggsfieldError(error instanceof Error ? error : new Error('Inspector unavailable'),{boundary:'inspector_import'}));
  },[]);
  return <QueryClientProvider client={queryClient}><Outlet/></QueryClientProvider>;
}
function NotFound(){
  return <main className="page-state"><span className="state-mark">ANA / 404</span><h1>Wrong turn?</h1><p>The page you requested could not be found.</p><Link to="/">Back to homepage</Link></main>;
}
function ErrorView({error,reset}:{error:Error;reset:()=>void}){
  const router=useRouter();
  useEffect(()=>{ reportHiggsfieldError(error,{boundary:'root_error'}); },[error]);
  return <main className="page-state"><span className="state-mark">ANA / SERVICE</span><h1>Something went wrong.</h1><p>Please refresh the page or return home.</p><button onClick={()=>{router.invalidate();reset()}}>Try again</button></main>;
}
