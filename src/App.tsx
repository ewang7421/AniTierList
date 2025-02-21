import "./App.css";
import { ColorModeButton } from "@/components/ui/color-mode";
import { Provider } from "@/components/ui/provider";
import { Box, Grid } from "@chakra-ui/react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Dashboard } from "./Dashboard";

function App() {
  return (
    <Provider>
      <Box>
        <Grid minH="100vh" p={3}>
          <ColorModeButton justifySelf="flex-end" />
          <Router>
            <Routes>
              <Route path="/" element={<Dashboard />} />
            </Routes>
          </Router>
        </Grid>
      </Box>
    </Provider>
  );
}

export default App;
