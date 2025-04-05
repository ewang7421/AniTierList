import "./App.css";
import { ColorModeButton } from "@/components/ui/color-mode";
import { Provider } from "@/components/ui/provider";
import { Box, Grid } from "@chakra-ui/react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { LoadedUserProvider } from "@/context/LoadedUserProvider";
import { TierListModelProvider } from "./context/TierListModelProvider";
import { SettingsProvider } from "./context/SettingsProvider";

const baseUrl = import.meta.env.BASE_URL;
function App() {
  return (
    <Provider>
      <Box>
        <Grid minH="100vh" p={3}>
          <ColorModeButton justifySelf="flex-end" />
          <LoadedUserProvider>
            <TierListModelProvider>
              <SettingsProvider>
                <Router basename={baseUrl}>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                  </Routes>
                </Router>
              </SettingsProvider>
            </TierListModelProvider>
          </LoadedUserProvider>
        </Grid>
      </Box>
    </Provider>
  );
}

export default App;
