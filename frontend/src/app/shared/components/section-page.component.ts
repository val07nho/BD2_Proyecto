import { Component, computed, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-section-page",
  standalone: true,
  template: `
    <article>
      <h2>{{ title() }}</h2>
      <p>{{ description() }}</p>
    </article>
  `
})
export class SectionPageComponent {
  private readonly route = inject(ActivatedRoute);

  readonly title = computed(() => this.route.snapshot.data["title"] ?? "Seccion");
  readonly description = computed(
    () => this.route.snapshot.data["description"] ?? "Aqui puedes implementar la vista completa conectada al backend."
  );
}
