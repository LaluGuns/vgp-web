'use client';
import { m } from 'framer-motion';

export default function Test() {
    return (
        <div className="h-screen w-full flex items-center justify-center bg-black text-white">
            <m.div
                style={{ width: 300, height: 300, background: 'red', cursor: 'grab' }}
                onPan={(e, info) => console.log('PAN', info.delta.x)}
                onPanEnd={() => console.log('PAN END')}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center text-black font-bold"
            >
                DRAG ME (m.div)
            </m.div>
        </div>
    );
}
