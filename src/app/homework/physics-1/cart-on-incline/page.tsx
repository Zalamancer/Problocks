// /homework/physics-1/cart-on-incline — AP Physics 1 homework page.
//
// This route renders the real student-facing homework page (responsive
// desktop/mobile), not the design-bundle preview. The design preview that
// wraps this in a mock browser chrome + phone frame lives elsewhere in the
// repo as APProbePage and is used for showcase screenshots only.

import { HomeworkPage } from '@/components/homework/ap-probe/HomeworkPage';
import { FRQ_CART_ON_INCLINE } from '@/components/homework/ap-probe/frq-content';

export const metadata = {
  title: 'AP Physics · Homework · Cart on an Incline',
};

export default function CartOnInclineHomeworkPage() {
  return <HomeworkPage frq={FRQ_CART_ON_INCLINE} />;
}
