import "./App.css"
import "./index.css"
import AppRouter from "./AppRouter";

// Wrap in tms-root div for CSS scoping when loaded as remote micro-frontend
const RemoteApp = () => (
    <div id="tms-root">
        <AppRouter />
    </div>
);

export default RemoteApp;
