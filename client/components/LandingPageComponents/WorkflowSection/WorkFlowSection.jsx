import React, { useState } from "react";
import { WorkFlowSectionWrapper } from "../style";
import workflowLeftImage1 from "../assets/images/workflow-left-image-1_updated.png";
import workflowLeftImage2 from "../assets/images/workflow-left-image-2_updated.png";
import workflowLeftImage3 from "../assets/images/workflow-left-image-3_updated.png";
import workflowLeftImage4 from "../assets/images/workflow-left-image-4_updated.png";
import workFlowMainImage from "../assets/images/workflow-left-image-main_updated.png";
import CustomSwiper from "../../Swiper";
import { SwiperSlide } from "swiper/react";
import FeatureCard from "./FeatureCard";
import Image from "next/image";

const WorkFlowSection = () => {
  const [selectedImage, setSelectedImage] = useState(workFlowMainImage.src);

  const workflowFeatures = [
    {
      title: "The Counselor Dashboard",
      description:
        "The MindBridge app provides an intuitive and real-time overview of key metrix and insight for counselors and administrators.",
    },
    {
      title: "Secure Client Communication",
      description:
        "Confidential messaging designed for therapy. Encrypted, private, and HIPAA-complaint.",
    },
    {
      title: "Assessment Result Display",
      description:
        "View mental health scores at a glance- PHQ-9, GAD-7, and more.",
    },
  ];

  const handleImageClick = (imageSrc) => {
    setSelectedImage(imageSrc);
  };

  return (
    <WorkFlowSectionWrapper>
      <div className="left-content-container">
        <h2 className="workflow-heading-mob">
          Visualize Your Workflow
          <br />
          With MindBridge
        </h2>
        <div className="small-images-container">
          <Image
            src={workflowLeftImage1.src}
            alt="Workflow step 1"
            className="small-image-placeholder"
            width={60}
            height={60}
            onClick={() => handleImageClick(workflowLeftImage1.src)}
            style={{ cursor: "pointer" }}
          />
          <Image
            src={workflowLeftImage2.src}
            alt="Workflow step 2"
            className="small-image-placeholder"
            width={60}
            height={60}
            onClick={() => handleImageClick(workflowLeftImage2.src)}
            style={{ cursor: "pointer" }}
          />
          <Image
            src={workflowLeftImage3.src}
            alt="Workflow step 3"
            className="small-image-placeholder"
            width={60}
            height={60}
            onClick={() => handleImageClick(workflowLeftImage3.src)}
            style={{ cursor: "pointer" }}
          />
          <Image
            src={workflowLeftImage4.src}
            alt="Workflow step 4"
            className="small-image-placeholder"
            width={60}
            height={60}
            onClick={() => handleImageClick(workflowLeftImage4.src)}
            style={{ cursor: "pointer" }}
          />
        </div>
        <Image
          src={selectedImage}
          alt="Selected workflow"
          className="large-image-placeholder"
          width={300}
          height={200}
        />
      </div>
      <div className="right-content-container">
        <h2 className="workflow-heading">
          Visualize Your Workflow
          <br />
          With MindBridge
        </h2>
        <CustomSwiper
          isBottomSwiper={true}
          spaceBetween={20}
          slidesPerView={1.2}
          breakpoints={{
            480: {
              slidesPerView: 1.3,
              spaceBetween: 10,
            },
            640: {
              slidesPerView: 1.5,
              spaceBetween: 30,
            },
            910: {
              slidesPerView: 1.7,
              spaceBetween: 35,
            },
            1040: {
              slidesPerView: 2,
              spaceBetween: 30,
            },
            1280: {
              slidesPerView: 2.3,
              spaceBetween: 35,
            },
          }}
          navigation
          pagination={{ clickable: true }}
          customNextAppearance="→"
          customPrevAppearance="←"
        >
          {workflowFeatures.map((feature, index) => (
            <SwiperSlide key={index}>
              <FeatureCard
                title={feature.title}
                description={feature.description}
              />
            </SwiperSlide>
          ))}
        </CustomSwiper>
      </div>
    </WorkFlowSectionWrapper>
  );
};

export default WorkFlowSection;
