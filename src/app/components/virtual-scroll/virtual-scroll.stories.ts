import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata, componentWrapperDecorator } from "@storybook/angular";
import { VirtualScrollComponent } from "./virtual-scroll.component";
import { SearchWrapperComponent } from "../search-wrapper/search-wrapper.component";
import { CommonModule } from "@angular/common";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { FormsModule } from "@angular/forms";

const meta: Meta<VirtualScrollComponent> = {
  title: "Components/VirtualScroll",
  component: VirtualScrollComponent,
  decorators: [
    moduleMetadata({
      imports: [
        CommonModule,
        ScrollingModule,
        VirtualScrollComponent,
        FormsModule,
        SearchWrapperComponent,
      ],
      declarations: [],
    }),
  ],
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    height: {
      control: { type: "text" },
      description: "Height of the viewport",
    },
    width: {
      control: { type: "text" },
      description: "Width of the viewport",
    },
    itemSize: {
      control: { type: "number" },
      description: "Size of each item in pixels",
    },
    enableInfiniteScroll: {
      control: { type: "boolean" },
      description: "Enable infinite scrolling",
    },
    loadMoreThreshold: {
      control: { type: "number" },
      description: "Threshold for triggering load more",
    },
    minBufferPx: {
      control: { type: "number" },
      description: "Buffer size before visible area",
    },
    maxBufferPx: {
      control: { type: "number" },
      description: "Buffer size after visible area",
    },
    itemToggle: { action: "itemToggle" },
    itemAction: { action: "itemAction" },
    loadMore: { action: "loadMore" },
    scrollChange: { action: "scrollChange" },
  },
};

export default meta;
type Story = StoryObj<VirtualScrollComponent>;

// Helper function to generate sample data
function generateItems(count: number) {
  const categories = [
    "Technology",
    "Design",
    "Marketing",
    "Sales",
    "Support",
    "Finance",
  ];
  const actions = [
    "View Details",
    "Edit",
    "Download",
    "Share",
    "Archive",
    "Duplicate",
  ];

  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    title: `Item ${index + 1}`,
    name: `Item ${index + 1}`, // fallback for backward compatibility
    description: `This is a detailed description for item ${
      index + 1
    }. It contains information about the item's purpose and functionality.`,
    category: categories[index % categories.length],
    value: Math.floor(Math.random() * 1000) + 10,
    date: new Date(2023, index % 12, (index % 28) + 1).toLocaleDateString(),
    selected: Math.random() > 0.8, // 20% chance of being selected
    buttonLabel: actions[index % actions.length],
    priority: ["High", "Medium", "Low"][index % 3],
    status: ["Active", "Pending", "Completed"][index % 3],
  }));
}

const featureExamples = [
  "Dashboard Analytics",
  "User Management",
  "Payment Processing",
  "Email Campaign",
  "Product Catalog",
  "Order Management",
  "Customer Support",
  "Report Generation",
  "Content Management",
  "Notification Center",
  "File Upload System",
];

const items = generateItems(20_000).map((item, index) => ({
  ...item,
  title:
    featureExamples[index % featureExamples.length] +
    ` ${Math.floor(index / 15) + 1}`,
}));

// export const Demo: Story = {
//   args: {
//     items: generateItems(10_000),
//     height: "500px",
//     width: "800px",
//     itemSize: 120,
//   },
// };

export const Demo: StoryObj<VirtualScrollComponent> = {
  render: (args) => ({
    template: `
      <search-wrapper
        [items]="items"
        [height]="height"
        [width]="width"
        [itemSize]="itemSize"
        (itemToggle)="itemToggle($event)"
        (itemAction)="itemAction($event)">
      </search-wrapper>
    `,
    props: args,
  }),
  args: {
    items,
    height: "80vh",
    width: "100%",
    itemSize: 104, // Content size - component will add padding/border automatically
  },
  argTypes: {
    itemToggle: { action: "itemToggle" },
    itemAction: { action: "itemAction" },
  },
  parameters: {
    docs: {
      description: {
        story:
          "A virtual scroll component with search functionality that filters items by title. Type in the search box to filter the results in real-time.",
      },
    },
  },
};

const dynamicSizeItems = items.slice(0, 5_000).map((item, index) => ({
  ...item,
  description: (item.description + " ").repeat(
    Math.floor(Math.random() * 4) + 1 // More variation in content length
  ),
}));

// Dynamic item sizes
export const DynamicSizes: StoryObj<VirtualScrollComponent> = {
  ...Demo,
  args: {
    ...Demo.args,
    items: dynamicSizeItems,
    itemSize: 104, // Use the optimized size we discovered - component adds box model overhead
  },
};
