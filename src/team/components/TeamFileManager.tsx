import React, { useState, useEffect } from "react";
import {
  Folder,
  File,
  FolderPlus,
  Upload,
  MoreVertical,
  Eye,
  Download,
  Trash2,
  Edit3,
  Move,
  ChevronRight,
  Home,
  ArrowLeft,
  Search,
  Grid,
  List,
  Share2,
} from "lucide-react";
import {
  teamFolderService,
  TeamFolderItem,
  FolderNavigationState,
} from "../utils/teamFolderService";
import { fileShareService } from "../../utils/fileShareService";
import { realTimeAuth } from "../../utils/realTimeAuth";
import { FileAccessFixButton } from "../../components/file/FileAccessFixButton";

interface TeamFileManagerProps {
  teamId: string;
  teamMembers: Array<{ id: string; name: string; email: string }>;
  onFilePreview: (file: TeamFolderItem) => void;
  onFileShare: (file: TeamFolderItem, event: React.MouseEvent) => void;
  onShareFileClick?: (currentFolderId: string | null) => void; // Pass current folder ID
}

export const TeamFileManager: React.FC<TeamFileManagerProps> = ({
  teamId,
  teamMembers,
  onFilePreview,
  onFileShare,
  onShareFileClick,
}) => {
  const [items, setItems] = useState<TeamFolderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [loadingFolderId, setLoadingFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [contextMenuItem, setContextMenuItem] = useState<TeamFolderItem | null>(
    null
  );

  // Folder creation state
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);

  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState<TeamFolderItem | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);

  // Error state
  const [indexError, setIndexError] = useState<string | null>(null);

  // Navigation state
  const [navigation, setNavigation] = useState<FolderNavigationState>({
    currentFolderId: null,
    currentPath: "/",
    breadcrumbs: [{ id: null, name: "Team Files", path: "/" }],
  });

  const user = realTimeAuth.getCurrentUser();

  useEffect(() => {
    if (teamId && user) {
      loadFolderContents();
    }
  }, [teamId, navigation.currentFolderId, user]);

  const loadFolderContents = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const folderItems = await teamFolderService.getTeamFolderContents(
        teamId,
        user.id,
        navigation.currentFolderId
      );
      setItems(folderItems);
    } catch (error) {
      console.error("Error loading folder contents:", error);
      console.error("Full error details:", {
        message: error instanceof Error ? error.message : String(error),
        teamId,
        currentFolderId: navigation.currentFolderId,
        userId: user?.id,
      });

      // Check if it's a Firestore index error
      if (
        error instanceof Error &&
        error.message.includes("requires an index")
      ) {
        console.warn("🔧 FIRESTORE INDEX MISSING:");
        console.warn("Collection: sharedFiles");
        console.warn(
          "Required fields: teamId (Asc), parentId (Asc), fileName (Asc)"
        );
        console.warn(
          "📖 See FIRESTORE_SETUP_GUIDE.md for index creation instructions."
        );

        // Extract the index creation URL from the error message
        const urlMatch = error.message.match(
          /https:\/\/console\.firebase\.google\.com[^\s]*/
        );
        setIndexError(urlMatch ? urlMatch[0] : null);

        // Try to load files using a simpler fallback query
        try {
          const fallbackFiles = await fileShareService.getTeamFiles(
            teamId,
            user.id
          );
          const fallbackItems = fallbackFiles.map((file) => ({
            id: file.id,
            name: file.fileName,
            type: "file" as const,
            size: file.fileSize,
            lastModified: file.lastModified,
            createdBy: file.sharedBy,
            parentId: file.parentId || null,
            folderPath: file.folderPath || "/",
            userPermissions: (file as any).userPermissions,
          }));
          setItems(fallbackItems);
        } catch (fallbackError) {
          console.error("Fallback query also failed:", fallbackError);
          setItems([]);
        }
      } else {
        setItems([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const navigateToFolder = async (
    folderId: string | null,
    folderName?: string
  ) => {
    setNavigating(true);
    try {
      const breadcrumbs = await teamFolderService.buildBreadcrumbs(
        teamId,
        folderId
      );

      setNavigation({
        currentFolderId: folderId,
        currentPath: folderId
          ? breadcrumbs[breadcrumbs.length - 1]?.path || "/"
          : "/",
        breadcrumbs,
      });
    } catch (error) {
      console.error("Error navigating to folder:", error);
    } finally {
      setNavigating(false);
      setLoadingFolderId(null);
    }
  };

  const handleItemDoubleClick = (item: TeamFolderItem) => {
    if (item.type === "folder") {
      setLoadingFolderId(item.id);
      navigateToFolder(item.id, item.name);
    } else {
      onFilePreview(item);
    }
  };

  const handleContextMenu = (event: React.MouseEvent, item: TeamFolderItem) => {
    event.preventDefault();
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
    setContextMenuItem(item);
    setShowContextMenu(true);
  };

  const handleCreateFolder = async () => {
    if (!user || !newFolderName.trim()) return;

    setCreatingFolder(true);
    try {
      await fileShareService.createFolder({
        teamId,
        folderName: newFolderName.trim(),
        description: "",
        parentId: navigation.currentFolderId,
        createdBy: user.id,
        // Permissions will be automatically set based on team membership
      });

      // Refresh folder contents
      await loadFolderContents();

      // Reset form
      setNewFolderName("");
      setShowCreateFolder(false);
    } catch (error) {
      console.error("Error creating folder:", error);
      alert("Failed to create folder. Please try again.");
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleDeleteItem = async (item: TeamFolderItem) => {
    if (!user) return;

    const confirmMessage =
      item.type === "folder"
        ? `Are you sure you want to delete the folder "${item.name}" and all its contents?`
        : `Are you sure you want to delete the file "${item.name}"?`;

    if (!confirm(confirmMessage)) return;

    try {
      if (item.type === "folder") {
        await fileShareService.deleteFolder(item.id, user.id, true);
      } else {
        await fileShareService.deleteFile(item.id, user.id);
      }

      await loadFolderContents();
      setShowContextMenu(false);
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item. Please try again.");
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, item: TeamFolderItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", item.id);
  };

  const handleDragOver = (e: React.DragEvent, targetItem?: TeamFolderItem) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    if (targetItem && targetItem.type === "folder") {
      setDragOverItem(targetItem.id);
    } else {
      setDragOverItem("root");
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear drag over if we're leaving the entire drop zone
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverItem(null);
    }
  };

  const handleDrop = async (
    e: React.DragEvent,
    targetItem?: TeamFolderItem
  ) => {
    e.preventDefault();
    setDragOverItem(null);

    if (!draggedItem || !user) return;

    // Determine target folder ID
    let targetFolderId: string | null = null;
    if (targetItem && targetItem.type === "folder") {
      targetFolderId = targetItem.id;
    } else {
      targetFolderId = navigation.currentFolderId;
    }

    // Don't allow dropping item on itself or moving to same location
    if (
      draggedItem.id === targetFolderId ||
      draggedItem.parentId === targetFolderId
    ) {
      setDraggedItem(null);
      return;
    }

    // Don't allow dropping folder into its own subfolder
    if (draggedItem.type === "folder" && targetItem) {
      // This would require checking the full folder hierarchy
      // For now, we'll implement a basic check
      if (targetItem.folderPath?.startsWith(draggedItem.folderPath || "")) {
        alert("Cannot move folder into its own subfolder");
        setDraggedItem(null);
        return;
      }
    }

    try {
      await teamFolderService.moveItem(
        draggedItem.id,
        draggedItem.type,
        targetFolderId,
        user.id
      );

      // Refresh folder contents
      await loadFolderContents();
    } catch (error) {
      console.error("Error moving item:", error);
      alert("Failed to move item. Please try again.");
    } finally {
      setDraggedItem(null);
    }
  };

  const getFilteredItems = () => {
    if (!searchQuery.trim()) return items;

    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "Unknown size";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Folder className="w-5 h-5 text-blue-600" />
            Team Files ({getFilteredItems().length})
          </h2>

          <div className="flex items-center gap-2">
            {onShareFileClick && (
              <button
                onClick={() => onShareFileClick(navigation.currentFolderId)}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
                title="Share File"
              >
                <Share2 className="w-4 h-4" />
                Share File
              </button>
            )}
            <FileAccessFixButton teamId={teamId} className="text-sm" />
            <button
              onClick={() => setShowCreateFolder(true)}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
              title="Create New Folder"
            >
              <FolderPlus className="w-4 h-4" />
              New Folder
            </button>
            <button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title={`Switch to ${viewMode === "grid" ? "list" : "grid"} view`}
            >
              {viewMode === "grid" ? (
                <List className="w-4 h-4" />
              ) : (
                <Grid className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => navigateToFolder(null)}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Home className="w-4 h-4" />
            Root
          </button>

          {navigation.breadcrumbs.slice(1).map((crumb, index) => (
            <React.Fragment key={crumb.id || index}>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <button
                onClick={() => navigateToFolder(crumb.id, crumb.name)}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                {crumb.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search files and folders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Navigation Loading Overlay */}
      {navigating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 flex flex-col items-center gap-4 shadow-xl">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Loading Folder
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Please wait while we load the folder contents...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Index Error Warning */}
      {indexError && (
        <div className="mx-4 mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                Firestore Index Required
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                The hierarchical file organization requires a Firestore index to
                work properly. Click the button below to automatically create
                the required index.
              </p>
              <div className="flex items-center gap-3">
                <a
                  href={indexError}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
                >
                  Create Index
                </a>
                <button
                  onClick={() => setIndexError(null)}
                  className="text-sm text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 transition-colors"
                >
                  Dismiss
                </button>
              </div>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                Index creation takes 5-15 minutes. Refresh the page once
                complete.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div
        className={`p-4 ${dragOverItem === "root" ? "bg-blue-50" : ""}`}
        onDragOver={(e) => handleDragOver(e)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e)}
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : getFilteredItems().length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                : "space-y-2"
            }
          >
            {getFilteredItems().map((item) => (
              <div
                key={item.id}
                draggable={(item as any).userPermissions?.canEdit}
                className={`${
                  viewMode === "grid"
                    ? "border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group relative"
                    : "flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                } cursor-pointer ${
                  dragOverItem === item.id ? "bg-blue-50 border-blue-300" : ""
                } ${draggedItem?.id === item.id ? "opacity-50" : ""} ${
                  loadingFolderId === item.id
                    ? "opacity-75 pointer-events-none"
                    : ""
                }`}
                onClick={() => handleItemDoubleClick(item)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleContextMenu(e, item);
                }}
                onDragStart={(e) => handleDragStart(e, item)}
                onDragOver={(e) => handleDragOver(e, item)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, item)}
              >
                {viewMode === "grid" ? (
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center space-x-3">
                      {item.type === "folder" ? (
                        <div className="relative">
                          <Folder className="w-8 h-8 text-blue-500 flex-shrink-0" />
                          {loadingFolderId === item.id && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <File className="w-8 h-8 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.type === "file"
                            ? formatFileSize(item.fileSize)
                            : "Folder"}
                        </p>
                      </div>
                    </div>

                    {item.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatDate(item.lastModified)}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (item.type === "file") onFilePreview(item);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onFileShare(item, e);
                          }}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                          title="Share"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleContextMenu(e, item);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title="More options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {item.type === "folder" ? (
                      <div className="relative">
                        <Folder className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        {loadingFolderId === item.id && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-3 h-3 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <File className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.type === "file"
                          ? formatFileSize(item.fileSize)
                          : "Folder"}{" "}
                        • {formatDate(item.lastModified)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.type === "file") onFilePreview(item);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onFileShare(item, e);
                        }}
                        className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                        title="Share"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleContextMenu(e, item);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title="More options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery
                ? "No files or folders match your search"
                : "No files or folders in this location"}
            </p>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {showContextMenu && contextMenuItem && (
        <div
          className="fixed bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg py-2 z-50"
          style={{
            left: contextMenuPosition.x,
            top: contextMenuPosition.y,
          }}
          onMouseLeave={() => setShowContextMenu(false)}
        >
          {contextMenuItem.type === "file" && (
            <button
              onClick={() => {
                onFilePreview(contextMenuItem);
                setShowContextMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
          )}

          <button
            onClick={(e) => {
              onFileShare(contextMenuItem, e);
              setShowContextMenu(false);
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Share
          </button>

          {(contextMenuItem as any).userPermissions?.canManage && (
            <button
              onClick={() => handleDeleteItem(contextMenuItem)}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>
      )}

      {/* Create Folder Modal */}
      {showCreateFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Create New Folder
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {navigation.currentPath === "/"
                ? "Creating folder in root directory"
                : `Creating folder in: ${navigation.currentPath}`}
            </p>
            <input
              type="text"
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              onKeyDown={(e) =>
                e.key === "Enter" && !creatingFolder && handleCreateFolder()
              }
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCreateFolder(false);
                  setNewFolderName("");
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                disabled={creatingFolder}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim() || creatingFolder}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {creatingFolder ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <FolderPlus className="w-4 h-4" />
                    Create Folder
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
