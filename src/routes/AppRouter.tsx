import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { RequireAuth } from "../components/auth/RequireAuth";

import Home from "../pages/public/Home";
import Login from "../pages/public/Login";

import Vitrine from "../pages/storefront/Vitrine";
import Checkout from "../pages/storefront/Checkout";
import OrderConfirmation from "../pages/storefront/OrderConfirmation";

import StoreDashboard from "../pages/admin/store/Dashboard";
import Products from "../pages/admin/store/Products";
import Orders from "../pages/admin/store/Orders";
import Clients from "../pages/admin/store/Clients";
import StoreSettings from "../pages/admin/store/Settings";
import ClientEdit from "../pages/admin/store/ClientEdit";
import ProductEdit from "../pages/admin/store/ProductEdit";

import SuperDashboard from "../pages/admin/super/Dashboard";
import Companies from "../pages/admin/super/Companies";
import Subscriptions from "../pages/admin/super/Subscriptions";
import Tickets from "../pages/admin/super/Tickets";
import SuperSettings from "../pages/admin/super/Settings";

import SupportLayout from "../pages/support/Layout";
import SupportTickets from "../pages/support/Tickets";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      <Route path="/storefront" element={<Vitrine />} />
      <Route path="/storefront/checkout" element={<Checkout />} />
      <Route path="/storefront/order-confirmation" element={<OrderConfirmation />} />

      <Route path="/loja/:slug" element={<Vitrine />} />
      <Route path="/loja/:slug/checkout" element={<Checkout />} />

      <Route
        path="/admin/store"
        element={
          <RequireAuth role="empresa">
            <StoreDashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/store/products"
        element={
          <RequireAuth role="empresa">
            <Products />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/store/orders"
        element={
          <RequireAuth role="empresa">
            <Orders />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/store/clients"
        element={
          <RequireAuth role="empresa">
            <Clients />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/store/settings"
        element={
          <RequireAuth role="empresa">
            <StoreSettings />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/store/clients/:id/edit"
        element={
          <RequireAuth role="empresa">
            <ClientEdit />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/store/products/:id/edit"
        element={
          <RequireAuth role="empresa">
            <ProductEdit />
          </RequireAuth>
        }
      />

      <Route
        path="/admin/super"
        element={
          <RequireAuth role="superadmin">
            <SuperDashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/super/companies"
        element={
          <RequireAuth role="superadmin">
            <Companies />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/super/subscriptions"
        element={
          <RequireAuth role="superadmin">
            <Subscriptions />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/super/tickets"
        element={
          <RequireAuth role="superadmin">
            <Tickets />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/super/settings"
        element={
          <RequireAuth role="superadmin">
            <SuperSettings />
          </RequireAuth>
        }
      />

      <Route
        path="/support"
        element={
          <RequireAuth role="suporte">
            <SupportLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="tickets" replace />} />
        <Route path="tickets" element={<SupportTickets />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
