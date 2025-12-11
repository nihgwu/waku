import adapter from 'waku/adapters/default';
import { Slot } from 'waku/minimal/client';
import App from './components/App';
import { withStyles } from './lib/inject-styles';

export default adapter({
  handleRequest: async (input, { renderRsc, renderHtml }) => {
    if (input.type === 'component') {
      return renderRsc({ App: <App name={input.rscPath || 'Waku'} /> });
    }
    if (input.type === 'custom' && input.pathname === '/') {
      return withStyles(() =>
        renderHtml({ App: <App name="Waku" /> }, <Slot id="App" />, {
          rscPath: '',
        }),
      );
    }
  },
  handleBuild: async () => {},
});
