import { Suspense } from 'react';
import { StyleRegistry } from '../lib/StyleRegistry';
import { Counter } from './Counter';
import {
  StyledButton,
  StyledCard,
  StyledMessage,
  StyledTitle,
} from './StyledButton';

const App = ({ name }: { name: string }) => {
  return (
    <html>
      <head>
        <title>Waku</title>
      </head>
      <body style={{ background: '#f5f5f5', margin: 0, padding: '20px' }}>
        <StyleRegistry>
          <StyledCard>
            <StyledTitle>Hello {name}!!</StyledTitle>
            <h3>This is a server component.</h3>
            <Suspense fallback="Pending...">
              <ServerMessage />
            </Suspense>
            <Counter />
            <StyledButton>Styled Button</StyledButton>
            <div style={{ marginTop: '16px', color: '#666' }}>
              {new Date().toISOString()}
            </div>
          </StyledCard>
        </StyleRegistry>
      </body>
    </html>
  );
};

const ServerMessage = async () => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return (
    <StyledMessage>
      Hello from server! (This styled component was streamed)
    </StyledMessage>
  );
};

export default App;
