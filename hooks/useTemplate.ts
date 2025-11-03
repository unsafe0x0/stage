import { useCallback } from "react";
import { useCanvasContext } from "@/components/canvas/CanvasContext";
import { applyTemplateBackground } from "@/lib/canvas/utils";
import type { Template } from "@/types/canvas";

export function useTemplate() {
  const { stage, layer } = useCanvasContext();

  const applyTemplate = useCallback(
    async (template: Template) => {
      if (!stage || !layer) return;

      // Remove existing background shapes (non-selectable objects)
      const backgroundRect = layer.findOne("#background-rect");
      if (backgroundRect) {
        backgroundRect.destroy();
      }

      // Remove any other background shapes (circles/rects that are not selectable)
      const allShapes = layer.getChildren();
      allShapes.forEach((shape) => {
        if (shape.id()?.startsWith("bg-") || (!shape.listening() && shape.getClassName() !== "Transformer")) {
          shape.destroy();
        }
      });

      // Apply new template background
      await applyTemplateBackground(stage, layer, template);

      // Update canvas dimensions if needed
      if (
        stage.width() !== template.dimensions.width ||
        stage.height() !== template.dimensions.height
      ) {
        stage.width(template.dimensions.width);
        stage.height(template.dimensions.height);
        layer.batchDraw();
      }
    },
    [stage, layer]
  );

  return { applyTemplate };
}