'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackOrganicEvent } from '@/lib/analytics';

function bpmFromPath(pathname: string): number | null {
  const match = pathname.match(/\/(130|135|140|145|150|155|160|165|170|175|180)-bpm(?:\/|$)/);
  return match ? Number(match[1]) : null;
}

export function OrganicDiscoveryAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname.startsWith('/cadenz/running-music')) return;
    trackOrganicEvent('seo_landing_view', {
      intent: pathname === '/cadenz/running-music' ? 'running music by BPM' : 'BPM running music',
      bpm: bpmFromPath(pathname),
      destination_type: 'cadenz_collection',
      source_position: 'landing',
    });
  }, [pathname]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-organic-cta]') : null;
      if (!target) return;
      trackOrganicEvent('seo_cta_clicked', {
        bpm: bpmFromPath(pathname),
        destination_type: target.dataset.destinationType || 'internal',
        source_position: target.dataset.sourcePosition || 'content',
      });
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [pathname]);

  return null;
}
