import { Component, Input } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import {
  Cart,
  CartService,
  I18nTestingModule,
  Order,
  OrderEntry,
  PromotionResult,
} from '@spartacus/core';
import { Observable, of } from 'rxjs';
import { PromotionsModule } from '../../checkout';
import { Item } from '../cart-shared/cart-item/cart-item.component';
import { CartDetailsComponent } from './cart-details.component';

class MockCartService {
  removeEntry(): void {}
  loadDetails(): void {}
  updateEntry(): void {}
  getActive(): Observable<Cart> {
    return of<Cart>({ code: '123' });
  }
  getEntries(): Observable<OrderEntry[]> {
    return of([{}]);
  }
  getLoaded(): Observable<boolean> {
    return of(true);
  }
}

@Component({
  template: '',
  selector: 'cx-cart-item-list',
})
class MockCartItemListComponent {
  @Input()
  items: Item[];
  @Input()
  potentialProductPromotions: PromotionResult[] = [];
  @Input()
  cartIsLoading: Observable<boolean>;
}

@Component({
  template: '',
  selector: 'cx-cart-coupon',
})
class MockCartCouponComponent {
  @Input()
  cart: Cart | Order;
  @Input()
  cartIsLoading = false;
  userId: string;
}

describe('CartDetailsComponent', () => {
  let component: CartDetailsComponent;
  let fixture: ComponentFixture<CartDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, PromotionsModule, I18nTestingModule],
      declarations: [
        CartDetailsComponent,
        MockCartItemListComponent,
        MockCartCouponComponent,
      ],
      providers: [{ provide: CartService, useClass: MockCartService }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CartDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create cart details component', () => {
    expect(component).toBeTruthy();
  });

  describe('when cart has potentialOrderPromotions and appliedOrderPromotions are defined', () => {
    it('should have two consumedEntries', () => {
      const mockedCart: Cart = {
        guid: '1',
        potentialOrderPromotions: [
          {
            consumedEntries: [
              {
                orderEntryNumber: 1,
              },
            ],
            description: 'test applied product promotion',
          },
        ],
        appliedOrderPromotions: [
          {
            consumedEntries: [
              {
                orderEntryNumber: 2,
              },
            ],
            description: 'test potential product promotion',
          },
        ],
      };

      const expectedResult: PromotionResult[] = [
        {
          consumedEntries: [
            {
              orderEntryNumber: 1,
            },
          ],
          description: 'test applied product promotion',
        },
        {
          consumedEntries: [
            {
              orderEntryNumber: 2,
            },
          ],
          description: 'test potential product promotion',
        },
      ];

      const promotions = component.getAllPromotionsForCart(mockedCart);
      expect(promotions).toEqual(expectedResult);
    });
  });

  describe('when cart has potentialOrderPromotions is empty and appliedOrderPromotions is defined', () => {
    it('should have two consumedEntries', () => {
      const mockedCart: Cart = {
        guid: '2',
        potentialOrderPromotions: [],
        appliedOrderPromotions: [
          {
            consumedEntries: [
              {
                orderEntryNumber: 2,
              },
            ],
            description: 'test potential product promotion',
          },
        ],
      };

      const expectedResult: PromotionResult[] = [
        {
          consumedEntries: [
            {
              orderEntryNumber: 2,
            },
          ],
          description: 'test potential product promotion',
        },
      ];

      const promotions = component.getAllPromotionsForCart(mockedCart);
      expect(promotions).toEqual(expectedResult);
    });
  });

  describe('when cart has potentialOrderPromotions is defined and appliedOrderPromotions is empty', () => {
    it('should have two consumedEntries', () => {
      const mockedCart: Cart = {
        guid: '3',
        potentialOrderPromotions: [
          {
            consumedEntries: [
              {
                orderEntryNumber: 1,
              },
            ],
            description: 'test applied product promotion',
          },
        ],
        appliedOrderPromotions: [],
      };

      const expectedResult: PromotionResult[] = [
        {
          consumedEntries: [
            {
              orderEntryNumber: 1,
            },
          ],
          description: 'test applied product promotion',
        },
      ];

      const promotions = component.getAllPromotionsForCart(mockedCart);
      expect(promotions).toEqual(expectedResult);
    });
  });

  describe('when cart has potentialOrderPromotions is defined and appliedOrderPromotions is undefined', () => {
    it('should have two consumedEntries', () => {
      const mockedCart: Cart = {
        guid: '4',
        potentialOrderPromotions: [
          {
            consumedEntries: [
              {
                orderEntryNumber: 1,
              },
            ],
            description: 'test applied product promotion',
          },
        ],
      };

      const expectedResult: PromotionResult[] = [
        {
          consumedEntries: [
            {
              orderEntryNumber: 1,
            },
          ],
          description: 'test applied product promotion',
        },
      ];

      const promotions = component.getAllPromotionsForCart(mockedCart);
      expect(promotions).toEqual(expectedResult);
    });
  });

  describe('when cart has potentialOrderPromotions is undefined and appliedOrderPromotions is defined', () => {
    it('should have two consumedEntries', () => {
      const mockedCart: Cart = {
        guid: '5',
        appliedOrderPromotions: [
          {
            consumedEntries: [
              {
                orderEntryNumber: 2,
              },
            ],
            description: 'test potential product promotion',
          },
        ],
      };

      const expectedResult: PromotionResult[] = [
        {
          consumedEntries: [
            {
              orderEntryNumber: 2,
            },
          ],
          description: 'test potential product promotion',
        },
      ];

      const promotions = component.getAllPromotionsForCart(mockedCart);
      expect(promotions).toEqual(expectedResult);
    });
  });

  it('should display cart text with cart number', () => {
    fixture.detectChanges();
    const el = fixture.debugElement.query(By.css('.cx-total'));
    const cartName = el.nativeElement.innerText;
    expect(cartName).toEqual('cartDetails.cartName code:123');
  });
});
