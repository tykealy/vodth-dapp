import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import DefaultLayout from "./layouts/DefaultLayout";
import HomePage from "./pages/HomePage";
import EventPage from "./pages/events/EventsPage.tsx";
import NewEventPage from "./pages/events/EventNewPage.tsx";
import EventDetailsPage from "./pages/events/EventEditPage.tsx";
import NewCandidate from "./pages/candidates/CandidateNewPage.tsx";
import EditCandidatePage from "./pages/candidates/CandidatesEditPage.tsx";
import "@fortawesome/fontawesome-free/css/all.min.css";
import SignIn from "./auth/Login.tsx";
import CandidatesList from "./components/candidatesList/CandidateList.tsx";
import ProtectedRoute from "./components/routes/ProtectedRoute.tsx"; // Import the ProtectedRoute component

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/signin" element={<SignIn />} />
      <Route path="/" element={<ProtectedRoute element={DefaultLayout} />}>
        <Route index element={<ProtectedRoute element={HomePage} />} />
        <Route path="polls" element={<ProtectedRoute element={EventPage} />} />
        <Route
          path="polls/new"
          element={<ProtectedRoute element={NewEventPage} />}
        />
        <Route
          path="polls/:eventId"
          element={<ProtectedRoute element={EventDetailsPage} />}
        />
        <Route
          path="polls/:eventId/candidates"
          element={<ProtectedRoute element={CandidatesList} />}
        />
        <Route
          path="polls/:eventId/candidates/new"
          element={<ProtectedRoute element={NewCandidate} />}
        />
        <Route
          path="polls/:eventId/candidates/:candidateId/edit"
          element={<ProtectedRoute element={EditCandidatePage} />}
        />
      </Route>
    </>,
  ),
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
