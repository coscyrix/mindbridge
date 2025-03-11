import { useRouter } from "next/router";
import styled from "styled-components";
import { CheckIcon } from "../../public/assets/icons";

const SubmissionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f4f6f9;
  text-align: center;
`;

const Card = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 90%;
  svg {
    color: green;
  }
`;

const Title = styled.h1`
  font-size: 24px;
  color: #333;
  margin-bottom: 10px;
`;

const Message = styled.p`
  font-size: 16px;
  color: #555;
  margin-bottom: 20px;
`;

const Button = styled.button`
  background-color: #0070f3;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: 0.3s ease;

  &:hover {
    background-color: #005bb5;
  }
`;

const FormSubmission = ({ alreadySubmitted = false }) => {
  const router = useRouter();

  return (
    <SubmissionContainer>
      <Card>
        <CheckIcon />
        <Title>Thank You!</Title>
        <Message>
          {alreadySubmitted
            ? "You have already filled this treatment tools form once!"
            : `Your submission for the treatment tools form has been
          received.`}
        </Message>
      </Card>
    </SubmissionContainer>
  );
};

export default FormSubmission;
