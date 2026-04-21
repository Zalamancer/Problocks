// /homework/physics-1/cart-on-incline — AP Probe preview page.
// Ported from the Claude Design bundle "Problocks AP Probe"
// (api.anthropic.com/v1/design/h/Wi9aBcAxP08B6nV7vIt-vQ).
//
// Matches the design's preview surface: a cream radial-gradient backdrop
// with the ProBlocks header pill on top, a macOS-style ChromeWindow around
// the desktop homework two-column layout, and a footnote below. The Phone
// toggle swaps to a PhoneFrame + mobile homework view.

import { APProbePage } from '@/components/homework/ap-probe/APProbePage';
import { FRQ_CART_ON_INCLINE } from '@/components/homework/ap-probe/frq-content';

export const metadata = {
  title: 'AP Physics · Homework · Cart on an Incline',
};

export default function APProbeHomeworkPage() {
  return <APProbePage frq={FRQ_CART_ON_INCLINE} />;
}
