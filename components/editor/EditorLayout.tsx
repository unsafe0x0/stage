"use client";

import * as React from "react";
import { EditorLeftPanel } from "./editor-left-panel";
import { EditorRightPanel } from "./editor-right-panel";
import { EditorContent } from "./EditorContent";
import { EditorCanvas } from "@/components/canvas/EditorCanvas";
import { EditorStoreSync } from "@/components/canvas/EditorStoreSync";
import { EditorBottomBar } from "./editor-bottom-bar";

function EditorMain() {
  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <EditorStoreSync />
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <EditorLeftPanel />
        
        {/* Center Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          <EditorContent>
            <EditorCanvas />
          </EditorContent>
        </div>
        
        {/* Right Panel */}
        <EditorRightPanel />
      </div>
      
      {/* Bottom Bar */}
      <EditorBottomBar />
    </div>
  );
}

export function EditorLayout() {
  return <EditorMain />;
}
