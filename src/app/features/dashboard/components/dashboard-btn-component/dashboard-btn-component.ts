import { Component, computed, input } from '@angular/core';
import { NgClass, NgOptimizedImage } from "@angular/common";

@Component({
  selector: 'app-dashboard-btn-component',
  imports: [
    NgOptimizedImage,
    NgClass
  ],
  templateUrl: './dashboard-btn-component.html',
})
export class DashboardBtnComponent {
  href = input('#');
  image = input.required<string>();
  title = input.required<string>();

  variant = input<'primary' | 'accent' | 'success' | 'warning' | 'error'>('primary');

  readonly variants = {
    primary: {
      border: 'hover:border-primary/40',
      ring: 'group-hover:ring-primary/40',
    },
    accent: {
      border: 'hover:border-accent/40',
      ring: 'group-hover:ring-accent/40',
    },
    success: {
      border: 'hover:border-success/40',
      ring: 'group-hover:ring-success/40',
    },
    warning: {
      border: 'hover:border-warning/40',
      ring: 'group-hover:ring-warning/40',
    },
    error: {
      border: 'hover:border-error/40',
      ring: 'group-hover:ring-error/40',
    },
  } as const;

  style = computed(() => this.variants[this.variant()]);
}
