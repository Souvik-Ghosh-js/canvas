import { useEffect, useState } from "react";
import Header from "./components/Header";
import ToolModal from "./components/modal/ToolModal";
import ToolButton from "./components/ui/ToolButton";
import TextTool from "./components/ui/TextTool";
import ImageTool from "./components/ui/ImageTool";
import ShapeTool from "./components/ui/ShapeTool";
import Settings from "./components/Settings";
import ElementTool from "./components/ui/ElementTool";
import BGTool from "./components/ui/BGTool";
import LogoTool from "./components/ui/LogoTool";
import { addElement } from "./utils/addElement.js";
import UploadTool from "./components/ui/UploadTool";
import SchoolNameTool from "./components/ui/SchoolNameTool";
import TemplateTool from "./components/ui/TemplateTool.jsx";
import ProjectsModal from "./components/modal/projectModal";
import EmailModal from "./components/modal/emailModal";
import ZoomBar from "./components/ui/Zoombar.jsx";
import {
  FaTextHeight,
  FaIcons,
  FaListUl,
  FaUpload,
  FaShapes,
  FaBuilding,
  FaLayerGroup,
} from "react-icons/fa6";
import { FaPaintBrush } from "react-icons/fa";
import { IoImagesSharp, IoSettings } from "react-icons/io5";
import { IoIosCloseCircle } from "react-icons/io";
import { RiSendToBack, RiBringToFront } from "react-icons/ri";
import SaveModal from "./components/modal/SaveModal.jsx";
import {
  saveProjectToSupabase,
  getProjectsByMacId,
  getMacId,
  updateProjectInSupabase,
} from "./utils/supabaseUtils";
import useFabricCanvas from "./hooks/useFabricCanvas";
import * as tools from "./utils/canvasTools";
import { addImage } from "./utils/imageTools";
import { addBG } from "./utils/backGroundTool";
import { addLogo } from "./utils/LogoTool";
import { addWordCurve } from "./utils/wordCurveTool";
import { applyTemplateToCanvas } from "./utils/templateUtils";
import { bringForward, sendBackward } from "./utils/layerUtils";
import { deleteActiveObject, handleDelete } from "./utils/deleteUtils";
import {
  createNewPage,
  deletePage,
  duplicateCurrentPage,
  loadPageToCanvas,
} from "./utils/pageUtils";
import { uploadCanvasToImagesBucket } from "./utils/imageUploadUtils";

import {
  exportAsPNG,
  saveCanvasState,
  handleFileOpen,
} from "./utils/exportUtils";

import { Circle, Rect, Textbox } from "fabric";
import useHistory from "./hooks/useUndoRedo";
import { Redo, Undo, Plus, Copy, Trash2, Menu, X } from "lucide-react";
import { exportMultipleJsonToPDF } from "./utils/exportMultiPagePDF";
import { sendEmail } from "./utils/emailService";

