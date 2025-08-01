import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { VirtualScrollComponent } from "../virtual-scroll/virtual-scroll.component";

@Component({
  selector: "search-wrapper",
  standalone: true,
  imports: [CommonModule, FormsModule, VirtualScrollComponent],
  templateUrl: "./search-wrapper.component.html",
  styleUrls: ["./search-wrapper.component.css"],
})
export class SearchWrapperComponent implements OnInit, OnChanges {
  @Input() items: any[] = [];
  @Input() height = "400px";
  @Input() width = "100%";
  @Input() itemSize = 120;

  @Output() itemToggle = new EventEmitter();
  @Output() itemAction = new EventEmitter();

  searchTerm = "";
  filteredItems: any[] = [];

  ngOnInit() {
    this.filteredItems = [...this.items];
  }

  ngOnChanges() {
    this.onSearchChange();
  }

  onSearchChange() {
    if (!this.searchTerm.trim()) {
      this.filteredItems = [...this.items];
    } else {
      const searchLower = this.searchTerm.toLowerCase();
      this.filteredItems = this.items.filter(
        (item) =>
          item.title?.toLowerCase().includes(searchLower) ||
          item.name?.toLowerCase().includes(searchLower)
      );
    }
  }

  onItemToggle(event: any) {
    this.itemToggle.emit(event);
  }

  onItemAction(event: any) {
    this.itemAction.emit(event);
  }
}
