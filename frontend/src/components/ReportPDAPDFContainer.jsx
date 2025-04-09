import React, { useState } from 'react';
import ReportPDAPDF from './ReportPDAPDF';
import ErrorBoundary from './ErrorBoundary';

// This component wraps the ReportPDAPDF component with error handling
// and provides a cleaner API for the parent components
const ReportPDAPDFContainer = ({ data }) => {
  const [hasRenderError, setHasRenderError] = useState(false);

  // Error fallback UI
  const ErrorFallback = () => {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <h2 className="font-bold mb-2">Error Generating PDF</h2>
        <p>There was an error creating the PDF document. This might be due to unsupported content or images.</p>
        <button
          className="mt-2 bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-4 rounded"
          onClick={() => setHasRenderError(false)}
        >
          Try Again
        </button>
      </div>
    );
  };

  // If there was a render error, show the fallback UI
  if (hasRenderError) {
    return <ErrorFallback />;
  }

  // Otherwise try to render the PDF within an error boundary
  return (
    <ErrorBoundary 
      fallback={<ErrorFallback />}
      onError={() => setHasRenderError(true)}
    >
      <ReportPDAPDF data={data} />
    </ErrorBoundary>
  );
};

export default ReportPDAPDFContainer; 