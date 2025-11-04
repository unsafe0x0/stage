"use client";

import * as React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SidebarLeft } from "./sidebar-left";
import { EditorHeader } from "./EditorHeader";
import { EditorContent } from "./EditorContent";
import { Footer } from "@/components/landing/Footer";
import { EditorCanvas } from "@/components/canvas/EditorCanvas";
import { EditorStoreSync } from "@/components/canvas/EditorStoreSync";

function EditorMain() {
  return (
    <SidebarProvider>
      <EditorStoreSync />
      <SidebarLeft />
      <SidebarInset>
        <div className="min-h-screen flex flex-col bg-background">
          <EditorHeader />
          <EditorContent>
            <EditorCanvas />
          </EditorContent>
          <Footer />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export function EditorLayout() {
  return <EditorMain />;
}
