import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { D3FiddlinComponent } from './d3-fiddlin.component';

describe('D3FiddlinComponent', () => {
  let component: D3FiddlinComponent;
  let fixture: ComponentFixture<D3FiddlinComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ D3FiddlinComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(D3FiddlinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
