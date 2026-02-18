import { createRoot } from "react-dom/client";
import { Router } from "/client/router.tsx";

const root = createRoot(document.getElementById("root")!);
root.render(<Router />);
