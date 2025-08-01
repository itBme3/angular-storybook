import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ViewChild,
  TemplateRef,
  ContentChild,
  AfterViewInit,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import {
  CdkVirtualScrollViewport,
  CdkVirtualForOf,
  CdkFixedSizeVirtualScroll,
} from "@angular/cdk/scrolling";
import { CommonModule } from "@angular/common";
import { Subject } from "rxjs";
import { takeUntil, debounceTime } from "rxjs/operators";

export interface VirtualScrollLoadMoreEvent {
  startIndex: number;
  stopIndex: number;
  loadIndex: number;
  readonly scrollOffset: number;
  readonly userScroll: boolean;
}

export interface VirtualOnScrollEvent {
  overscanStartIndex: number;
  overscanStopIndex: number;
  visibleStartIndex: number;
  visibleStopIndex: number;
  readonly scrollOffset: number;
  readonly scrollForward: boolean;
  readonly userScroll: boolean;
}

export interface VirtualScrollItem {
  readonly index: number;
  readonly data: any;
}

@Component({
  selector: "app-virtual-scroll",
  standalone: true,
  imports: [
    CommonModule,
    CdkVirtualScrollViewport,
    CdkVirtualForOf,
    CdkFixedSizeVirtualScroll,
  ],
  templateUrl: "./virtual-scroll.component.html",
  styleUrls: ["./virtual-scroll.component.css"],
})
export class VirtualScrollComponent
  implements OnInit, OnDestroy, AfterViewInit, OnChanges
{
  @ViewChild("viewport", { static: true }) viewport!: CdkVirtualScrollViewport;
  @ViewChild("defaultItemTemplate", { static: true })
  defaultItemTemplate!: TemplateRef<any>;
  @ViewChild("defaultLoadingTemplate", { static: true })
  defaultLoadingTemplate!: TemplateRef<any>;

  @ContentChild("itemTemplate") itemTemplate?: TemplateRef<any>;
  @ContentChild("loadingTemplate") loadingTemplate?: TemplateRef<any>;

  /**
   * The array of items to be displayed in the virtual scroll
   */
  @Input() items: any[] = [];

  /**
   * The total number of items. Used for infinite scroll scenarios
   * where not all items are loaded yet.
   */
  @Input() totalCount?: number;

  /**
   * The size of an item in pixels (default = 104).
   * This is the content size - the component automatically adds padding and border overhead.
   * For dynamic sizing, use the getItemSize method.
   */
  @Input() itemSize: number = 104;

  /**
   * Function to calculate dynamic item sizes
   */
  @Input() itemSizeFunction?: (index: number) => number;

  /**
   * Get the effective item size including CSS box model
   * This accounts for:
   * - padding: 16px top + 16px bottom = 32px
   * - border-bottom: 1px
   * Total overhead: 33px
   */
  public get effectiveItemSize(): number {
    return this.itemSize + 33; // 32px padding + 1px border
  }

  /**
   * Height of the viewport
   */
  @Input() height: string = "400px";

  /**
   * Width of the viewport
   */
  @Input() width: string = "100%";

  /**
   * CSS class to apply to the viewport
   */
  @Input() viewportClass: string = "";

  /**
   * CSS class to apply to each item
   */
  @Input() itemClass: string = "";

  /**
   * CSS class to apply to loading items
   */
  @Input() loadingItemClass: string = "";

  /**
   * How many items to load when reaching the end (default = 50)
   */
  @Input() loadMoreCount: number = 50;

  /**
   * Buffer size in pixels before the visible area (default = 200)
   */
  @Input() minBufferPx: number = 200;

  /**
   * Buffer size in pixels after the visible area (default = 200)
   */
  @Input() maxBufferPx: number = 200;

  /**
   * Number of template instances to cache (default = 20)
   */
  @Input() templateCacheSize: number = 20;

  /**
   * Function to determine if an item at the given index is loaded
   */
  @Input() isItemLoaded?: (index: number) => boolean;

  /**
   * Whether to enable infinite scroll
   */
  @Input() enableInfiniteScroll: boolean = false;

  /**
   * Threshold for triggering load more (items from the end)
   */
  @Input() loadMoreThreshold: number = 5;

  /**
   * Whether to show loading items when fetching more data
   */
  @Input() showLoadingItems: boolean = true;

  /**
   * Number of loading items to show
   */
  @Input() loadingItemsCount: number = 3;

  /**
   * Track by function for performance optimization
   */
  @Input() trackByFn: (index: number, item: any) => any = (
    index: number,
    item: any
  ) => {
    if (item && item.__isLoading) {
      return `loading-${item.__loadingIndex}`;
    }
    return index;
  };

  /**
   * Event emitted when more items need to be loaded
   */
  @Output() loadMore = new EventEmitter<VirtualScrollLoadMoreEvent>();

  /**
   * Event emitted when scroll position changes
   */
  @Output() scrollChange = new EventEmitter<VirtualOnScrollEvent>();

  /**
   * Event emitted when the viewport size changes
   */
  @Output() viewportResize = new EventEmitter<{
    width: number;
    height: number;
  }>();

  /**
   * Event emitted when an item is toggled (checkbox)
   */
  @Output() itemToggle = new EventEmitter<{
    index: number;
    item: any;
    checked: boolean;
  }>();

  /**
   * Event emitted when an item action button is clicked
   */
  @Output() itemAction = new EventEmitter<{
    index: number;
    item: any;
  }>();

  // Internal state
  private destroy$ = new Subject<void>();
  private lastScrollOffset = 0;
  private isUserScrolling = false;
  private scrollDirection: "forward" | "backward" = "forward";

  public isScrolling = false;
  public loadingItems: number[] = [];

  /**
   * Get combined array of items and loading placeholders
   */
  public get allItems(): any[] {
    if (
      !this.enableInfiniteScroll ||
      !this.showLoadingItems ||
      this.loadingItems.length === 0
    ) {
      return this.items;
    }

    const loadingPlaceholders = this.loadingItems.map((index) => ({
      __isLoading: true,
      __loadingIndex: index,
    }));

    return [...this.items, ...loadingPlaceholders];
  }

  /**
   * Check if an item at the given index is a loading item
   */
  public isLoadingItem(index: number): boolean {
    return (
      index >= this.items.length &&
      index < this.items.length + this.loadingItems.length
    );
  }

  /**
   * Get the appropriate CSS class for an item
   */
  public getItemClass(index: number): string {
    return this.isLoadingItem(index) ? this.loadingItemClass : this.itemClass;
  }

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.updateLoadingItems();
  }

  ngAfterViewInit(): void {
    // Set up scroll event handling using elementScrolled
    this.viewport
      .elementScrolled()
      .pipe(
        debounceTime(16), // ~60fps
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.handleScroll();
      });

    // Handle viewport size changes with a different debounce
    this.viewport
      .elementScrolled()
      .pipe(debounceTime(100), takeUntil(this.destroy$))
      .subscribe(() => {
        const element = this.viewport.elementRef.nativeElement;
        this.viewportResize.emit({
          width: element.clientWidth,
          height: element.clientHeight,
        });
      });

    // Set up auto-sizing if enabled
    // Removed auto-sizing feature - it was causing jankiness
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes["totalCount"] ||
      changes["items"] ||
      changes["loadingItemsCount"]
    ) {
      this.updateLoadingItems();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onScrolledIndexChange(index: number): void {
    if (this.enableInfiniteScroll && this.shouldLoadMore(index)) {
      this.triggerLoadMore(index);
    }
  }

  onScroll(): void {
    this.isUserScrolling = true;
    this.isScrolling = true;

    // Reset scrolling state after a delay
    setTimeout(() => {
      this.isScrolling = false;
      this.cdr.detectChanges();
    }, 150);
  }

  onItemToggle(index: number, event: Event): void {
    const target = event.target as HTMLInputElement;
    const item = this.allItems[index];

    this.itemToggle.emit({
      index,
      item,
      checked: target.checked,
    });
  }

  onItemAction(index: number, item: any): void {
    this.itemAction.emit({
      index,
      item,
    });
  }

  private handleScroll(): void {
    const scrollOffset = this.viewport.measureScrollOffset();
    const scrollForward = scrollOffset >= this.lastScrollOffset;

    this.scrollDirection = scrollForward ? "forward" : "backward";
    this.lastScrollOffset = scrollOffset;

    const range = this.viewport.getRenderedRange();
    const dataLength = this.viewport.getDataLength();

    // Calculate overscan indices (approximate)
    const bufferSize = Math.ceil(this.minBufferPx / this.getAverageItemSize());
    const overscanStartIndex = Math.max(0, range.start - bufferSize);
    const overscanStopIndex = Math.min(dataLength - 1, range.end + bufferSize);

    const scrollEvent: VirtualOnScrollEvent = {
      overscanStartIndex,
      overscanStopIndex,
      visibleStartIndex: range.start,
      visibleStopIndex: range.end,
      scrollOffset,
      scrollForward,
      userScroll: this.isUserScrolling,
    };

    this.scrollChange.emit(scrollEvent);

    // Reset user scrolling flag
    setTimeout(() => {
      this.isUserScrolling = false;
    }, 100);
  }

  private shouldLoadMore(currentIndex: number): boolean {
    if (!this.totalCount) return false;

    const remainingItems = this.totalCount - this.items.length;
    if (remainingItems <= 0) return false;

    return currentIndex >= this.items.length - this.loadMoreThreshold;
  }

  private triggerLoadMore(currentIndex: number): void {
    const startIndex = this.items.length;
    const stopIndex = Math.min(
      startIndex + this.loadMoreCount - 1,
      (this.totalCount || startIndex + this.loadMoreCount) - 1
    );

    const loadMoreEvent: VirtualScrollLoadMoreEvent = {
      startIndex,
      stopIndex,
      loadIndex: currentIndex,
      scrollOffset: this.lastScrollOffset,
      userScroll: this.isUserScrolling,
    };

    this.loadMore.emit(loadMoreEvent);
  }

  private updateLoadingItems(): void {
    if (!this.showLoadingItems || !this.enableInfiniteScroll) {
      this.loadingItems = [];
      return;
    }

    const totalItems = this.totalCount || this.items.length;
    const remainingItems = totalItems - this.items.length;

    if (remainingItems > 0) {
      const loadingCount = Math.min(this.loadingItemsCount, remainingItems);
      this.loadingItems = Array.from(
        { length: loadingCount },
        (_, i) => this.items.length + i
      );
    } else {
      this.loadingItems = [];
    }
  }

  private getAverageItemSize(): number {
    return this.itemSize;
  }

  /**
   * Get the size of an item at the given index
   */
  getItemSize(index: number): number {
    if (this.itemSizeFunction) {
      return this.itemSizeFunction(index) + 33; // Add box model overhead
    }
    return this.effectiveItemSize;
  }

  /**
   * Scroll to a specific item index
   */
  scrollToIndex(index: number, behavior: ScrollBehavior = "auto"): void {
    this.viewport.scrollToIndex(index, behavior);
  }

  /**
   * Scroll to a specific offset
   */
  scrollToOffset(offset: number, behavior: ScrollBehavior = "auto"): void {
    this.viewport.scrollToOffset(offset, behavior);
  }

  /**
   * Get the current scroll offset
   */
  getScrollOffset(): number {
    return this.viewport.measureScrollOffset();
  }

  /**
   * Get the current rendered range
   */
  getRenderedRange(): { start: number; end: number } {
    return this.viewport.getRenderedRange();
  }

  /**
   * Check if an item is currently rendered
   */
  isItemRendered(index: number): boolean {
    const range = this.getRenderedRange();
    return index >= range.start && index <= range.end;
  }
}
