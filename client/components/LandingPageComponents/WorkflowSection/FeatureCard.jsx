import React from 'react';
import { WorkflowFeatureCardWrapper } from '../style';

// Placeholder component for the workflow feature cards
const FeatureCard = ({ title, description }) => (
  <WorkflowFeatureCardWrapper>
    <h4 className="title">{title}</h4>
    <p className="description">{description}</p>
    </WorkflowFeatureCardWrapper>
);

export default FeatureCard;