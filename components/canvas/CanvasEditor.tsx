"use client";

import { useEffect, useRef } from "react";
import { Stage, Layer, Image, Text, Transformer } from "react-konva";
import { useCanvasContext } from "./CanvasContext";
import { DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT } from "@/lib/constants";
import Konva from "konva";

interface CanvasEditorProps {
  width?: number;
  height?: number;
  backgroundColor?: string;
  className?: string;
}

export function CanvasEditor({
  width = DEFAULT_CANVAS_WIDTH,
  height = DEFAULT_CANVAS_HEIGHT,
  backgroundColor = "#ffffff",
  className = "",
}: CanvasEditorProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const { initializeCanvas, objects, selectedObject, operations, layer } = useCanvasContext();

  useEffect(() => {
    if (stageRef.current && layerRef.current) {
      initializeCanvas(stageRef.current, layerRef.current);
    }
  }, [initializeCanvas]);

  useEffect(() => {
    if (stageRef.current) {
      stageRef.current.width(width);
      stageRef.current.height(height);
    }
  }, [width, height]);

  // Update transformer when selection changes
  useEffect(() => {
    if (!transformerRef.current || !layerRef.current || !selectedObject) {
      transformerRef.current?.nodes([]);
      return;
    }

    // Find the Konva node for the selected object
    const selectedNode = layerRef.current.findOne(`#${selectedObject.id}`);
    if (selectedNode) {
      transformerRef.current.nodes([selectedNode]);
      layerRef.current.batchDraw();
    }
  }, [selectedObject, layer]);

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      operations.clearSelection();
    }
  };

  const handleObjectClick = (obj: typeof objects[0]) => {
    const found = objects.find((o) => o.id === obj.id);
    if (found) {
      if (operations.selectObject) {
        operations.selectObject(obj.id);
      } else {
        // Fallback: trigger selection through transform
        operations.transformObject(obj.id, {});
      }
    }
  };

  return (
    <div className={`relative border border-gray-200 rounded-lg overflow-hidden bg-gray-50 ${className}`}>
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        onClick={handleStageClick}
        onTap={handleStageClick}
        style={{ backgroundColor }}
      >
        <Layer ref={layerRef}>
          {/* Background - using Konva.Rect would require importing Rect, but we can set it via stage background */}
          
          {/* Render objects */}
          {objects.map((obj) => {
            const isSelected = selectedObject?.id === obj.id;
            
            if (obj.type === "image" && obj.image) {
              return (
                <Image
                  key={obj.id}
                  id={obj.id}
                  image={obj.image}
                  x={obj.x}
                  y={obj.y}
                  width={obj.width}
                  height={obj.height}
                  scaleX={obj.scaleX ?? 1}
                  scaleY={obj.scaleY ?? 1}
                  rotation={obj.rotation ?? 0}
                  draggable
                  onClick={() => handleObjectClick(obj)}
                  onTap={() => handleObjectClick(obj)}
                  onDragEnd={(e) => {
                    operations.transformObject(obj.id, {
                      left: e.target.x(),
                      top: e.target.y(),
                    });
                  }}
                  onTransformEnd={(e) => {
                    const node = e.target;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();
                    
                    node.scaleX(1);
                    node.scaleY(1);
                    
                    operations.transformObject(obj.id, {
                      left: node.x(),
                      top: node.y(),
                      scaleX: scaleX,
                      scaleY: scaleY,
                      angle: node.rotation(),
                    });
                  }}
                />
              );
            }
            
            if (obj.type === "text") {
              return (
                <Text
                  key={obj.id}
                  id={obj.id}
                  text={obj.text || ""}
                  x={obj.x}
                  y={obj.y}
                  fontSize={obj.fontSize || 48}
                  fill={obj.fill || "#000000"}
                  scaleX={obj.scaleX ?? 1}
                  scaleY={obj.scaleY ?? 1}
                  rotation={obj.rotation ?? 0}
                  draggable
                  align="center"
                  offsetX={0}
                  offsetY={0}
                  onClick={() => handleObjectClick(obj)}
                  onTap={() => handleObjectClick(obj)}
                  onDragEnd={(e) => {
                    operations.transformObject(obj.id, {
                      left: e.target.x(),
                      top: e.target.y(),
                    });
                  }}
                  onTransformEnd={(e) => {
                    const node = e.target;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();
                    
                    node.scaleX(1);
                    node.scaleY(1);
                    
                    operations.transformObject(obj.id, {
                      left: node.x(),
                      top: node.y(),
                      scaleX: scaleX,
                      scaleY: scaleY,
                      angle: node.rotation(),
                    });
                  }}
                />
              );
            }
            
            return null;
          })}
          
          {/* Transformer for selected objects */}
          {selectedObject && (
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 5 || newBox.height < 5) {
                  return oldBox;
                }
                return newBox;
              }}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}