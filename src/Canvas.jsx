import { useEffect, useState } from "react";
import Header from "./components/Header";
import ToolModal from "./components/modal/ToolModal";
import ToolButton from "./components/ui/ToolButton";
import TextTool from "./components/ui/TextTool";
import ImageTool from "./components/ui/ImageTool";
import ShapeTool from "./components/ui/ShapeTool";
import Settings from "./components/Settings";
import BGTool from "./components/ui/BGTool";
import LogoTool from "./components/ui/LogoTool";
import UploadTool from "./components/ui/UploadTool";
import SchoolNameTool from "./components/ui/SchoolNameTool";
import TemplateTool from "./components/ui/Templatetool"; // Import TemplateTool
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
  FaLayerGroup, // Add this import
} from "react-icons/fa6";
import { FaPaintBrush } from "react-icons/fa";
import { IoImagesSharp, IoSettings } from "react-icons/io5";
import { IoIosCloseCircle } from "react-icons/io";
import { RiSendToBack, RiBringToFront } from "react-icons/ri";
import SaveModal from "./components/modal/SaveModal.jsx";
import {saveProjectToSupabase, getProjectsByMacId, getMacId, updateProjectInSupabase } from "./utils/supabaseUtils";
import useFabricCanvas from "./hooks/useFabricCanvas";
import * as tools from "./utils/canvasTools";
import { addImage } from "./utils/imageTools";
import { addBG } from "./utils/backGroundTool";
import { addLogo } from "./utils/LogoTool";
import { addWordCurve } from "./utils/wordCurveTool";
import { applyTemplateToCanvas } from "./utils/templateUtils"; // Add this import
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
import { Redo, Undo } from "lucide-react";
import { exportMultipleJsonToPDF } from "./utils/exportMultiPagePDF";
import { sendEmail } from "./utils/emailService";

