import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { FilesAndNotes } from "./FilesAndNotes";
import { FileManager } from "../file/FileManager";
import { NotesManager } from "../notes/NotesManager";

export const FilesAndNotesRouter: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={<FilesAndNotes />}
      >
        <Route
          index
          element={<Navigate to="/files-notes/files" replace />}
        />
        <Route path="files/*" element={<FileManager />} />
        <Route path="notes/*" element={<NotesManager />} />
        <Route
          path="*"
          element={<Navigate to="/files-notes/files" replace />}
        />
      </Route>
    </Routes>
  );
};

