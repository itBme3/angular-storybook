import { RefCallback, useCallback } from "react";
import useVirtual from "react-cool-virtual";

type VirtualScrollLoadMoreEvent = {
  startIndex: number;
  stopIndex: number;
  loadIndex: number;
  readonly scrollOffset: number;
  readonly userScroll: boolean;
};

export type VirtualOnScrollEvent = {
  overscanStartIndex: number;
  overscanStopIndex: number;
  visibleStartIndex: number;
  visibleStopIndex: number;
  readonly scrollOffset: number;
  readonly scrollForward: boolean;
  readonly userScroll: boolean;
};

export type VirtualScrollItem = {
  readonly index: number;
  readonly start: number;
  readonly size: number;
  readonly width: number;
  readonly isScrolling?: true;
  readonly isSticky?: true;
  measureRef: RefCallback<HTMLElement>;
};

export type UseVirtualScrollProps = {
  /**
   * The total number of items. This can be any number,
   * but typically:
   * - if fixed size: it's the length of the items array
   * - if loadMoreCount is provided: it's the total number of items that can be loaded
   */
  count: number;
  /**
   * The size of an item (default = 50).
   * When working with dynamic size, it will be the default/or estimated size of the unmeasured items.
   * @default 50
   */
  itemSize?: number | ((index: number, width: number) => number);
  /**
   * How many number of items that you want to load/or pre-load (default = 50), it's used for infinite scroll.
   * A number 50 means the loadMore callback will be invoked when the user scrolls within every 50 items, e.g. 1 - 50, 51 - 100, and so on.
   * @default 50
   */
  loadMoreCount?: number;
  /**
   * Used for infinite scroll — to tell the hook whether the loadMore should be triggered or not.
   */
  isItemLoaded?: (index: number) => boolean;
  /**
   * A callback for us to fetch (more) data, it's used for infinite scroll. It's invoked when more items need to be loaded, which based on the mechanism of loadMoreCount and isItemLoaded.
   */
  loadMore?: (e: VirtualScrollLoadMoreEvent) => void;
  /**
   * The number of items to render behind and ahead of the visible area (default = 1).
   * That can be used for two reasons:
   * - To slightly reduce/prevent a flash of empty screen while the user is scrolling. Please note, too many can negatively impact performance.
   * - To allow the tab key to focus on the next (invisible) item for better accessibility.
   */
  overscanCount?: number;
  /**
   * Used to tell the hook to reset the scroll position when the count is changed.
   * It's useful for filtering items.
   * @default false
   */
  resetScroll?: boolean;
  /**
   * This event will be triggered when scroll position is being changed by the user scrolls or scrollTo/scrollToItem methods.
   */
  onScroll?: (e: VirtualOnScrollEvent) => void;
  /**
   * This event will be triggered when the size of the outer element changes.


   */
  onResize?: (e: { width: number; height: number }) => void;
  /**
   * An array of item indices to make sticky.
   * - Must be in ascending order, i.e. [1, 2, 3, ...].
   */
  stickyIndices?: number[];
  useIsScrolling?: boolean;
};

export function useVirtualScroll({
  count,
  loadMoreCount,
  overscanCount,
  resetScroll,
  itemSize,
  stickyIndices,
  useIsScrolling,
  onScroll,
  onResize,
  isItemLoaded,
  loadMore
}: UseVirtualScrollProps) {
  const { outerRef, innerRef, items, startItem, scrollToItem, scrollTo } =
    useVirtual({
      itemCount: count,
      itemSize,
      loadMoreCount,
      overscanCount,
      useIsScrolling,
      resetScroll,
      stickyIndices,
      onScroll,
      onResize,
      isItemLoaded,
      loadMore
    });

  const setOuterRef = useCallback((node: HTMLElement | null) => {
    outerRef.current = node;
  }, []);

  const setInnerRef = useCallback((node: HTMLElement | null) => {
    innerRef.current = node;
  }, []);

  return {
    setOuterRef,
    setInnerRef,
    items,
    startItem,
    scrollToItem,
    scrollTo
  };
}

export default useVirtualScroll;
