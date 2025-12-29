import React from "react";
import Spinner from "../../../../common/Spinner";
import { ProgressReportModalWrapper } from "../../style";

interface LoadingStateProps {
  message?: string;
}

/**
 * LoadingState - Shared loading state component for report modals
 */
const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading report data...",
}) => {
  return (
    <ProgressReportModalWrapper>
      <div className="loading-container">
        <Spinner color="#000" width="40px" height="40px" />
        <p className="loading-text">{message}</p>
      </div>
    </ProgressReportModalWrapper>
  );
};

export default LoadingState;