function App() {
  const { canvasRef, canvas  , designSize} = useFabricCanvas();
  const [canvasList, setCanvasList] = useState([{ id: 1, json: null }]);
  const [activePage, setActivePage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSideBarOpen, setSideBarOpen] = useState(false);
  const [tool, setTool] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [projects, setProjects] = useState([]);
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [currentProjectUrl, setCurrentProjectUrl] = useState('');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [zoom, setZoom] = useState(1); // 1 = 100%

  const handleNavClick = (item) => {
    setIsModalOpen(true);
    setTool(item);
  };

  useEffect(() => {
    loadProjects();
  }, []);

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

    // Apply zoom with limit
    canvas.setZoom(zoomValue);

    // Keep the canvas centered
    canvas.setWidth(designSize.width * zoomValue);
    canvas.setHeight(designSize.height * zoomValue);

    canvas.requestRenderAll();
  };
  const handleOpenProjects = () => {
    setIsProjectsModalOpen(true);
  };

  const handleProjectSelect = (projectData) => {
    canvas.clear();
    canvas.loadFromJSON(projectData, () => {
      canvas.renderAll();
    });
    setCurrentProject(projectData);
  };

  const handleSave = async (projectName = null, isUpdate = false) => {
    try {
      const macId = getMacId();
      const canvasJson = canvas.toJSON();

      let result;

      if (isUpdate && currentProject && currentProject.id) {
        result = await updateProjectInSupabase(
          currentProject.id,
          projectName,
          canvasJson,
          macId
        );
      } else {
        result = await saveProjectToSupabase(projectName, canvasJson, macId);
        if (result.success) {
          setCurrentProject({ ...result.data[0], canvasData: canvasJson });
        }
      }

      if (result.success) {
        console.log('Project saved successfully');
        await loadProjects();
        return true;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Failed to save project:', error);
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
      alert('Project saved successfully!');
    } catch (error) {
      alert('Failed to save project: ' + error.message);
    }
  };

  const handleSendEmail = async (email, projectName) => {
    try {
      const imageResult = await uploadCanvasToImagesBucket(canvas, projectName);

      if (!imageResult.success) {
        throw new Error('Failed to upload image: ' + imageResult.error);
      }

      console.log('Image uploaded to:', imageResult.imageUrl);
      await sendEmail(email, projectName, imageResult.imageUrl, projectName);

    } catch (error) {
      throw new Error('Failed to send email: ' + error.message);
    }
  };

  // Add template handler function
  const handleTemplateSelect = async (templateUrl) => {
    try {
      await applyTemplateToCanvas(canvas, templateUrl);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to apply template:', error);
      alert('Failed to load template. Please try again.');
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
    applyTemplate: (url) => applyTemplateToCanvas(canvas, url),
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
    canvas.on("selection:created", () => setShowDelete(true));
    canvas.on("selection:updated", () => setShowDelete(true));
    canvas.on("selection:cleared", () => setShowDelete(false));

    canvas.on("object:added", handleChange);
    canvas.on("object:modified", handleChange);
    canvas.on("object:removed", handleChange);
    canvas.on("selection:cleared", handleChange);

    document.addEventListener("keydown", (e) => deleteActiveObject(e, canvas));

    return () => {
      document.removeEventListener("keydown", (e) =>
        deleteActiveObject(e, canvas)
      );
      canvas.off("object:added", handleChange);
      canvas.off("object:modified", handleChange);
      canvas.off("object:removed", handleChange);
      canvas.off("selection:cleared", handleChange);
    };
  }, [canvas, activePage, canvasList]);

  const { undo, redo, canUndo, canRedo } = useHistory(canvas);

  return (
    <div className="bg-gray-300 flex h-screen w-full flex-col overflow-hidden">
      <Header
        onExport={() => exportAsPNG(canvas)}
        onSave={handleSaveClick}
        onOpen={handleOpenProjects}
        onExportPDF={() => exportMultipleJsonToPDF(canvasList, canvas)}
        onSendEmail={() => setIsEmailModalOpen(true)}
      />
      <SaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSaveConfirm}
        currentProject={currentProject}
        defaultName={currentProject?.project_name || "My Design"}
      />

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

      <section className="flex gap-3 items-center px-5 py-2 bg-gray-100 border-b">
        <button
          className="bg-green-600 text-white px-3 py-1 rounded"
          onClick={() =>
            createNewPage({
              canvas,
              canvasList,
              setCanvasList,
              setActivePage,
            })
          }
        >
          ➕
        </button>

        <button
          className="bg-blue-600 text-white px-3 py-1 rounded"
          onClick={() =>
            duplicateCurrentPage({
              canvas,
              canvasList,
              setCanvasList,
              setActivePage,
            })
          }
        >
          📄
        </button>
        <button
          className="bg-red-500 text-white px-3 py-1 rounded"
          onClick={() =>
            deletePage({
              canvas,
              canvasList,
              activePage,
              setCanvasList,
              setActivePage,
            })
          }
        >
          X
        </button>
        <select
          value={activePage}
          onChange={(e) => {
            const id = Number(e.target.value);
            setActivePage(id);
            const selected = canvasList.find((p) => p.id === id);
            loadPageToCanvas({
              canvas,
              json: selected?.json || null,
              pageDefaults: {
                width: 300,
                height: 425,
                backgroundColor: "#ffffff",
              },
            });
          }}
          className="border px-2 py-1 rounded"
        >
          {canvasList.map((p, idx) => (
            <option key={p.id} value={p.id}>
              Page {idx + 1}
            </option>
          ))}
        </select>
        <button
          className=" p-1 cursor-pointer"
          disabled={!canUndo}
          onClick={undo}
        >
          <Undo />
        </button>
        <button
          className="p-1 cursor-pointer"
          disabled={!canRedo}
          onClick={redo}
        >
          <Redo />
        </button>
         <ZoomBar zoom={zoom} setZoom={handleZoomChange} />

      </section>
      <section className="w-full bg-gray-100 text-2xl flex justify-between px-7 py-3 md:hidden">
        {showDelete && (
          <section className="absolute bottom-3 left-33 z-10 flex items-center gap-2 bg-white px-4 py-2 rounded-xl">
            <button
              className="text-3xl text-red-500 cursor-pointer"
              onClick={() => handleDelete(canvas)}
            >
              <IoIosCloseCircle />
            </button>
            <button onClick={() => sendBackward(canvas)} className="text-3xl">
              <RiSendToBack />
            </button>
            <button onClick={() => bringForward(canvas)} className="text-3xl">
              <RiBringToFront />
            </button>
          </section>
        )}

        <section className="flex gap-5">
          <FaTextHeight onClick={() => handleNavClick("Text")} />
          <IoImagesSharp onClick={() => handleNavClick("Images")} />
          <FaShapes onClick={() => handleNavClick("Shapes")} />
          <FaPaintBrush onClick={() => handleNavClick("Background")} />
          <FaIcons onClick={() => handleNavClick("School Logo")} />
          <FaBuilding onClick={() => handleNavClick("School Name")} />
          <FaUpload onClick={() => handleNavClick("Upload")} />
          <FaLayerGroup onClick={() => handleNavClick("Templates")} /> {/* Add Template icon */}
        </section>

        <IoSettings
          className="cursor-pointer"
          onClick={() => setSideBarOpen(!isSideBarOpen)}
        />
      </section>

      <main className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="bg-white h-full w-[230px] z-20 transition-all duration-300 md:relative md:inline md:translate-x-0 fixed -left-60 md:left-0">
          <section className="h-full overflow-y-auto">
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
                <SchoolNameTool
                  addSchoolName={(text) => addSchoolNameText(text)}
                />
              )}
              {/* Add Template Tool */}
              {tool === "Templates" && (
                <TemplateTool onTemplateSelect={handleTemplateSelect} />
              )}
            </ToolModal>

            <section className="mt-5">
              <h1 className="text-xl font-semibold px-3 text-gray-500">
                Design Tools
              </h1>
              <section className="my-4">
                <ToolButton
                  text="Text"
                  icon={<FaTextHeight />}
                  onToolClick={handleNavClick}
                />
                <ToolButton
                  text="Images"
                  icon={<IoImagesSharp />}
                  onToolClick={handleNavClick}
                />
                <ToolButton
                  text="Shapes"
                  icon={<FaShapes />}
                  onToolClick={handleNavClick}
                />
                <ToolButton
                  text="Background"
                  icon={<FaPaintBrush />}
                  onToolClick={handleNavClick}
                />
                <ToolButton
                  text="Templates"
                  icon={<FaLayerGroup />}
                  onToolClick={handleNavClick}
                />
              </section>
              <hr className="border-gray-200" />
              <section className="my-5">
                <h1 className="text-xl font-semibold px-3 text-gray-500">
                  Elements
                </h1>
                <section className="mt-4">
                  <ToolButton
                    text="School Name"
                    icon={<FaIcons />}
                    onToolClick={handleNavClick}
                  />
                  <ToolButton
                    text="School Logo"
                    icon={<FaListUl />}
                    onToolClick={handleNavClick}
                  />
                  <ToolButton
                    text="Upload"
                    icon={<FaUpload />}
                    onToolClick={handleNavClick}
                  />
                </section>
              </section>
            </section>
          </section>
        </div>

        {/* Canvas */}
        <div className="flex justify-center w-full mt-10" style={{
    overflow: "auto", // 🔥 Enable scrollbar
  }}>
          <canvas ref={canvasRef}></canvas>
        </div>

        <Settings canvas={canvas} isSideBarOpen={isSideBarOpen} />
      </main>
    </div>
  );
}

export default App;