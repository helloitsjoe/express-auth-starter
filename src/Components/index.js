import styled from 'styled-components';

export const Input = styled.input`
  margin: 0.5em 0;
  padding: 0.5em;
  width: 100%;
  border: 2px solid ${({ group }) => (group ? 'lightgray' : 'transparent')};
  border-bottom: 2px solid lightgray;
  &:focus {
    outline: none;
    border: 2px solid darkseagreen;
  }
`;

export const Button = styled.button`
  background: none;
  border: none;
  /* color: ${props => (props.secondary ? 'darkseagreen' : 'white')}; */
  color: white;

  border: 2px solid ${props => (props.secondary ? 'lightgray' : 'darkseagreen')};
  background-color: ${props => (props.secondary ? 'lightgray' : 'darkseagreen')};
  margin: 0.5em 0;
  padding: 1em;
  /* &:last-child:not(:only-child) {
    margin-left: 1em;
  } */
  width: ${props => props.fullWidth && '100%'};

  &:focus {
    outline: none;
    border: 2px solid black;
    background-color: darkseagreen;
    color: white;
    /* background-color: ${props => (props.secondary ? 'darkseagreen' : 'white')} */
  }

  &:disabled {
    background-color: lightgray;
    border: 2px solid lightgray;
  }
`;

export const TitleWrap = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const SendFormWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;
