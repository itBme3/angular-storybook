import { Component } from "@angular/core";
import { ButtonComponent } from "./components/button/button.component";
import { VirtualScrollComponent } from "./components/virtual-scroll/virtual-scroll.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [ButtonComponent, VirtualScrollComponent],
  template: `
    <div class="app-container">
      <h1>Angular Sandbox</h1>
      <p>Testing components with Storybook</p>

      <div class="component-showcase">
        <h2>Button Component</h2>
        <app-button
          label="Primary Button"
          variant="primary"
          (onClick)="onButtonClick('primary')"
        >
        </app-button>

        <app-button
          label="Secondary Button"
          variant="secondary"
          (onClick)="onButtonClick('secondary')"
        >
        </app-button>

        <app-button label="Disabled Button" variant="primary" [disabled]="true">
        </app-button>
      </div>

      <div class="component-showcase">
        <h2>Virtual Scroll Component</h2>
        <app-virtual-scroll
          [items]="virtualScrollItems"
          height="300px"
          width="100%"
          [itemSize]="50"
        >
        </app-virtual-scroll>
      </div>
    </div>
  `,
  styles: [
    `
      .app-container {
        padding: 2rem;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto",
          sans-serif;
      }

      .component-showcase {
        margin-top: 2rem;
        padding: 1rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
      }

      .component-showcase h2 {
        margin-bottom: 1rem;
        color: #333;
      }

      app-button {
        margin-right: 1rem;
        margin-bottom: 1rem;
      }
    `,
  ],
})
export class AppComponent {
  virtualScrollItems = Array.from({ length: 1000 }, (_, index) => ({
    id: index + 1,
    name: `Item ${index + 1}`,
    description: `This is the description for item ${index + 1}`,
    category: ["Category A", "Category B", "Category C"][index % 3],
    value: Math.floor(Math.random() * 1000),
  }));

  onButtonClick(variant: string): void {
    console.log(`${variant} button clicked!`);
  }
}
