import React from 'react';
import { CoreFeatureCardWrapper } from '../style';

const CoreFeatureCard = ({ iconPlaceholder, title, description }) => {
  return (
    <CoreFeatureCardWrapper>
      <div className="icon-placeholder">{iconPlaceholder}</div>
      <div className='feature-info'>
      <h4 className="title">{title}</h4>
      <p className="description">{description}</p>
      </div>
    </CoreFeatureCardWrapper>
  );
};

export default CoreFeatureCard;
