import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Layout from './components/layout/Layout';
import LoadingScreen from './components/ui/LoadingScreen';

const Home = lazy(() => import('./pages/Home'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const BlogList = lazy(() => import('./pages/BlogList'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProjects = lazy(() => import('./pages/admin/AdminProjects'));
const AdminBlog = lazy(() => import('./pages/admin/AdminBlog'));
const AdminSkills = lazy(() => import('./pages/admin/AdminSkills'));
const AdminServices = lazy(() => import('./pages/admin/AdminServices'));
const AdminMessages = lazy(() => import('./pages/admin/AdminMessages'));
const AdminProfile = lazy(() => import('./pages/admin/AdminProfile'));
const AdminJourney = lazy(() => import('./pages/admin/AdminJourney'));

function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="projects/:slug" element={<ProjectDetail />} />
          <Route path="blog" element={<BlogList />} />
          <Route path="blog/:slug" element={<BlogPost />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="/admin/login" element={
          <Suspense fallback={<LoadingScreen />}><AdminLogin /></Suspense>
        } />
        <Route path="/admin" element={
          <Suspense fallback={<LoadingScreen />}><AdminDashboard /></Suspense>
        } />
        <Route path="/admin/projects" element={
          <Suspense fallback={<LoadingScreen />}><AdminProjects /></Suspense>
        } />
        <Route path="/admin/blog" element={
          <Suspense fallback={<LoadingScreen />}><AdminBlog /></Suspense>
        } />
        <Route path="/admin/skills" element={
          <Suspense fallback={<LoadingScreen />}><AdminSkills /></Suspense>
        } />
        <Route path="/admin/services" element={
          <Suspense fallback={<LoadingScreen />}><AdminServices /></Suspense>
        } />
        <Route path="/admin/messages" element={
          <Suspense fallback={<LoadingScreen />}><AdminMessages /></Suspense>
        } />
        <Route path="/admin/profile" element={
          <Suspense fallback={<LoadingScreen />}><AdminProfile /></Suspense>
        } />
        <Route path="/admin/journey" element={
          <Suspense fallback={<LoadingScreen />}><AdminJourney /></Suspense>
        } />
      </Routes>
    </Suspense>
  );
}

export default App;
