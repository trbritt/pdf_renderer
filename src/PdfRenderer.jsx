import React, { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { motion } from "framer-motion";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

const show = {
  opacity: 1,
  display: "block",
  duration: 2,
};

const hide = {
  opacity: 0,
  transitionEnd: {
    display: "none",
  },
};

const getPdfPageLabels = async (pdfUrl) => {
  const pdf = await pdfjs.getDocument(pdfUrl).promise;
  const pageLabels = await pdf.getPageLabels();
  console.log(pageLabels);
  return pageLabels;
};
function PdfRenderer({ pdfUrl }) {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

  const [numPages, setNumPages] = useState(null);
  const [pagesLoaded, setPagesLoaded] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [pdfDocument, setPdfDocument] = useState(null);
  const [pageLabels, setPageLabels] = useState([]);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const canvasRef = useRef(null);

  const [pdfError, setPdfError] = useState(null);

  useEffect(() => {
    const fetchPdfPageLabels = async () => {
      const labels = await getPdfPageLabels(pdfUrl);
      setPageLabels(labels);
    };
    fetchPdfPageLabels();
    if (numPages !== null && pagesLoaded === numPages) {
      console.log("All pages loaded");
    }
  }, [numPages, pagesLoaded]);

  function handleAnnotations(event) {
    const ipage = Number(event?.pageNumber ?? currentPage);
    if (ipage <= numPages && ipage >= 1) {
      setCurrentPage(ipage);
      updateInputValue(ipage);
    }
  }

  function handleLoadProgress({ loaded, total }) {
    const percentage = Math.floor((loaded / total) * 100);
    console.log(`Loading... ${percentage}%`);
  }
  function handleLoadError(error) {
    setPdfError(error);
  }

  function handleLoadSuccess({ numPages, outline }) {
    setNumPages(numPages);
  }

  function handlePageLoadSuccess() {
    setPagesLoaded((prevPagesLoaded) => prevPagesLoaded + 1);
  }

  function updateInputValue(ipage) {
    inputRef.current.value = pageLabels[ipage - 1];
  }
  function handleNextPage() {
    if (currentPage < numPages) {
      setCurrentPage(currentPage + 1);
      updateInputValue(currentPage + 1);
    }
  }

  function handlePrevPage() {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      updateInputValue(currentPage - 1);
    }
  }
  function handleWheel(event) {
    if (event.deltaY < 0 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
      updateInputValue(currentPage - 1);
    } else if (event.deltaY > 0 && currentPage < numPages) {
      setCurrentPage(currentPage + 1);
      updateInputValue(currentPage + 1);
    }
  }
  function handleInputForm(event) {
    if (event.keyCode === 13) {
      const ipage = pageLabels.indexOf(event.target?.value ?? 0) + 1;
      if (ipage <= numPages && ipage >= 1) {
        setCurrentPage(ipage);
        updateInputValue(ipage);
      } else {
        updateInputValue(currentPage);
        alert("What are you doing! Invalid page number.");
      }
    }
  }

  const current_pbar_width = 100 * Math.min(1, currentPage / numPages);
  return (
    <>
      <motion.div
        className={`progress-bar z-20 shadow-[0_10px_15px_-1px_rgba(0,0,0,0.1)] ${
          current_pbar_width === 100 ? "shadow-red-500" : null
        }`}
        style={{
          width: `${current_pbar_width}%`,
          stiffness: 100,
          damping: 30,
          restDelta: 0.001,
        }}
        animate={{ width: `${current_pbar_width}%` }}
      />

      <div
        initial="hidden"
        animate="show"
        className="flex py-20 justify-evenly backdrop-blur-3xl disableScroll"
        ref={containerRef}
        id="pdf-viewer"
        onWheel={handleWheel}
      >
        <Document
          file={pdfUrl}
          ref={canvasRef}
          onLoadProgress={handleLoadProgress}
          onLoadError={handleLoadError}
          onLoadSuccess={handleLoadSuccess}
          noData="No PDF file selected."
          loading="Loading PDF file..."
          onItemClick={handleAnnotations}
        >
          {Array.from(new Array(numPages), (el, index) => (
            <div
              className={`${
                index + 1 === currentPage ? "flex" : "hidden"
              } gap-20`}
            >
              <div animate={index + 1 <= numPages ? show : hide}>
                {index + 1 <= numPages ? (
                  <Page
                    id="pagechild"
                    key={index + 1}
                    pageNumber={index + 1}
                    onLoadSuccess={handlePageLoadSuccess}
                    height={
                      document.getElementById("app")?.clientHeight * 0.78 ??
                      1000
                    }
                  />
                ) : null}
              </div>
              <div
                animate={index + 1 <= numPages ? show : hide}
                className="xs:max-lg:hidden"
              >
                {index + 2 <= numPages ? (
                  <Page
                    key={index + 2}
                    pageNumber={index + 2}
                    onLoadSuccess={handlePageLoadSuccess}
                    height={
                      document.getElementById("app")?.clientHeight * 0.78 ??
                      1000
                    }
                  />
                ) : null}
              </div>
            </div>
          ))}
        </Document>
      </div>
      <div className="justify-evenly flex">
        <button
          className="bg-secondary rounded-xl w-1/6 shadow-xl"
          onClick={handlePrevPage}
        >
          Prev
        </button>
        <div className="flex justify-center items-center">
          Page &emsp;
          <input
            ref={inputRef}
            className="rounded text-center inline-block w-[35px] h-[26px]"
            type="text"
            onKeyDown={handleInputForm}
            defaultValue={pageLabels[0]}
          />{" "}
          &emsp; of &emsp;
          {Math.max(...pageLabels.filter((element) => parseInt(element)))}
        </div>
        <button
          className="bg-secondary rounded-xl w-1/6 shadow-xl"
          onClick={handleNextPage}
        >
          Next
        </button>
      </div>
    </>
  );
}

export default PdfRenderer;
