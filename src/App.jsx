import React from 'react';
import PdfRenderer from './PdfRenderer';

function App() {
  return (
    <div className='h-screen justify-evenly bg-tertiary max-w-5/6' id='app'>
      <PdfRenderer pdfUrl="/diss.pdf" />
    </div>
  );
}

export default App
