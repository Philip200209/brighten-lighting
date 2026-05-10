import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public Pages
import { Home } from './pages/public/Home';
import { Shop } from './pages/public/Shop';
import { About } from './pages/public/About';
import { Contact } from './pages/public/Contact';
import { CustomerLogin } from './pages/public/CustomerLogin';
import { CustomerRegister } from './pages/public/CustomerRegister';
import { Checkout } from './pages/public/Checkout';

// Admin Pages
import { Login } from './pages/admin/Login';
import { Dashboard } from './pages/admin/Dashboard';
import { Products } from './pages/admin/Products';
import { Inquiries } from './pages/admin/Inquiries';
import { Settings } from './pages/admin/Settings';
import { Register } from './pages/admin/Register';
import { ForgotPassword } from './pages/admin/ForgotPassword';
import { ResetPassword } from './pages/admin/ResetPassword';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/checkout/:productId" element={<ProtectedRoute requireAdmin={false}><Checkout /></ProtectedRoute>} />
          <Route path="/categories" element={<Shop />} /> {/* Use Shop for categories as it has the filters */}
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/account/login" element={<CustomerLogin />} />
          <Route path="/account/register" element={<CustomerRegister />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/register" element={<Register />} />
        <Route path="/admin/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/reset-password" element={<ResetPassword />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
          <Route path="inquiries" element={<ProtectedRoute><Inquiries /></ProtectedRoute>} />
          <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
