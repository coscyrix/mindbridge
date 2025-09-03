import Link from "next/link";
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100vh;
  padding: 2rem;
`;

const OopsText = styled.h1`
  font-size: 6rem;
  font-weight: 900;
  background-color: #2563eb;
  background-size: cover;
  background-position: center;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  line-height: 1;

  @media (min-width: 768px) {
    font-size: 8rem;
  }

  @media (min-width: 1200px) {
    font-size: 10rem;
  }
`;

const Title = styled.h2`
  margin-top: 1.5rem;
  font-size: 1.5rem;
  font-weight: bold;

  @media (min-width: 768px) {
    font-size: 2rem;
  }
`;

const Message = styled.p`
  margin-top: 1rem;
  max-width: 480px;
  color: #555;
  line-height: 1.5;
  font-size: 0.9rem;
  padding: 0 1rem;

  @media (min-width: 768px) {
    font-size: 1rem;
  }
`;

const ButtonWrapper = styled.div`
  margin-top: 2rem;

  @media (min-width: 768px) {
    margin-top: 2.5rem;
  }
`;

const Button = styled.a`
  display: inline-block;
  padding: 0.75rem 1.8rem;
  border-radius: 9999px;
  background-color: #2563eb;
  color: white;
  font-weight: 600;
  text-decoration: none;
  font-size: 0.95rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: background 0.2s ease-in-out;

  &:hover {
    background-color: #1d4ed8;
  }

  @media (min-width: 768px) {
    font-size: 1rem;
    padding: 0.9rem 2.2rem;
  }
`;

export default function Custom404() {
  return (
    <Wrapper>
      <OopsText>Oops!</OopsText>
      <Title>404 - PAGE NOT FOUND</Title>
      <Message>
        The page you are looking for might have been removed, had its name
        changed, or is temporarily unavailable.
      </Message>
      <ButtonWrapper>
        <Link href="/" passHref>
          <Button>GO TO HOMEPAGE</Button>
        </Link>
      </ButtonWrapper>
    </Wrapper>
  );
}
