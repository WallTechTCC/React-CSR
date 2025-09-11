import { useEffect } from 'react';
import {
  onCLS,
  onINP,
  onLCP,
  onFCP,
  onTTFB,
  type MetricWithAttribution,
} from 'web-vitals/attribution';
import { sendWebVital } from '../lib/webVitals';

type AnyMetric = MetricWithAttribution;

export default function WebVitals() {
  useEffect(() => {
    const report = (metric: AnyMetric) => {
      void sendWebVital({
        id: metric.id,
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        navigationType: metric.navigationType,
        attribution: metric.attribution,
        entries: metric.entries,
        ts: Date.now(),
      }).catch(() => {});
    };

    onCLS(report);
    onINP(report);
    onLCP(report);
    onFCP(report);
    onTTFB(report);
  }, []);

  return null;
}
