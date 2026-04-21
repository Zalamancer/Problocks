// /homework/physics-1/cart-on-incline — AP Probe homework view.
// Ported from the Claude Design bundle "Problocks AP Probe" under
// docs/design-bundles (see README in the bundle). The drill/mobile and
// desktop layouts live under src/components/homework/ap-probe; this page
// just routes to the responsive shell.

import { FRQ_CART_ON_INCLINE } from '@/components/homework/ap-probe/frq-content';
import { HomeworkShell } from '@/components/homework/ap-probe/HomeworkShell';

export const metadata = {
  title: 'AP Physics · Homework · Cart on an Incline',
};

export default function APProbeHomeworkPage() {
  return <HomeworkShell frq={FRQ_CART_ON_INCLINE} />;
}
