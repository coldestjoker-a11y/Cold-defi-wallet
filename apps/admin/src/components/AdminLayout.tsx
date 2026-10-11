import React from 'react';
import ProtectedAdminRoute from './ProtectedAdminRoute';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  actionButton?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, pageTitle, actionButton }) => {
  return (
    <ProtectedAdminRoute>
      <div className="admin-root">
        <AdminNavbar />
        <div className="admin-body">
          <AdminSidebar />
          <main className="admin-main">
            {pageTitle && (
              <div className="admin-page-header">
                <div>
                  <h1 className="admin-page-title">{pageTitle}</h1>
                  <span className="admin-page-sub">Enterprise Multi-Chain DeFi Operations & Security Console</span>
                </div>
                {actionButton && <div>{actionButton}</div>}
              </div>
            )}
            <div className="admin-content-area">{children}</div>
          </main>
        </div>
      </div>
    </ProtectedAdminRoute>
  );
};

export default AdminLayout;