function App() {
  const { canvasRef, canvas, designSize } = useFabricCanvas();
  const [canvasList, setCanvasList] = useState([{ id: 1, json: null }]);
  const [activePage, setActivePage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSideBarOpen, setSideBarOpen] = useState(false);
  const [tool, setTool] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [projects, setProjects] = useState([]);
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [currentProjectUrl, setCurrentProjectUrl] = useState("");
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // New states for export modals
  const [isProjectExportModalOpen, setIsProjectExportModalOpen] =
    useState(false);
  const [isPageExportModalOpen, setIsPageExportModalOpen] = useState(false);
  const [exportProjectName, setExportProjectName] = useState("");
  const [exportPageName, setExportPageName] = useState("");

  const handleNavClick = (item) => {
    setIsModalOpen(true);
    setTool(item);
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    loadProjects();
    // Set default export names
    setExportProjectName(currentProject?.project_name || "My Design");
    setExportPageName(
      `${currentProject?.project_name || "design"}_page_${activePage}`
    );
  }, [currentProject, activePage]);

  const loadProjects = async () => {
    const macId = getMacId();
    const result = await getProjectsByMacId(macId);
    if (result.success) {
      setProjects(result.data);
    }
  };

  const handleZoomChange = (value) => {
    if (!canvas) return;

    const zoomValue = parseFloat(value);
    setZoom(zoomValue);

    canvas.setZoom(zoomValue);
    canvas.setWidth(designSize.width * zoomValue);
    canvas.setHeight(designSize.height * zoomValue);
    canvas.requestRenderAll();
  };

  const handleOpenProjects = () => {
    setIsProjectsModalOpen(true);
  };

  const handleProjectSelect = (projectData) => {
    if (projectData.pages && Array.isArray(projectData.pages)) {
      // Load the complete project with all pages
      setCanvasList(projectData.pages);

      // Set the active page
      const targetPage = projectData.activePage || 1;
      setActivePage(targetPage);

      // Load the active page to canvas
      const activePageData = projectData.pages.find(
        (page) => page.id === targetPage
      );
      if (activePageData?.json) {
        canvas.loadFromJSON(activePageData.json, () => {
          canvas.renderAll();
        });
      } else {
        canvas.clear();
        canvas.setBackgroundColor("#ffffff", () => {
          canvas.requestRenderAll();
        });
      }

      setCurrentProject(projectData);
    } else {
      // Fallback for old project format (single page)
      canvas.clear();
      canvas.loadFromJSON(projectData, () => {
        canvas.renderAll();
      });
      setCurrentProject(projectData);
      // Reset to single page
      setCanvasList([{ id: 1, json: projectData }]);
      setActivePage(1);
    }
  };

  const handleSave = async (projectName = null, isUpdate = false) => {
    try {
      const macId = getMacId();

      // Save current page state first
      const updatedCanvasList = canvasList.map((page) =>
        page.id === activePage ? { ...page, json: canvas.toJSON() } : page
      );

      // Create project data with ALL pages
      const projectData = {
        pages: updatedCanvasList,
        activePage: activePage,
        totalPages: updatedCanvasList.length,
      };

      let result;

      if (isUpdate && currentProject && currentProject.id) {
        result = await updateProjectInSupabase(
          currentProject.id,
          projectName,
          projectData, // Save the complete project data with all pages
          macId
        );
      } else {
        result = await saveProjectToSupabase(projectName, projectData, macId);
        if (result.success) {
          setCurrentProject({ ...result.data[0], canvasData: projectData });
        }
      }

      if (result.success) {
        // Update local state with the saved pages
        setCanvasList(updatedCanvasList);
        console.log(
          "Project saved successfully with",
          updatedCanvasList.length,
          "pages"
        );
        await loadProjects();
        return true;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Failed to save project:", error);
      throw error;
    }
  };

  const handleSaveClick = () => {
    setIsSaveModalOpen(true);
  };

  const handleSaveConfirm = async (projectName, saveAsNew = false) => {
    try {
      let isUpdate = false;

      if (currentProject && currentProject.id && !saveAsNew) {
        isUpdate = true;
      }

      await handleSave(projectName, isUpdate);
      setIsSaveModalOpen(false);
      alert("Project saved successfully!");
    } catch (error) {
      alert("Failed to save project: " + error.message);
    }
  };

  const handleSendEmail = async (email, projectName) => {
    try {
      const imageResult = await uploadCanvasToImagesBucket(canvas, projectName);

      if (!imageResult.success) {
        throw new Error("Failed to upload image: " + imageResult.error);
      }

      console.log("Image uploaded to:", imageResult.imageUrl);
      await sendEmail(email, projectName, imageResult.imageUrl, projectName);
    } catch (error) {
      throw new Error("Failed to send email: " + error.message);
    }
  };

  // Updated template handler function
  const handleTemplateSelect = async (template) => {
    try {
      console.log("Applying template:", template.name);

      // Apply the template
      await applyTemplateToCanvas(canvas, template);

      // Force multiple re-renders and state updates
      canvas.renderAll();
      canvas.requestRenderAll();

      // Force a state update to trigger React re-render
      setCanvasList((prev) => [...prev]);

      // Close the modal after a small delay to ensure rendering is complete
      setTimeout(() => {
        setIsModalOpen(false);
      }, 100);
    } catch (error) {
      console.error("Failed to apply template:", error);
      alert("Failed to load template. Please try again.");
    }
  };

  // Function to upload canvas as image and get URL
  const uploadCanvasImage = async (canvasInstance, fileName) => {
    try {
      const imageResult = await uploadCanvasToImagesBucket(canvasInstance, fileName);
      if (imageResult.success) {
        return imageResult.imageUrl;
      } else {
        throw new Error("Failed to upload image: " + imageResult.error);
      }
    } catch (error) {
      console.error("Error uploading canvas image:", error);
      throw error;
    }
  };

  // Open export modals
  const handleOpenProjectExport = () => {
    setExportProjectName(currentProject?.project_name || "My Design");
    setIsProjectExportModalOpen(true);
  };

  const handleOpenPageExport = () => {
    setExportPageName(
      `${currentProject?.project_name || "design"}_page_${activePage}`
    );
    setIsPageExportModalOpen(true);
  };

  // Export project as JSON file with image URL
  const exportProjectAsJson = async (projectName) => {
    try {
      // First save current page state
      const updatedCanvasList = canvasList.map((page) =>
        page.id === activePage ? { ...page, json: canvas.toJSON() } : page
      );

      // Upload project preview image (use first page as preview)
      let projectImageUrl = "";
      try {
        projectImageUrl = await uploadCanvasImage(canvas, `${projectName}_preview`);
      } catch (error) {
        console.warn("Could not upload project preview image:", error);
      }

      const projectData = {
        project: projectName,
        pages: updatedCanvasList,
        activePage: activePage,
        exportDate: new Date().toISOString(),
        version: "1.0",
        totalPages: updatedCanvasList.length,
        projectImageUrl: projectImageUrl, // Add the image URL here
      };

      const dataStr = JSON.stringify(projectData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });

      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${projectName}_project.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Update local state
      setCanvasList(updatedCanvasList);

      setIsProjectExportModalOpen(false);
      setExportProjectName("");
      alert(
        `Project exported with ${updatedCanvasList.length} pages successfully!`
      );
    } catch (error) {
      console.error("Error exporting project as JSON:", error);
      alert("Failed to export project as JSON");
    }
  };

  // Export current canvas as JSON with image URL
  const exportCurrentCanvasAsJson = async (pageName) => {
    try {
      const canvasJson = canvas.toJSON();
      
      // Upload page image
      let pageImageUrl = "";
      try {
        pageImageUrl = await uploadCanvasImage(canvas, pageName);
      } catch (error) {
        console.warn("Could not upload page image:", error);
      }

      const pageData = {
        pageName: pageName,
        pageNumber: activePage,
        canvasData: canvasJson,
        exportDate: new Date().toISOString(),
        version: "1.0",
        pageImageUrl: pageImageUrl, // Add the image URL here
      };

      const dataStr = JSON.stringify(pageData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });

      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${pageName}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsPageExportModalOpen(false);
      setExportPageName("");
      alert(`Page "${pageName}" exported as JSON successfully!`);
    } catch (error) {
      console.error("Error exporting canvas as JSON:", error);
      alert("Failed to export canvas as JSON");
    }
  };

  const handler = {
    addSquare: () => tools.addSquare(canvas),
    addRounded: () => tools.addRoundedSquare(canvas),
    addCircle: () => tools.addCircle(canvas),
    addTriangle: () => tools.addTriangle(canvas),
    addHeadingText: () => tools.addHeadingText(canvas),
    addSubHeadingText: () => tools.addSubHeadingText(canvas),
    addSimpleText: () => tools.addSimpleText(canvas),
    addBengaliText: () => tools.addBengaliText(canvas),
    addWordArt_1: () => tools.addWordArt_1(canvas),
    addWordArt_2: () => tools.addWordArt_2(canvas),
    addWordArt_3: () => tools.addWordArt_3(canvas),
    addWordArt_4: () => tools.addWordArt_4(canvas),
    addWordArt_5: () => tools.addWordArt_5(canvas),
    addWordArt_6: () => tools.addWordArt_6(canvas),
    addWordArt_7: () => tools.addWordArt_7(canvas),
    applyTemplate: (template) => applyTemplateToCanvas(canvas, template),
    addElement: (url) => addElement(canvas, url), // Add this line
  };

  const addSchoolNameText = (text) => {
    canvas.add(
      new Textbox(text, {
        left: 100,
        top: 100,
        fontSize: 60,
        width: 300,
        fill: "black",
        fontWeight: 500,
        textAlign: "center",
      })
    );
  };

  const addSchoolLogo = (imageUrl) => {
    if (!canvas) return;
    addImage(canvas, imageUrl);
  };

  // Function to switch between pages
  const switchPage = (pageId) => {
    if (!canvas || activePage === pageId) return;
    try {
      // Save current page state
      const updatedCanvasList = canvasList.map((page) =>
        page.id === activePage ? { ...page, json: canvas.toJSON() } : page
      );

      setCanvasList(updatedCanvasList);
      setActivePage(pageId);

      // Load the selected page
      const selectedPage = updatedCanvasList.find((p) => p.id === pageId);
      const currentWidth = canvas.getWidth();
      const currentHeight = canvas.getHeight();

      if (selectedPage.json.backgroundImage) {
        const scaleX = currentWidth / selectedPage.json.backgroundImage.width;
        const scaleY = currentHeight / selectedPage.json.backgroundImage.height;
        selectedPage.json.backgroundImage.scaleX = scaleX;
        selectedPage.json.backgroundImage.scaleY = scaleY;
      }
      if (selectedPage?.json) {
        canvas.loadFromJSON(selectedPage.json).then(() => {
          canvas.requestRenderAll();
        });
      } else {
        // Set default background for empty page
        canvas.clear();
        canvas.setBackgroundColor("#ffffff", () => {
          canvas.requestRenderAll();
        });
      }
    } catch (error) {
      console.error("Error switching page:", error);
    }
  };

  // Enhanced layer control functions
  const handleBringForward = () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      bringForward(canvas);
      canvas.requestRenderAll();
    }
  };

  const handleSendBackward = () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      sendBackward(canvas);
      canvas.requestRenderAll();
    }
  };

  const handleDeleteObject = () => {
    if (!canvas) return;
    handleDelete(canvas);
    setShowDelete(false);
  };

  // --- Canvas event listeners
  useEffect(() => {
    if (!canvas) {
      document.removeEventListener("keydown", deleteActiveObject);
      return;
    }

    const saveCurrentPage = () => {
      setCanvasList((prev) =>
        prev.map((p) =>
          p.id === activePage ? { ...p, json: canvas.toJSON() } : p
        )
      );
    };

    const handleChange = () => {
      saveCurrentPage();
    };

    const handleSelection = () => {
      const activeObject = canvas.getActiveObject();
      setShowDelete(!!activeObject);
    };

    canvas.on("selection:created", handleSelection);
    canvas.on("selection:updated", handleSelection);
    canvas.on("selection:cleared", () => setShowDelete(false));

    canvas.on("object:added", handleChange);
    canvas.on("object:modified", handleChange);
    canvas.on("object:removed", handleChange);

    document.addEventListener("keydown", (e) => deleteActiveObject(e, canvas));

    return () => {
      document.removeEventListener("keydown", (e) =>
        deleteActiveObject(e, canvas)
      );
      canvas.off("selection:created", handleSelection);
      canvas.off("selection:updated", handleSelection);
      canvas.off("selection:cleared", handleSelection);
      canvas.off("object:added", handleChange);
      canvas.off("object:modified", handleChange);
      canvas.off("object:removed", handleChange);
    };
  }, [canvas, activePage, canvasList]);

  const { undo, redo, canUndo, canRedo } = useHistory(canvas);

  return (
    <div className="bg-linear-to-br from-slate-50 to-blue-50 flex w-full  flex-col overflow-hidden">
      {/* Modern Header */}
      <Header
        onExport={() => exportAsPNG(canvas)}
        onSave={handleSaveClick}
        onOpen={handleOpenProjects}
        onExportJSON={handleOpenProjectExport}
        onExportCurrentJSON={handleOpenPageExport}
        onSendEmail={() => setIsEmailModalOpen(true)}
      />

      {/* Save Modal */}
      <SaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSaveConfirm}
        currentProject={currentProject}
        defaultName={currentProject?.project_name || "My Design"}
      />

      {/* Project Export Modal */}
      {isProjectExportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-4 text-gray-800">
              Export Project as JSON
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={exportProjectName}
                onChange={(e) => setExportProjectName(e.target.value)}
                placeholder="Enter project name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsProjectExportModalOpen(false);
                  setExportProjectName("");
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => exportProjectAsJson(exportProjectName)}
                disabled={!exportProjectName.trim()}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed font-medium shadow-md transition-all"
              >
                Export Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Export Modal */}
      {isPageExportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-4 text-gray-800">
              Export Page as JSON
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Page Name
              </label>
              <input
                type="text"
                value={exportPageName}
                onChange={(e) => setExportPageName(e.target.value)}
                placeholder="Enter page name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                Current Page: {activePage} of {canvasList.length}
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsPageExportModalOpen(false);
                  setExportPageName("");
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => exportCurrentCanvasAsJson(exportPageName)}
                disabled={!exportPageName.trim()}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed font-medium shadow-md transition-all"
              >
                Export Page
              </button>
            </div>
          </div>
        </div>
      )}

      <ProjectsModal
        isOpen={isProjectsModalOpen}
        onClose={() => setIsProjectsModalOpen(false)}
        projects={projects}
        onProjectSelect={handleProjectSelect}
        canvas={canvas}
      />

      <EmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onSendEmail={handleSendEmail}
        fileName="my_design"
      />

      {/* Page Management Section */}
      <section className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-3 py-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          {/* Action Buttons */}
          <div className="flex gap-2 items-center justify-center sm:justify-start overflow-x-auto pb-1 sm:pb-0">
            <button
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-3 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg whitespace-nowrap flex-shrink-0"
              onClick={() => {
                createNewPage(
                  canvas,
                  canvasList,
                  setCanvasList,
                  setActivePage,
                  activePage
                );
              }}
              title="Create New Page"
            >
              <Plus size={16} />
              <span>New Page</span>
            </button>

            <button
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-3 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg whitespace-nowrap flex-shrink-0"
              onClick={() => {
                duplicateCurrentPage({
                  canvas,
                  canvasList,
                  setCanvasList,
                  setActivePage,
                  activePage,
                });
              }}
              title="Duplicate Current Page"
            >
              <Copy size={16} />
              <span>Duplicate</span>
            </button>

            <button
              className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-3 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg whitespace-nowrap flex-shrink-0"
              onClick={() => {
                deletePage({
                  canvas,
                  canvasList,
                  activePage,
                  setCanvasList,
                  setActivePage,
                });
              }}
              title="Delete Current Page"
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          </div>

          {/* Page Selector and Controls */}
          <div className="flex gap-3 items-center justify-center sm:justify-end overflow-x-auto pb-1 sm:pb-0">
            {/* Page Selector */}
            <select
              value={activePage}
              onChange={(e) => {
                const pageId = Number(e.target.value);
                switchPage(pageId);
              }}
              className="border border-gray-300 px-3 py-2 rounded-lg text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all min-w-[100px] font-medium flex-shrink-0"
              title="Select Page"
            >
              {canvasList.map((page, index) => (
                <option key={page.id} value={page.id}>
                  Page {index + 1}
                </option>
              ))}
            </select>

            {/* Undo/Redo Buttons */}
            <div className="flex gap-1 border-l border-gray-300 pl-3 flex-shrink-0">
              <button
                className="p-2 cursor-pointer hover:bg-gray-100 rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent border border-gray-200"
                disabled={!canUndo}
                onClick={undo}
                title="Undo"
              >
                <Undo size={18} />
              </button>
              <button
                className="p-2 cursor-pointer hover:bg-gray-100 rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent border border-gray-200"
                disabled={!canRedo}
                onClick={redo}
                title="Redo"
              >
                <Redo size={18} />
              </button>
            </div>

            {/* Zoom Bar */}
            <div className="min-w-[120px] flex-shrink-0">
              <ZoomBar zoom={zoom} setZoom={handleZoomChange} />
            </div>
          </div>
        </div>
      </section>

      {/* Page Scrollbar - Only show when more than 1 page */}
      {canvasList.length > 1 && (
        <section className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-3 py-2">
          <div className="flex items-center gap-3 overflow-x-auto">
            <span className="text-sm font-semibold text-gray-700 whitespace-nowrap flex-shrink-0">
              Pages:
            </span>
            <div className="flex gap-2 pb-1">
              {canvasList.map((page, index) => (
                <button
                  key={page.id}
                  onClick={() => switchPage(page.id)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-200 min-w-[90px] shadow-sm flex-shrink-0 ${
                    activePage === page.id
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300"
                  }`}
                >
                  Page {index + 1}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Toolbar */}
      <section className="w-full bg-white/90 backdrop-blur-sm border-b border-gray-200/50 flex justify-between items-center px-4 py-3">
        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          title="Tools Menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Tool Icons - Desktop */}
        <section className="hidden md:flex items-center gap-2 lg:gap-3">
          {[
            { id: "Text", icon: FaTextHeight, color: "blue" },
            { id: "Images", icon: IoImagesSharp, color: "green" },
            { id: "Shapes", icon: FaShapes, color: "purple" },
            { id: "Background", icon: FaPaintBrush, color: "orange" },
            { id: "School Logo", icon: FaIcons, color: "red" },
            { id: "School Name", icon: FaBuilding, color: "teal" },
            { id: "Upload", icon: FaUpload, color: "gray" },
            { id: "Templates", icon: FaLayerGroup, color: "indigo" },
          ].map(({ id, icon: Icon, color }) => (
            <button
              key={id}
              onClick={() => handleNavClick(id)}
              className={`p-3 hover:bg-${color}-50 rounded-xl transition-all duration-200 border border-transparent hover:border-${color}-200 hover:shadow-sm group`}
              title={id}
            >
              <Icon
                className={`text-xl text-${color}-600 group-hover:scale-110 transition-transform`}
              />
            </button>
          ))}
        </section>

        {/* Mobile Toolbar - Always visible compact version */}
        <section className="flex md:hidden items-center gap-1 overflow-x-auto flex-1 justify-center mx-2">
          {[
            { id: "Text", icon: FaTextHeight, color: "blue" },
            { id: "Images", icon: IoImagesSharp, color: "green" },
            { id: "Shapes", icon: FaShapes, color: "purple" },
            { id: "Background", icon: FaPaintBrush, color: "orange" },
            { id: "Templates", icon: FaLayerGroup, color: "indigo" },
          ].map(({ id, icon: Icon, color }) => (
            <button
              key={id}
              onClick={() => handleNavClick(id)}
              className={`p-2 hover:bg-${color}-50 rounded-lg transition-all duration-200 border border-transparent hover:border-${color}-200 hover:shadow-sm group flex-shrink-0`}
              title={id}
            >
              <Icon
                className={`text-lg text-${color}-600 group-hover:scale-110 transition-transform`}
              />
            </button>
          ))}
        </section>

        {/* Settings Icon */}
        <button
          className="p-2 md:p-3 hover:bg-gray-100 rounded-lg md:rounded-xl transition-all duration-200 border border-transparent hover:border-gray-200 hover:shadow-sm flex-shrink-0"
          onClick={() => setSideBarOpen(!isSideBarOpen)}
          title="Settings"
        >
          <IoSettings className="text-lg md:text-xl text-gray-600 hover:text-gray-800" />
        </button>
      </section>

      <main className="flex flex-1 overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`bg-white h-full w-64 z-50 transition-all duration-300 md:relative md:translate-x-0 fixed top-0 left-0 shadow-xl ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          } md:shadow-none`}
        >
          <div className="flex justify-between items-center p-4 border-b border-gray-200 md:hidden">
            <h2 className="text-lg font-bold text-gray-800">Design Tools</h2>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          <section className="h-full overflow-y-auto p-4">
            <ToolModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            >
              {tool === "Text" && (
                <TextTool
                  action={handler}
                  addWordCurvature={() => addWordCurve(canvas)}
                />
              )}
              {tool === "Images" && (
                <ImageTool action={(url) => addImage(canvas, url)} />
              )}
              {tool === "Shapes" && <ShapeTool action={handler} />}
              {tool === "Background" && (
                <BGTool addBackground={(url) => addBG(canvas, url)} />
              )}
              {tool === "School Logo" && (
                <LogoTool addBackground={(url) => addLogo(canvas, url)} />
              )}
              {tool === "Upload" && <UploadTool canvas={canvas} />}
              {tool === "School Name" && (
                <SchoolNameTool addSchoolLogo={(url) => addSchoolLogo(url)} />
              )}
              {tool === "Templates" && (
                <TemplateTool
                  onTemplateSelect={handleTemplateSelect}
                  canvas={canvas}
                  setActivePage={setActivePage}
                  setCanvasList={setCanvasList}
                />
              )}
              {tool === "Elements" && (
                <ElementTool action={(url) => addElement(canvas, url)} />
              )}
            </ToolModal>

            <section className="mt-2">
              <h1 className="text-lg font-bold px-2 text-gray-700 mb-4 hidden md:block">
                Design Tools
              </h1>
              <section className="space-y-2">
                {[
                  {
                    text: "Text",
                    icon: <FaTextHeight className="text-blue-600" />,
                  },
                  {
                    text: "Images",
                    icon: <IoImagesSharp className="text-green-600" />,
                  },
                  {
                    text: "Shapes",
                    icon: <FaShapes className="text-purple-600" />,
                  },
                  {
                    text: "Background",
                    icon: <FaPaintBrush className="text-orange-600" />,
                  },
                  {
                    text: "Templates",
                    icon: <FaLayerGroup className="text-indigo-600" />,
                  },
                ].map((item) => (
                  <ToolButton
                    key={item.text}
                    text={item.text}
                    icon={item.icon}
                    onToolClick={handleNavClick}
                  />
                ))}
              </section>
              <hr className="border-gray-200 my-4" />
              <section>
                <h1 className="text-lg font-bold px-2 text-gray-700 mb-4 hidden md:block">
                  Elements
                </h1>
                <section className="space-y-2">
                  {[
                    {
                      text: "School Name",
                      icon: <FaIcons className="text-teal-600" />,
                    },
                    {
                      text: "School Logo",
                      icon: <FaListUl className="text-red-600" />,
                    },
                    {
                      text: "Upload",
                      icon: <FaUpload className="text-gray-600" />,
                    },
                    {
                      text: "Elements",
                      icon: <FaShapes className="text-purple-600" />,
                    },
                  ].map((item) => (
                    <ToolButton
                      key={item.text}
                      text={item.text}
                      icon={item.icon}
                      onToolClick={handleNavClick}
                    />
                  ))}
                </section>
              </section>
            </section>
          </section>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex items-center justify-center p-2 md:p-4 lg:p-6 overflow-auto bg-gradient-to-br from-slate-100 to-blue-100/50 relative">
          {/* Clean Canvas Container */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 max-w-full">
            <canvas ref={canvasRef} className="block rounded-lg max-w-full" />
          </div>

          {/* Floating Object Controls */}
          {showDelete && (
            <div className="fixed bottom-16 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-2xl border border-gray-200/50 z-40">
              <button
                className="p-2 text-red-500 cursor-pointer hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110"
                onClick={handleDeleteObject}
                title="Delete selected object"
              >
                <IoIosCloseCircle size={20} />
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <button
                onClick={handleSendBackward}
                className="p-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all duration-200 hover:scale-110"
                title="Send backward"
              >
                <RiSendToBack size={18} />
              </button>
              <button
                onClick={handleBringForward}
                className="p-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all duration-200 hover:scale-110"
                title="Bring forward"
              >
                <RiBringToFront size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Settings Sidebar */}
        <Settings
          canvas={canvas}
          isSideBarOpen={isSideBarOpen}
          onClose={() => setSideBarOpen(false)}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 px-4 py-2 h-12 flex items-center justify-between">
        {/* Left side - Development Partner */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600 font-medium">Development Partner</span>
          <a 
            href="https://gobt.in/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity"
          >
            <img 
              src="https://dtpszuxlofjlvbqqxsep.supabase.co/storage/v1/object/public/gobtlogo/ChatGPT%20Image%20Nov%2021,%202025,%2010_38_20%20PM.png" 
              alt="GOBT.in" 
              className="h-12 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            {/* Fallback text if logo fails to load */}
            <span className="text-xs text-blue-600 font-semibold hidden">GOBT.in</span>
          </a>
        </div>

        {/* Right side - Logo */}
       
      </footer>
    </div>
  );
}

export default App;