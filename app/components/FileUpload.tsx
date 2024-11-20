"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

interface FileUploadProps {
  onUpload: (files: { name: string; type: string; content: string }[]) => void;
}

interface ProcessedFile {
  name: string;
  type: string;
  content: string;
  originalFile: File;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload }) => {
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);

  // Handle file input change
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);

      // Process each file and read its content
      const newProcessedFiles = await Promise.all(
        filesArray.map(
          (file) =>
            new Promise<ProcessedFile>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                resolve({
                  name: file.webkitRelativePath || file.name,
                  type: file.type,
                  content: reader.result as string,
                  originalFile: file,
                });
              };
              reader.onerror = () => {
                reject(new Error(`Failed to read file: ${file.name}`));
              };
              reader.readAsText(file);
            }),
        ),
      );

      // Update state and call parent upload handler
      setProcessedFiles((prevFiles) => [...prevFiles, ...newProcessedFiles]);
      onUpload(
        newProcessedFiles.map(({ name, type, content }) => ({
          name,
          type,
          content,
        })),
      );
    }
  };

  // Remove a specific file
  const removeFile = (fileToRemove: ProcessedFile) => {
    setProcessedFiles((prevFiles) => {
      const updatedFiles = prevFiles.filter(
        (file) => file.name !== fileToRemove.name,
      );
      onUpload(
        updatedFiles.map(({ name, type, content }) => ({
          name,
          type,
          content,
        })),
      );
      return updatedFiles;
    });
  };

  return (
    <div className="mx-auto p-6 bg-white rounded-lg shadow-md space-y-4">
      <label htmlFor="file-upload" className="cursor-pointer">
        <div className="p-4 bg-gray-100 rounded-md text-center hover:bg-gray-200 transition-colors">
          Drag and drop files or click to upload (Folders supported)
        </div>
      </label>
      <input
        id="file-upload"
        type="file"
        webkitdirectory="true"
        directory="true"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {processedFiles.length > 0 && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Uploaded Files:</h3>
          <ul className="space-y-2">
            {processedFiles.map((file, index) => (
              <li
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
              >
                <span className="truncate flex-1">{file.name}</span>
                <button
                  onClick={() => removeFile(file)}
                  className="ml-2 p-1 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-200 transition-colors"
                  aria-label={`Remove ${file.name}`}
                >
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-2 text-sm text-gray-500">
            {processedFiles.length} file
            {processedFiles.length !== 1 ? "s" : ""} uploaded
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
