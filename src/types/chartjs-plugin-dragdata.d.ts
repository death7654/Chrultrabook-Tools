import { ChartType } from "chart.js";

declare module "chart.js" {
  interface PluginOptionsByType<TType extends ChartType> {
    dragData?: {
      onDragStart?: (
        e: MouseEvent,
        datasetIndex: number,
        index: number,
        value: number,
      ) => void;
      onDrag?: (
        e: MouseEvent,
        datasetIndex: number,
        index: number,
        value: number,
      ) => void;
      onDragEnd?: (
        e: MouseEvent,
        datasetIndex: number,
        index: number,
        value: number,
      ) => void;
      round?: number;
      showTooltip?: boolean;
      magnet?: {
        to: number[];
      };
      dragX?: boolean;
      dragY?: boolean;
      dragData?: boolean;
    };
  }
}

declare module "chartjs-plugin-dragdata" {}
