import React from 'react';
import { EmpoweringSectionWrapper } from '../style';
import CustomButton from '../../CustomButton';
import { CheckIcon } from '../assets/icons';
import empowermentImage1 from '../assets/images/empowerment-img-1.png';
import empowermentImage2 from '../assets/images/empowerment-img-2.png';

const EmpoweringMentalHealth = () => {
  const providerTypes = [
    { title: 'Private Practitioners', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque facilisis.', imagePlaceholder: empowermentImage1.src },
    { title: 'Clinics and Group Practices', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque facilisis.', imagePlaceholder: empowermentImage1.src },
    { title: 'Educational or Vocational Counselling Centers', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque facilisis.', imagePlaceholder: empowermentImage2.src },
    { title: 'Educational or Vocational Counselling Centers', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque facilisis.', imagePlaceholder: empowermentImage1.src }, // Assuming this is intentional based on screenshot
  ];

  return (
    <EmpoweringSectionWrapper>
      <div className="text-content-container">

        <h2 className="empowering-heading">
          Empowering Mental Health
          <br />Providers
        </h2>
        <CustomButton customClass="get-started-button" title='Get Started Free →'/>
      </div>
      <div className="provider-types-grid">
        {providerTypes.map((type, index) => (
          <div key={index} className="provider-type-item">
            <span className="provider-type-icon"><CheckIcon/></span>
            <div className="provider-type-text">
              <h4 className="provider-type-title">{type.title}</h4>
              <p className="provider-type-description">{type.description}</p>
            </div>
            <img className='provider-type-image-placeholder' src={type?.imagePlaceholder} alt='card-image'/>
          </div>
        ))}
      </div>
    </EmpoweringSectionWrapper>
  );
};

export default EmpoweringMentalHealth;
