import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";

export type ButtonVariant = "primary" | "secondary" | "outline";
export type ButtonSize = "small" | "medium" | "large";

@Component({
  selector: "app-button",
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [class]="getButtonClasses()"
      [disabled]="disabled"
      (click)="handleClick($event)"
      type="button"
    >
      {{ label }}
    </button>
  `,
  styles: [
    `
      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        font-weight: 500;
        text-decoration: none;
        cursor: pointer;
        transition: all 0.2s ease-in-out;
        border: 1px solid transparent;
        font-family: inherit;
      }

      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      /* Sizes */
      .btn-small {
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
        line-height: 1.25rem;
      }

      .btn-medium {
        padding: 0.75rem 1.5rem;
        font-size: 1rem;
        line-height: 1.5rem;
      }

      .btn-large {
        padding: 1rem 2rem;
        font-size: 1.125rem;
        line-height: 1.75rem;
      }

      /* Variants */
      .btn-primary {
        background-color: #3b82f6;
        color: white;
        border-color: #3b82f6;
      }

      .btn-primary:hover:not(:disabled) {
        background-color: #2563eb;
        border-color: #2563eb;
      }

      .btn-secondary {
        background-color: #6b7280;
        color: white;
        border-color: #6b7280;
      }

      .btn-secondary:hover:not(:disabled) {
        background-color: #4b5563;
        border-color: #4b5563;
      }

      .btn-outline {
        background-color: transparent;
        color: #3b82f6;
        border-color: #3b82f6;
      }

      .btn-outline:hover:not(:disabled) {
        background-color: #3b82f6;
        color: white;
      }
    `,
  ],
})
export class ButtonComponent {
  @Input() label: string = "Button";
  @Input() variant: ButtonVariant = "primary";
  @Input() size: ButtonSize = "medium";
  @Input() disabled: boolean = false;

  @Output() onClick = new EventEmitter<MouseEvent>();

  handleClick(event: MouseEvent): void {
    if (!this.disabled) {
      this.onClick.emit(event);
    }
  }

  getButtonClasses(): string {
    return `btn btn-${this.variant} btn-${this.size}`;
  }
}
