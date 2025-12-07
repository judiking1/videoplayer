import { useEffect } from 'react';

export default function AdBanner() {
    // const adRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // In a real implementation, you would push the ad to the adsbygoogle array here
        // (window.adsbygoogle = window.adsbygoogle || []).push({});
        console.log("AdSense banner mounted");
    }, []);

    return (
        <div className="w-full h-[90px] bg-zinc-900 border-t border-white/10 flex items-center justify-center overflow-hidden shrink-0">
            <div className="text-zinc-600 text-xs font-mono border border-dashed border-zinc-700 p-4 rounded">
                Admin Email
                <br />
                (judiking1@naver.com)
            </div>
            {/* 
            <ins className="adsbygoogle"
                 style={{ display: 'block' }}
                 data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                 data-ad-slot="XXXXXXXXXX"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins> 
            */}
        </div>
    );
}
