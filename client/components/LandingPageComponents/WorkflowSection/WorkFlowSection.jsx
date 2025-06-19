import React, { useState } from 'react';
import { WorkFlowSectionWrapper } from '../style';
import workflowLeftImage1 from '../assets/images/workflow-left-image-1.gif';
import workflowLeftImage2 from '../assets/images/workflow-left-image-2.gif';
import workflowLeftImage3 from '../assets/images/workflow-left-image-3.gif';
import workflowLeftImage4 from '../assets/images/workflow-left-image-4.gif';
import workFlowMainImage from '../assets/images/workflow-main-image.jpeg';
import CustomSwiper from '../../Swiper';
import { SwiperSlide } from 'swiper/react';
import FeatureCard from './FeatureCard';

const WorkFlowSection = () => {
  const [selectedImage, setSelectedImage] = useState(workFlowMainImage.src);
  
  const workflowFeatures = [
    { title: 'The Counselor Dashboard', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque facilisis.' },
    { title: 'Secure Client Communication', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque facilisis.' },
    { title: 'Assessment Result Display', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque facilisis.' },
    { title: 'The Counselor Dashboard', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque facilisis.' },
    { title: 'Secure Client Communication', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque facilisis.' },
    { title: 'Assessment Result Display', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque facilisis.' },
  ];

  const handleImageClick = (imageSrc) => {
    setSelectedImage(imageSrc);
  };

  return (
    <WorkFlowSectionWrapper>
      <div className="left-content-container">
        <h2 className="workflow-heading-mob">
          Visualize Your Workflow
          <br />With MindBridge
        </h2>
        <div className="small-images-container">
          <img 
            src={workflowLeftImage1.src} 
            alt="" 
            className="small-image-placeholder" 
            onClick={() => handleImageClick(workflowLeftImage1.src)}
            style={{ cursor: 'pointer' }}
          />
          <img 
            src={workflowLeftImage2.src} 
            alt="" 
            className="small-image-placeholder" 
            onClick={() => handleImageClick(workflowLeftImage2.src)}
            style={{ cursor: 'pointer' }}
          />
          <img 
            src={workflowLeftImage3.src} 
            alt="" 
            className="small-image-placeholder" 
            onClick={() => handleImageClick(workflowLeftImage3.src)}
            style={{ cursor: 'pointer' }}
          />
          <img 
            src={workflowLeftImage4.src} 
            alt="" 
            className="small-image-placeholder" 
            onClick={() => handleImageClick(workflowLeftImage4.src)}
            style={{ cursor: 'pointer' }}
          />
        </div>
        <img src={selectedImage} alt="" className="large-image-placeholder" />
      </div>
      <div className="right-content-container">
        <h2 className="workflow-heading">
          Visualize Your Workflow
          <br />With MindBridge
        </h2>
        <CustomSwiper
          spaceBetween={30}
          slidesPerView={2.5}
          breakpoints={{
            1024: {
              slidesPerView: 2.5,
              spaceBetween: 30,
            },
            768: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            480: {
              slidesPerView: 1,
              spaceBetween: 10,
            },
          }}        
          navigation
          pagination={{ clickable: true }}
          customNextAppearance='→'
          customPrevAppearance='←'
        >
          {workflowFeatures.map((feature, index) => (
            <SwiperSlide key={index} style={{width:'256px'}}>
              <FeatureCard key={index} title={feature.title} description={feature.description} />
            </SwiperSlide>
          ))}
        </CustomSwiper>
      </div>
    </WorkFlowSectionWrapper>
  );
};

export default WorkFlowSection;
