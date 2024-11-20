"use client";
import React, { useState } from "react";
import { Pencil, Check, X, Plus, Trash } from "lucide-react";

interface CodeStyle {
  naming: string;
  comments: string;
  formatting: string;
}

interface ProjectMetadata {
  language: string;
  architecture: string;
  dependencies: string[];
  version?: string;
  targetPlatforms: string[];
  codeStyle: CodeStyle;
}

interface MetadataFormProps {
  files: { name: string; type: string; content: string }[];
  onSubmit: (metadata: ProjectMetadata) => void;
}

const MetadataForm: React.FC<MetadataFormProps> = ({ files, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<ProjectMetadata | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMetadata, setEditedMetadata] = useState<ProjectMetadata | null>(
    null,
  );

  const fetchMetadata = async () => {
    if (!files.length) {
      setError("No files uploaded.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files }),
      });

      if (!response.ok) {
        throw new Error(
          (await response.json()).error || "Failed to generate metadata",
        );
      }

      const { metadata: receivedMetadata } = await response.json();
      setMetadata(receivedMetadata);
      setEditedMetadata({ ...receivedMetadata });
      onSubmit(receivedMetadata);
    } catch (err: any) {
      setError(err.message || "Failed to fetch metadata");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (editedMetadata) {
      setMetadata(editedMetadata);
      onSubmit(editedMetadata);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedMetadata(metadata);
    setIsEditing(false);
  };

  const handleArrayItemAdd = (field: "dependencies" | "targetPlatforms") => {
    if (editedMetadata) {
      setEditedMetadata({
        ...editedMetadata,
        [field]: [...editedMetadata[field], ""],
      });
    }
  };

  const handleArrayItemRemove = (
    field: "dependencies" | "targetPlatforms",
    index: number,
  ) => {
    if (editedMetadata) {
      const newArray = [...editedMetadata[field]];
      newArray.splice(index, 1);
      setEditedMetadata({
        ...editedMetadata,
        [field]: newArray,
      });
    }
  };

  const handleArrayItemChange = (
    field: "dependencies" | "targetPlatforms",
    index: number,
    value: string,
  ) => {
    if (editedMetadata) {
      const newArray = [...editedMetadata[field]];
      newArray[index] = value;
      setEditedMetadata({
        ...editedMetadata,
        [field]: newArray,
      });
    }
  };

  const renderEditableArrayField = (
    field: "dependencies" | "targetPlatforms",
    title: string,
  ) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">{title}</h3>
        <button
          onClick={() => handleArrayItemAdd(field)}
          className="text-blue-500 hover:text-blue-600 p-1 rounded-md hover:bg-blue-50"
        >
          <Plus size={16} />
        </button>
      </div>
      <ul className="space-y-2">
        {editedMetadata?.[field].map((item, idx) => (
          <li key={idx} className="flex items-center gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) =>
                handleArrayItemChange(field, idx, e.target.value)
              }
              className="flex-1 p-1 border rounded-md text-sm"
            />
            <button
              onClick={() => handleArrayItemRemove(field, idx)}
              className="text-red-500 hover:text-red-600 p-1 rounded-md hover:bg-red-50"
            >
              <Trash size={16} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  const renderReadOnlyArrayField = (items: string[]) => (
    <ul className="list-disc pl-5 space-y-1">
      {items.map((item, idx) => (
        <li key={idx} className="text-sm">
          {item}
        </li>
      ))}
    </ul>
  );

  const renderEditableCodeStyle = () => (
    <div className="space-y-2">
      {editedMetadata && (
        <>
          <div>
            <span className="font-medium">Naming: </span>
            <input
              type="text"
              value={editedMetadata.codeStyle.naming}
              onChange={(e) =>
                setEditedMetadata({
                  ...editedMetadata,
                  codeStyle: {
                    ...editedMetadata.codeStyle,
                    naming: e.target.value,
                  },
                })
              }
              className="p-1 border rounded-md text-sm"
            />
          </div>
          <div>
            <span className="font-medium">Comments: </span>
            <input
              type="text"
              value={editedMetadata.codeStyle.comments}
              onChange={(e) =>
                setEditedMetadata({
                  ...editedMetadata,
                  codeStyle: {
                    ...editedMetadata.codeStyle,
                    comments: e.target.value,
                  },
                })
              }
              className="p-1 border rounded-md text-sm"
            />
          </div>
          <div>
            <span className="font-medium">Formatting: </span>
            <input
              type="text"
              value={editedMetadata.codeStyle.formatting}
              onChange={(e) =>
                setEditedMetadata({
                  ...editedMetadata,
                  codeStyle: {
                    ...editedMetadata.codeStyle,
                    formatting: e.target.value,
                  },
                })
              }
              className="p-1 border rounded-md text-sm"
            />
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-6 p-6 border rounded-lg bg-white shadow-sm">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Project Analysis</h2>
        <div className="flex gap-2">
          {metadata && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1 text-blue-500 hover:text-blue-600 px-3 py-1 rounded-md hover:bg-blue-50"
            >
              <Pencil size={16} />
              Edit
            </button>
          )}
          {!metadata && (
            <button
              onClick={fetchMetadata}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
            >
              {loading ? "Analyzing..." : "Analyze Files"}
            </button>
          )}
          {isEditing && (
            <>
              <button
                onClick={handleSave}
                className="flex items-center gap-1 text-green-500 hover:text-green-600 px-3 py-1 rounded-md hover:bg-green-50"
              >
                <Check size={16} />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1 text-gray-500 hover:text-gray-600 px-3 py-1 rounded-md hover:bg-gray-50"
              >
                <X size={16} />
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
          {error}
        </div>
      )}

      {(metadata || editedMetadata) && (
        <div className="space-y-6 divide-y">
          <div className="grid grid-cols-2 gap-4 pt-4">
            {isEditing ? (
              <>
                <div>
                  <h3 className="font-medium mb-2">Language</h3>
                  <input
                    type="text"
                    value={editedMetadata?.language}
                    onChange={(e) =>
                      setEditedMetadata((prev) =>
                        prev ? { ...prev, language: e.target.value } : null,
                      )
                    }
                    className="p-1 border rounded-md text-sm"
                  />
                </div>
                <div>
                  <h3 className="font-medium mb-2">Architecture</h3>
                  <input
                    type="text"
                    value={editedMetadata?.architecture}
                    onChange={(e) =>
                      setEditedMetadata((prev) =>
                        prev ? { ...prev, architecture: e.target.value } : null,
                      )
                    }
                    className="p-1 border rounded-md text-sm"
                  />
                </div>
                {editedMetadata?.version && (
                  <div>
                    <h3 className="font-medium mb-2">Version</h3>
                    <input
                      type="text"
                      value={editedMetadata.version}
                      onChange={(e) =>
                        setEditedMetadata((prev) =>
                          prev ? { ...prev, version: e.target.value } : null,
                        )
                      }
                      className="p-1 border rounded-md text-sm"
                    />
                  </div>
                )}
              </>
            ) : (
              <>
                <div>
                  <h3 className="font-medium mb-2">Language</h3>
                  <span>{metadata?.language}</span>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Architecture</h3>
                  <span>{metadata?.architecture}</span>
                </div>
                {metadata?.version && (
                  <div>
                    <h3 className="font-medium mb-2">Version</h3>
                    <span>{metadata.version}</span>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="pt-4">
            <h3 className="font-medium mb-2">Dependencies</h3>
            {isEditing
              ? renderEditableArrayField("dependencies", "Dependencies")
              : renderReadOnlyArrayField(metadata?.dependencies || [])}
          </div>

          <div className="pt-4">
            <h3 className="font-medium mb-2">Target Platforms</h3>
            {isEditing
              ? renderEditableArrayField("targetPlatforms", "Target Platforms")
              : renderReadOnlyArrayField(metadata?.targetPlatforms || [])}
          </div>

          <div className="pt-4">
            <h3 className="font-medium mb-2">Code Style</h3>
            {isEditing
              ? renderEditableCodeStyle()
              : metadata?.codeStyle && (
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Naming: </span>
                      <span className="text-sm">
                        {metadata.codeStyle.naming}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Comments: </span>
                      <span className="text-sm">
                        {metadata.codeStyle.comments}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Formatting: </span>
                      <span className="text-sm">
                        {metadata.codeStyle.formatting}
                      </span>
                    </div>
                  </div>
                )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MetadataForm;
