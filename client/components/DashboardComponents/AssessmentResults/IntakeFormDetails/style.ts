import styled from "styled-components";

export const IntakeFormContainer = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

export const IntakeFormTitle = styled.h3`
  margin-bottom: 20px;
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
`;

export const SectionContainer = styled.div`
  margin-bottom: 30px;
`;

export const SectionHeading = styled.h4`
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
  margin-bottom: 15px;
  font-size: 1.125rem;
  font-weight: 700;
  color: #333;
`;

export const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
`;

export const FieldContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const FieldLabel = styled.strong`
  color: #374151;
  font-weight: 600;
  margin-bottom: 4px;
`;

export const FieldValue = styled.div`
  color: #111827;
  margin-top: 4px;
`;

export const TextAreaContainer = styled.div`
  margin-top: 5px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
  color: #111827;
`;

export const SymptomsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

export const SymptomTag = styled.span`
  padding: 5px 10px;
  background-color: #e3f2fd;
  border-radius: 4px;
  display: inline-block;
  color: #111827;
  font-size: 0.875rem;
`;

export const EmptyState = styled.div`
  color: #6b7280;
`;

export const SignatureContainer = styled.div`
  grid-column: 1 / -1;
`;

export const SignatureImage = styled.img`
  max-width: 300px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 10px;
`;

export const LoadingContainer = styled.div`
  text-align: center;
  padding: 20px;
`;

export const ErrorContainer = styled.div`
  text-align: center;
  padding: 20px;
  color: #6b7280;
`;

export const ButtonContainer = styled.div`
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ddd;
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;
