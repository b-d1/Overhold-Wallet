import { trigger, animate, style, query, transition, group } from '@angular/animations';

export const routerTransition = trigger('routerTransition', [
  transition('* => *', [
      query(':enter', [
              style({ opacity: 0 })
          ], { optional: true }
      ),
      group([
          query(':leave', [
                  animate(1000, style({ opacity: 0 }))
              ],
              { optional: true }
          ),
          query(':enter', [
                  style({ opacity: 0 }),
                  animate(1000, style({ opacity: 1 }))
              ],
              { optional: true }
          )
      ])
  ])
]);
